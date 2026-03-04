import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import NotificationBell from './NotificationBell';
import ChangePasswordModal from './ChangePasswordModal';
import logo from '../media/etkTicketing.webp';
// Iconos de Tickets
import ticketIcon from '../media/tickets/boleto.png';
import ticketListIcon from '../media/tickets/lista de tickets/portapapeles.png';
import newTicketIcon from '../media/tickets/nuevo ticket/anadir.png';
// Iconos de Reportes
import reportsIcon from '../media/reports/analitica.png';
import statisticsIcon from '../media/reports/estadistica/grafico-de-barras.png';
import exportIcon from '../media/reports/exportar/exportar-archivo.png';
// Iconos de Administración
import administrationIcon from '../media/administracion/administracion-de-tareas.png';
import usersIcon from '../media/administracion/users/avatar.png';
import addUserIcon from '../media/administracion/nuevo usuario/agregar-usuario.png';
import requestsIcon from '../media/administracion/solicitudes de registro/lealtad.png';
import logsIcon from '../media/administracion/logs de sistema/relacional.png';
// Icono de Cerrar Sesión
import logoutIcon from '../media/cerrarsesion/cerrar-sesion.png';
// Icono de cambio de tema
import themeToggleIcon from '../media/editar-eliminar-aceptar-rechazar/darkorwhithe.png';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
}

function Layout({ children }: LayoutProps) {
  const { user, logout, canManageUsers, canManageConfig } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    tickets: true,
    administration: false,
    reports: false,
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleLabel = (role: string) => {
    const roles: Record<string, string> = {
      ADMIN: 'Administrador',
      TECHNICIAN: 'Técnico',
      USER: 'Usuario',
      SUPERVISOR: 'Supervisor',
      AUDITOR: 'Auditor',
    };
    return roles[role] || role;
  };

  const toggleMenu = (menu: string) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menu]: !prev[menu]
    }));
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  if (!user) {
  return (
    <div className="layout">
        <header className="header-simple">
          <div className="container">
          <Link to="/" className="logo-link-simple">
            <img src={logo} alt="ETK Ticketing" className="logo-img-simple" />
            <h1 className="logo-simple">Sistema de Tickets</h1>
          </Link>
            <div className="auth-links">
              <Link to="/request-register" className="btn-register">Solicitar Registro</Link>
              <Link to="/login" className="btn-login">Iniciar Sesión</Link>
            </div>
          </div>
        </header>
        <main className="main-simple">
        <div className="container">
            {children}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="layout-vertical">
      {/* Header Superior */}
      <header className="top-header">
        <div className="top-header-content">
          <div className="top-header-left">
            {/* Espacio para futuras opciones */}
          </div>
          <div className="top-header-right">
            <button
              onClick={toggleTheme}
              className="theme-toggle-btn"
              title={theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
              aria-label={theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
            >
              <img 
                src={themeToggleIcon} 
                alt={theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'} 
                className="theme-toggle-icon"
              />
            </button>
            <NotificationBell />
            <div className="user-menu">
              <div className="user-menu-info">
                <div className="user-avatar-small">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="user-menu-details">
                  <span className="user-menu-name">{user.name}</span>
                  <span className="user-menu-role">{getRoleLabel(user.role)}</span>
                </div>
              </div>
              <button 
                onClick={() => setShowChangePasswordModal(true)} 
                className="btn-change-password-small"
                title="Cambiar contraseña"
              >
                <span className="password-icon-small">🔒</span>
              </button>
              <button onClick={handleLogout} className="btn-logout-small" title="Cerrar sesión">
                <img 
                  src={logoutIcon} 
                  alt="Cerrar sesión" 
                  className="logout-icon-img"
                  onError={(e) => {
                    console.error('Error loading logout icon:', logoutIcon);
                    // Fallback: mostrar un emoji si la imagen no carga
                    (e.target as HTMLImageElement).style.display = 'none';
                    const button = (e.target as HTMLElement).parentElement;
                    if (button && !button.querySelector('.logout-icon-fallback')) {
                      const fallback = document.createElement('span');
                      fallback.className = 'logout-icon-fallback';
                      fallback.textContent = '🚪';
                      fallback.style.fontSize = '18px';
                      button.appendChild(fallback);
                    }
                  }}
                />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Modal de cambio de contraseña propia */}
      <ChangePasswordModal
        isOpen={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
      />

      {/* Botón de menú móvil */}
      <button 
        className="mobile-menu-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle menu"
      >
        <span className="mobile-menu-icon">☰</span>
      </button>

      {/* Overlay para móviles */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <Link to="/" className="logo-link">
            <img 
              src={logo} 
              alt="ETK Ticketing" 
              className="logo-img"
              onError={(e) => {
                console.error('Error loading logo:', logo);
                // Fallback si la imagen no carga
                (e.target as HTMLImageElement).style.display = 'none';
              }}
              onLoad={() => {
                console.log('Logo loaded successfully');
              }}
            />
            <h1 className="logo-text">Sistema de Tickets</h1>
          </Link>
        </div>

        <nav className="sidebar-nav">
          {/* Menú Principal - Tickets */}
          <div className="menu-section">
            <button 
              className="menu-toggle"
              onClick={() => toggleMenu('tickets')}
            >
              <img src={ticketIcon} alt="Tickets" className="menu-icon-img" />
              <span className="menu-label">Tickets</span>
              <span className="menu-arrow">{expandedMenus.tickets ? '▼' : '▶'}</span>
            </button>
            {expandedMenus.tickets && (
              <div className="menu-items">
                <Link 
                  to="/" 
                  className={`menu-item ${isActive('/') ? 'active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <img src={ticketListIcon} alt="Lista de Tickets" className="menu-item-icon-img" />
                  <span>Lista de Tickets</span>
                </Link>
                <Link 
                  to="/tickets/new" 
                  className={`menu-item ${isActive('/tickets/new') ? 'active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <img src={newTicketIcon} alt="Nuevo Ticket" className="menu-item-icon-img" />
                  <span>Nuevo Ticket</span>
                </Link>
              </div>
            )}
          </div>

          {/* Menú de Reportes y Estadísticas */}
          {(user.role === 'ADMIN' || user.role === 'SUPERVISOR' || user.role === 'AUDITOR' || user.role === 'TECHNICIAN') && (
            <div className="menu-section">
              <button 
                className="menu-toggle"
                onClick={() => toggleMenu('reports')}
              >
                <img src={reportsIcon} alt="Reportes" className="menu-icon-img" />
                <span className="menu-label">Reportes</span>
                <span className="menu-arrow">{expandedMenus.reports ? '▼' : '▶'}</span>
              </button>
              {expandedMenus.reports && (
                <div className="menu-items">
                  <Link 
                    to="/statistics" 
                    className={`menu-item ${isActive('/statistics') ? 'active' : ''}`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <img src={statisticsIcon} alt="Estadísticas" className="menu-item-icon-img" />
                    <span>Estadísticas</span>
                  </Link>
                  <Link 
                    to="/export" 
                    className={`menu-item ${isActive('/export') ? 'active' : ''}`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <img src={exportIcon} alt="Exportar" className="menu-item-icon-img" />
                    <span>Exportar</span>
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Menú de Administración */}
          {(canManageUsers() || canManageConfig() || user.role === 'SUPERVISOR') && (
            <div className="menu-section">
              <button 
                className="menu-toggle"
                onClick={() => toggleMenu('administration')}
              >
                <img src={administrationIcon} alt="Administración" className="menu-icon-img" />
                <span className="menu-label">Administración</span>
                <span className="menu-arrow">{expandedMenus.administration ? '▼' : '▶'}</span>
              </button>
              {expandedMenus.administration && (
                <div className="menu-items">
                  {canManageUsers() && (
                    <>
                      <Link 
                        to="/users" 
                        className={`menu-item ${isActive('/users') ? 'active' : ''}`}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <img src={usersIcon} alt="Usuarios" className="menu-item-icon-img" />
                        <span>Usuarios</span>
                      </Link>
                      <Link 
                        to="/users/new" 
                        className={`menu-item ${isActive('/users/new') ? 'active' : ''}`}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <img src={addUserIcon} alt="Registrar Usuario" className="menu-item-icon-img" />
                        <span>Registrar Usuario</span>
                      </Link>
                      <Link 
                        to="/user-requests" 
                        className={`menu-item ${isActive('/user-requests') ? 'active' : ''}`}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <img src={requestsIcon} alt="Solicitudes" className="menu-item-icon-img" />
                        <span>Solicitudes</span>
                      </Link>
                    </>
                  )}
                  {/* TODO: Implementar página de usuarios de sucursal */}
                  {/* {user.role === 'SUPERVISOR' && (
                    <Link 
                      to="/branch-users" 
                      className={`menu-item ${isActive('/branch-users') ? 'active' : ''}`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <img src={branchUsersIcon} alt="Usuarios Sucursal" className="menu-item-icon-img" />
                      <span>Usuarios Sucursal</span>
                    </Link>
                  )} */}
                  {canManageConfig() && (
                    <>
                      <Link 
                        to="/logs" 
                        className={`menu-item ${isActive('/logs') ? 'active' : ''}`}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <img src={logsIcon} alt="Historial de cambios" className="menu-item-icon-img" />
                        <span>Historial de cambios</span>
                      </Link>
                      {/* TODO: Implementar páginas de gestión de sucursales y departamentos */}
                      {/* <Link 
                        to="/branches" 
                        className={`menu-item ${isActive('/branches') ? 'active' : ''}`}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <img src={branchesIcon} alt="Sucursales" className="menu-item-icon-img" />
                        <span>Sucursales</span>
                      </Link>
                      <Link 
                        to="/departments" 
                        className={`menu-item ${isActive('/departments') ? 'active' : ''}`}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <img src={departmentsIcon} alt="Departamentos" className="menu-item-icon-img" />
                        <span>Departamentos</span>
                      </Link> */}
                    </>
                  )}
                </div>
              )}
            </div>
          )}
          </nav>

        <div className="sidebar-footer">
          {/* Footer simplificado - solo información del usuario si es necesario */}
        </div>
      </aside>

      <main className="main-content">
        <div className="main-container">
          {children}
        </div>
      </main>
    </div>
  );
}

export default Layout;
