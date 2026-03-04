import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../hooks/useSocket';
import { notificationService } from '../services/api';
import notificationIcon from '../media/notificacion/notificacion.png';
import './NotificationBell.css';

interface Notification {
  id: string;
  ticketId: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  ticket?: {
    id: string;
    title: string;
    status: string;
  };
}

function NotificationBell() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const socket = useSocket();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    loadNotifications();
  }, [user]);

  useEffect(() => {
    if (!socket) return;

    // Escuchar notificaciones en tiempo real
    socket.on('ticket-notification', (data: any) => {
      console.log('New notification received:', data);
      // Recargar notificaciones
      loadNotifications();
    });

    return () => {
      socket.off('ticket-notification');
    };
  }, [socket]);

  const loadNotifications = async () => {
    try {
      const response = await notificationService.getAll();
      setNotifications(response.notifications || []);
      setUnreadCount(response.unreadCount || 0);
    } catch (error: any) {
      console.error('Error loading notifications:', error);
      console.error('Error details:', error.response?.data || error.message);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    if (notification.ticketId) {
      navigate(`/tickets/${notification.ticketId}`);
    } else {
      console.warn('Notificación sin ticketId:', notification);
      alert('Esta notificación está asociada a un ticket que ya no existe.');
    }
    setIsOpen(false);
  };

  if (!user) return null;

  return (
    <div className="notification-bell-container">
      <button
        className="notification-bell-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notificaciones"
      >
        <img src={notificationIcon} alt="Notificaciones" className="bell-icon-img" />
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="notification-backdrop" onClick={() => setIsOpen(false)} />
          <div className="notification-dropdown">
            <div className="notification-header">
              <h3>Notificaciones</h3>
              {unreadCount > 0 && (
                <button
                  className="mark-all-read-btn"
                  onClick={markAllAsRead}
                >
                  Marcar todas como leídas
                </button>
              )}
            </div>

            <div className="notification-list">
              {loading ? (
                <div className="notification-loading">Cargando...</div>
              ) : notifications.length === 0 ? (
                <div className="notification-empty">No hay notificaciones</div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="notification-content">
                      <div className="notification-title">{notification.title}</div>
                      <div className="notification-message">{notification.message}</div>
                      <div className="notification-time">
                        {new Date(notification.createdAt).toLocaleString('es-ES')}
                      </div>
                    </div>
                    {!notification.isRead && (
                      <div className="unread-indicator" />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default NotificationBell;

