import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ticketService, Ticket, TicketHistory } from '../services/api';
import AttachmentsList from '../components/AttachmentsList';
import deleteIcon from '../media/editar-eliminar-aceptar-rechazar/eliminar.png';
import addIcon from '../media/tickets/nuevo ticket/anadir.png';
import './TicketDetail.css';

function TicketDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [availableStatuses, setAvailableStatuses] = useState<Array<{ value: string; label: string }>>([]);
  const [changingStatus, setChangingStatus] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (id) {
      loadTicket();
      loadAvailableStatuses();
    }
  }, [id]);

  const loadTicket = async () => {
    try {
      const ticketData = await ticketService.getById(id!);
      console.log('Ticket cargado:', ticketData);
      setTicket(ticketData);
      if (ticketData) {
        setSelectedStatus(ticketData.status);
      }
    } catch (error: any) {
      console.error('Error al cargar ticket:', error);
      console.error('Error details:', error.response?.data || error.message);
      if (error.response?.status === 403) {
        alert('No tienes permisos para ver este ticket');
        navigate('/');
      } else if (error.response?.status === 404) {
        alert('Ticket no encontrado');
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableStatuses = async () => {
    try {
      const response = await ticketService.getAvailableStatuses(id!);
      setAvailableStatuses(response.availableStatuses);
      setSelectedStatus(response.currentStatus);
    } catch (error) {
      console.error('Error al cargar estados disponibles:', error);
    }
  };

  const handleDelete = async () => {
    if (!ticket) return;
    
    const confirmMessage = `Â¿EstÃ¡s seguro de que deseas eliminar el ticket #${String(ticket.ticketNumber).padStart(6, '0')}?\n\nEsta acciÃ³n no se puede deshacer.`;
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      setDeleting(true);
      await ticketService.delete(ticket.id);
      alert('Ticket eliminado exitosamente');
      navigate('/');
    } catch (error: any) {
      console.error('Error al eliminar ticket:', error);
      alert(error.response?.data?.error || 'Error al eliminar el ticket');
    } finally {
      setDeleting(false);
    }
  };

  const handleStatusChange = async () => {
    if (!ticket || !selectedStatus || selectedStatus === ticket.status) return;

    if (!window.confirm(`Â¿EstÃ¡s seguro de que quieres cambiar el estado a "${selectedStatus}"?`)) {
      setSelectedStatus(ticket.status);
      return;
    }

    setChangingStatus(true);
    try {
      await ticketService.update(id!, { status: selectedStatus });
      await loadTicket();
      await loadAvailableStatuses();
      alert('Estado actualizado exitosamente');
    } catch (error: any) {
      console.error('Error al cambiar estado:', error);
      alert(error.response?.data?.error || 'Error al cambiar el estado');
      setSelectedStatus(ticket.status);
    } finally {
      setChangingStatus(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !ticket || !id || !user) return;

    setSubmitting(true);
    try {
      await ticketService.addComment(id, commentText);
      setCommentText('');
      loadTicket(); // Recargar para obtener el nuevo comentario
    } catch (error) {
      console.error('Error al agregar comentario:', error);
      alert('Error al agregar comentario');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: Ticket['status']) => {
    const badges: Record<string, { label: string; class: string }> = {
      OPEN: { label: 'Nuevo', class: 'badge-open' },
      ASSIGNED: { label: 'Asignado', class: 'badge-assigned' },
      IN_PROGRESS: { label: 'En Proceso', class: 'badge-progress' },
      PENDING: { label: 'En Espera', class: 'badge-pending' },
      RESOLVED: { label: 'Resuelto', class: 'badge-resolved' },
      CLOSED: { label: 'Cerrado', class: 'badge-closed' },
      CANCELLED: { label: 'Rechazado', class: 'badge-cancelled' },
    };
    return badges[status] || badges.OPEN;
  };

  const getPriorityBadge = (priority: Ticket['priority']) => {
    const badges: Record<string, { label: string; class: string }> = {
      LOW: { label: 'Baja', class: 'priority-low' },
      MEDIUM: { label: 'Media', class: 'priority-medium' },
      HIGH: { label: 'Alta', class: 'priority-high' },
      URGENT: { label: 'Urgente', class: 'priority-urgent' },
    };
    return badges[priority] || badges.MEDIUM;
  };

  if (loading) {
    return <div className="loading">Cargando ticket...</div>;
  }

  if (!ticket) {
    return <div className="error">Ticket no encontrado</div>;
  }

  const statusBadge = getStatusBadge(ticket.status);
  const priorityBadge = getPriorityBadge(ticket.priority);

  return (
    <div className="ticket-detail">
      <div className="ticket-detail-header">
        <button onClick={() => navigate('/')} className="btn-back">
          â† Volver
        </button>
        <div className="ticket-header-title">
          <h2>{ticket.title}</h2>
          <span className="ticket-number-badge">Ticket #{String(ticket.ticketNumber).padStart(6, '0')}</span>
        </div>
        {user?.role === 'ADMIN' && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="btn-delete"
            title="Eliminar ticket"
          >
            {deleting ? (
              'Eliminando...'
            ) : (
              <img src={deleteIcon} alt="Eliminar" className="btn-icon" />
            )}
          </button>
        )}
      </div>

      <div className="ticket-detail-content">
        <div className="ticket-main">
          <div className="ticket-info-card">
            <div className="ticket-header-info">
              <div className="status-section">
                <span className={`badge ${statusBadge.class}`}>
                  {statusBadge.label}
                </span>
                {availableStatuses.length > 0 && (user?.role === 'ADMIN' || user?.role === 'TECHNICIAN') && (
                  <div className="status-change-control">
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      disabled={changingStatus}
                      className="status-select"
                    >
                      <option value={ticket.status}>{statusBadge.label} (Actual)</option>
                      {availableStatuses.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                    {selectedStatus !== ticket.status && (
                      <button
                        onClick={handleStatusChange}
                        disabled={changingStatus}
                        className="btn btn-primary btn-sm"
                      >
                        {changingStatus ? 'Cambiando...' : 'Aplicar Cambio'}
                      </button>
                    )}
                    {selectedStatus === ticket.status && availableStatuses.length > 0 && (
                      <span className="status-hint">Selecciona un nuevo estado</span>
                    )}
                  </div>
                )}
              </div>
              <span className={`priority ${priorityBadge.class}`}>
                {priorityBadge.label}
              </span>
            </div>

            <div className="ticket-description-full">
              <h3>DescripciÃ³n</h3>
              <p>{ticket.description}</p>
            </div>

            <div className="ticket-meta-grid">
              <div className="meta-item">
                <span className="meta-label">NÃºmero de Ticket:</span>
                <span className="meta-value">
                  <code className="ticket-id-display">#{String(ticket.ticketNumber).padStart(6, '0')}</code>
                </span>
              </div>
              <div className="meta-item">
                <span className="meta-label">ID UUID:</span>
                <span className="meta-value">
                  <code className="ticket-id-display">{ticket.id}</code>
                </span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Sucursal:</span>
                <span className="meta-value">
                  {ticket.branch.name} ({ticket.branch.code}) - {ticket.branch.city}
                </span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Departamento:</span>
                <span className="meta-value">{ticket.department.name}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Solicitante:</span>
                <span className="meta-value">{ticket.requestedBy.name}</span>
              </div>
              {ticket.assignedTo && (
                <div className="meta-item">
                  <span className="meta-label">Asignado a:</span>
                  <span className="meta-value">{ticket.assignedTo.name}</span>
                </div>
              )}
              <div className="meta-item">
                <span className="meta-label">Fecha de creaciÃ³n:</span>
                <span className="meta-value">
                  {new Date(ticket.createdAt).toLocaleString('es-ES')}
                </span>
              </div>
              {ticket.category && (
                <div className="meta-item">
                  <span className="meta-label">CategorÃ­a:</span>
                  <span className="meta-value">{ticket.category}</span>
                </div>
              )}
            </div>
          </div>

          {ticket.attachments && (
            <AttachmentsList
              attachments={ticket.attachments}
              ticketId={ticket.id}
              onAttachmentsChange={loadTicket}
            />
          )}

          <div className="comments-section">
            <h3>Comentarios ({ticket.comments?.length || 0})</h3>
            
            <form onSubmit={handleAddComment} className="comment-form">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Escribe un comentario..."
                rows={3}
                required
              />
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting || !commentText.trim()}
                title="Agregar Comentario"
              >
                {submitting ? (
                  'Enviando...'
                ) : (
                  <>
                    <img src={addIcon} alt="Agregar" className="btn-icon" />
                    <span>Agregar Comentario</span>
                  </>
                )}
              </button>
            </form>

            <div className="comments-list">
              {ticket.comments && ticket.comments.length > 0 ? (
                ticket.comments.map((comment) => (
                  <div key={comment.id} className="comment-item">
                    <div className="comment-header">
                      <div className="comment-author-info">
                        <span className="comment-author">
                          {comment.user?.name || 'Usuario desconocido'}
                        </span>
                        {comment.user?.role && (
                          <span className="comment-author-role">
                            ({comment.user.role === 'ADMIN' ? 'Administrador' : 
                              comment.user.role === 'TECHNICIAN' ? 'TÃ©cnico' :
                              comment.user.role === 'USER' ? 'Usuario' :
                              comment.user.role === 'SUPERVISOR' ? 'Supervisor' :
                              comment.user.role === 'AUDITOR' ? 'Auditor' :
                              comment.user.role})
                          </span>
                        )}
                      </div>
                      <span className="comment-date">
                        {new Date(comment.createdAt).toLocaleString('es-ES')}
                      </span>
                    </div>
                    <p className="comment-content">{comment.content}</p>
                  </div>
                ))
              ) : (
                <p className="no-comments">No hay comentarios aÃºn</p>
              )}
            </div>
          </div>

          <div className="history-section">
            <h3>Historial de Cambios ({ticket.history?.length || 0})</h3>
            
            <div className="history-list">
              {ticket.history && ticket.history.length > 0 ? (
                ticket.history.map((historyItem: TicketHistory) => {
                  const getActionLabel = (action: string) => {
                    const labels: Record<string, string> = {
                      'CREATED': 'Ticket creado',
                      'STATUS_CHANGED': 'Estado cambiado',
                      'PRIORITY_CHANGED': 'Prioridad cambiada',
                      'ASSIGNED': 'Ticket asignado',
                      'DELETED': 'Ticket eliminado',
                    };
                    return labels[action] || action;
                  };

                  const getStatusLabel = (status?: string) => {
                    if (!status) return '';
                    const labels: Record<string, string> = {
                      'OPEN': 'Nuevo',
                      'ASSIGNED': 'Asignado',
                      'IN_PROGRESS': 'En Proceso',
                      'PENDING': 'En Espera',
                      'RESOLVED': 'Resuelto',
                      'CLOSED': 'Cerrado',
                      'CANCELLED': 'Rechazado',
                    };
                    return labels[status] || status;
                  };

                  const getPriorityLabel = (priority?: string) => {
                    if (!priority) return '';
                    const labels: Record<string, string> = {
                      'LOW': 'Baja',
                      'MEDIUM': 'Media',
                      'HIGH': 'Alta',
                      'URGENT': 'Urgente',
                    };
                    return labels[priority] || priority;
                  };

                  return (
                    <div key={historyItem.id} className="history-item">
                      <div className="history-header">
                        <span className="history-action">{getActionLabel(historyItem.action)}</span>
                        <span className="history-date">
                          {new Date(historyItem.createdAt).toLocaleString('es-ES')}
                        </span>
                      </div>
                      <div className="history-details">
                        {historyItem.action === 'STATUS_CHANGED' && (
                          <div className="history-change">
                            <span className="history-change-label">Estado:</span>
                            <span className="history-old-value">{getStatusLabel(historyItem.oldValue)}</span>
                            <span className="history-arrow">â†’</span>
                            <span className="history-new-value">{getStatusLabel(historyItem.newValue)}</span>
                          </div>
                        )}
                        {historyItem.action === 'PRIORITY_CHANGED' && (
                          <div className="history-change">
                            <span className="history-change-label">Prioridad:</span>
                            <span className="history-old-value">{getPriorityLabel(historyItem.oldValue)}</span>
                            <span className="history-arrow">â†’</span>
                            <span className="history-new-value">{getPriorityLabel(historyItem.newValue)}</span>
                          </div>
                        )}
                        {historyItem.action === 'ASSIGNED' && (
                          <div className="history-change">
                            <span className="history-change-label">AsignaciÃ³n:</span>
                            <span className="history-old-value">{historyItem.oldValue === 'UNASSIGNED' ? 'Sin asignar' : historyItem.oldValue}</span>
                            <span className="history-arrow">â†’</span>
                            <span className="history-new-value">{historyItem.newValue === 'UNASSIGNED' ? 'Sin asignar' : historyItem.newValue}</span>
                          </div>
                        )}
                        {historyItem.action === 'CREATED' && (
                          <div className="history-change">
                            <span className="history-change-label">Estado inicial:</span>
                            <span className="history-new-value">{getStatusLabel(historyItem.newValue)}</span>
                          </div>
                        )}
                        {historyItem.action === 'DELETED' && (
                          <div className="history-change">
                            <span className="history-change-label">Ticket eliminado:</span>
                            <span className="history-new-value" style={{ color: '#dc2626', fontWeight: 'bold' }}>
                              El ticket fue eliminado por un administrador
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="history-agent">
                        <span className="history-agent-label">Agente:</span>
                        <span className="history-agent-name">{historyItem.changedByUser.name}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="no-history">No hay historial de cambios aÃºn</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TicketDetail;


