import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ticketService, TicketStats, Ticket } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import './Statistics.css';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

function Statistics() {
  const { user } = useAuth();
  const [stats, setStats] = useState<TicketStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchType, setSearchType] = useState<string>('all');
  const [searchTimeout, setSearchTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    // Solo cargar si hay algún filtro activo
    if (filterStatus || (searchQuery && searchQuery.trim())) {
      loadFilteredTickets();
    } else if (!searchQuery && !filterStatus) {
      setFilteredTickets([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus, searchType]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const statsData = await ticketService.getStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
      alert('Error al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  };

  const loadFilteredTickets = async () => {
    try {
      setLoadingTickets(true);
      const params: any = {};
      if (filterStatus) {
        params.status = filterStatus;
      }
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
        params.searchType = searchType;
      }
      const tickets = await ticketService.getAll(params);
      setFilteredTickets(tickets);
    } catch (error) {
      console.error('Error al cargar tickets filtrados:', error);
      alert('Error al cargar tickets');
    } finally {
      setLoadingTickets(false);
    }
  };


  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  const getStatusBadge = (status: string) => {
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

  const getPriorityBadge = (priority: string) => {
    const badges: Record<string, { label: string; class: string }> = {
      LOW: { label: 'Baja', class: 'priority-low' },
      MEDIUM: { label: 'Media', class: 'priority-medium' },
      HIGH: { label: 'Alta', class: 'priority-high' },
      URGENT: { label: 'Urgente', class: 'priority-urgent' },
    };
    return badges[priority] || badges.MEDIUM;
  };

  if (loading) {
    return <div className="loading">Cargando estadísticas...</div>;
  }

  if (!stats) {
    return <div className="error">Error al cargar estadísticas</div>;
  }

  // Determinar el título según el rol del usuario
  const getStatisticsTitle = () => {
    if (user?.role === 'USER') {
      return 'Mis Estadísticas de Tickets';
    } else if (user?.role === 'SUPERVISOR') {
      return 'Estadísticas de Mi Sucursal';
    } else if (user?.role === 'TECHNICIAN') {
      return 'Estadísticas de Mis Tickets';
    } else {
      return 'Estadísticas de Tickets';
    }
  };

  return (
    <div className="statistics-container">
      <div className="statistics-header">
        <div>
          <h2>{getStatisticsTitle()}</h2>
          {user?.role === 'USER' && (
            <p className="statistics-subtitle">
              Estas son las estadísticas de tus propios tickets
            </p>
          )}
        </div>
        <button onClick={loadStats} className="btn btn-primary">
          Actualizar
        </button>
      </div>

      {/* Estadísticas principales */}
      <div className="stats-grid">
        <div className="stat-card stat-card-primary">
          <h3>Total de Tickets</h3>
          <p className="stat-value">{stats.total}</p>
        </div>

        <div className="stat-card stat-card-success">
          <h3>Resueltos</h3>
          <p className="stat-value">
            {stats.byStatus.find(s => s.status === 'RESOLVED')?.count || 0}
          </p>
        </div>

        <div className="stat-card stat-card-warning">
          <h3>En Progreso</h3>
          <p className="stat-value">
            {stats.byStatus.find(s => s.status === 'IN_PROGRESS')?.count || 0}
          </p>
        </div>

        <div className="stat-card stat-card-info">
          <h3>Nuevos</h3>
          <p className="stat-value">
            {stats.byStatus.find(s => s.status === 'OPEN')?.count || 0}
          </p>
        </div>

        <div className="stat-card stat-card-secondary">
          <h3>Cerrados</h3>
          <p className="stat-value">
            {stats.byStatus.find(s => s.status === 'CLOSED')?.count || 0}
          </p>
        </div>
      </div>

      {/* Buscador */}
      <div className="search-section">
        <h3>Buscar Tickets</h3>
        <div className="search-input-container">
          <select
            className="search-type-select"
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
          >
            <option value="all">Todos los campos</option>
            <option value="ticketNumber">Número de Ticket (6 dígitos)</option>
            <option value="title">Título</option>
            <option value="description">Descripción</option>
            <option value="user">Usuario (nombre o email)</option>
            <option value="branch">Sucursal (nombre o código)</option>
          </select>
          <input
            type="text"
            className="search-input"
            placeholder={
              searchType === 'ticketNumber' 
                ? "Ingrese el número de ticket (ej: 123456)" 
                : searchType === 'title'
                ? "Buscar por título..."
                : searchType === 'description'
                ? "Buscar por descripción..."
                : searchType === 'user'
                ? "Buscar por nombre o email de usuario..."
                : searchType === 'branch'
                ? "Buscar por nombre o código de sucursal..."
                : "Buscar en todos los campos..."
            }
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (searchTimeout) {
                clearTimeout(searchTimeout);
              }
              const timeout = setTimeout(() => {
                if (e.target.value.trim() || filterStatus) {
                  loadFilteredTickets();
                } else {
                  setFilteredTickets([]);
                }
              }, 500);
              setSearchTimeout(timeout);
            }}
          />
          {searchQuery && (
            <button
              className="clear-search-btn"
              onClick={() => {
                setSearchQuery('');
                setFilteredTickets([]);
                if (searchTimeout) {
                  clearTimeout(searchTimeout);
                }
              }}
            >
              ✕
            </button>
          )}
        </div>
        <p className="search-hint">
          {searchType === 'ticketNumber' 
            ? "Ingrese el número de ticket completo de 6 dígitos (ej: 123456)"
            : searchType === 'title'
            ? "Buscará en el título del ticket"
            : searchType === 'description'
            ? "Buscará en la descripción del ticket"
            : searchType === 'user'
            ? "Buscará en el nombre o email del solicitante o técnico asignado"
            : searchType === 'branch'
            ? "Buscará en el nombre o código de la sucursal"
            : "Buscará en todos los campos: título, descripción, usuario, sucursal, etc."}
        </p>
      </div>

      {/* Filtros por estado */}
      <div className="filters-section">
        <h3>Filtrar por Estado</h3>
        <div className="filter-buttons">
          <button
            className={`filter-btn ${filterStatus === '' ? 'active' : ''}`}
            onClick={() => setFilterStatus('')}
          >
            Todos
          </button>
          <button
            className={`filter-btn ${filterStatus === 'CLOSED' ? 'active' : ''}`}
            onClick={() => setFilterStatus('CLOSED')}
          >
            Terminados ({stats.byStatus.find(s => s.status === 'CLOSED')?.count || 0})
          </button>
          <button
            className={`filter-btn ${filterStatus === 'RESOLVED' ? 'active' : ''}`}
            onClick={() => setFilterStatus('RESOLVED')}
          >
            Resueltos ({stats.byStatus.find(s => s.status === 'RESOLVED')?.count || 0})
          </button>
          <button
            className={`filter-btn ${filterStatus === 'IN_PROGRESS' ? 'active' : ''}`}
            onClick={() => setFilterStatus('IN_PROGRESS')}
          >
            En Progreso ({stats.byStatus.find(s => s.status === 'IN_PROGRESS')?.count || 0})
          </button>
          <button
            className={`filter-btn ${filterStatus === 'OPEN' ? 'active' : ''}`}
            onClick={() => setFilterStatus('OPEN')}
          >
            Nuevos ({stats.byStatus.find(s => s.status === 'OPEN')?.count || 0})
          </button>
        </div>
      </div>

      {/* Historial completo de tickets */}
      {(filterStatus || searchQuery || filteredTickets.length > 0) && (
        <div className="tickets-history-section">
          <h3>
            {filterStatus
              ? `Tickets ${getStatusBadge(filterStatus).label}`
              : searchQuery
              ? `Resultados de búsqueda: "${searchQuery}"`
              : 'Historial Completo de Tickets'}
            {loadingTickets && <span className="loading-indicator">Cargando...</span>}
          </h3>
          {loadingTickets ? (
            <div className="loading">Cargando tickets...</div>
          ) : filteredTickets.length > 0 ? (
            <div className="tickets-list">
              {filteredTickets.map((ticket) => {
                const statusBadge = getStatusBadge(ticket.status);
                const priorityBadge = getPriorityBadge(ticket.priority);
                return (
                  <Link 
                    key={ticket.id} 
                    to={`/tickets/${ticket.id}`} 
                    className="ticket-card ticket-card-clickable"
                  >
                    <div className="ticket-card-header">
                      <div className="ticket-title-container">
                        <h3 className="ticket-title">{ticket.title}</h3>
                        <span className="ticket-id">Ticket #{String(ticket.ticketNumber).padStart(6, '0')}</span>
                      </div>
                      <span className={`badge ${statusBadge.class}`}>
                        {statusBadge.label}
                      </span>
                    </div>
                    <div className="ticket-card-body">
                      <p className="ticket-description">{ticket.description}</p>
                      <div className="ticket-meta">
                        <span className="meta-item">
                          <strong>Número de Ticket:</strong> <code className="ticket-id-full">#{String(ticket.ticketNumber).padStart(6, '0')}</code>
                        </span>
                        <span className="meta-item">
                          <strong>ID UUID:</strong> <code className="ticket-id-full">{ticket.id}</code>
                        </span>
                        <span className="meta-item">
                          <strong>Sucursal:</strong> {ticket.branch.name} ({ticket.branch.code})
                        </span>
                        <span className="meta-item">
                          <strong>Departamento:</strong> {ticket.department.name}
                        </span>
                        <span className="meta-item">
                          <strong>Solicitante:</strong> {ticket.requestedBy.name}
                        </span>
                        {ticket.assignedTo && (
                          <span className="meta-item">
                            <strong>Asignado a:</strong> {ticket.assignedTo.name}
                          </span>
                        )}
                        <span className="meta-item">
                          <strong>Prioridad:</strong>{' '}
                          <span className={`priority ${priorityBadge.class}`}>
                            {priorityBadge.label}
                          </span>
                        </span>
                        <span className="meta-item">
                          <strong>Fecha:</strong>{' '}
                          {new Date(ticket.createdAt).toLocaleString('es-ES')}
                        </span>
                      </div>
                    </div>
                    <div className="ticket-card-footer">
                      <span className="view-details-link">Ver detalles y acciones →</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <p className="no-tickets">No hay tickets con este filtro</p>
          )}
        </div>
      )}

      {/* Gráficos de Estadísticas */}
      {stats && stats.byStatus && stats.byStatus.length > 0 && (
      <div className="charts-section">
        <h2 className="charts-title">Gráficos de Estadísticas</h2>
        
        <div className="charts-grid">
          {/* Gráfico de Barras - Por Estado */}
          {stats.byStatus.length > 0 && (
          <div className="chart-container">
            <h3>Tickets por Estado</h3>
            <div className="chart-wrapper">
            <Bar
              data={{
                labels: stats.byStatus.map(item => item.label || item.status),
                datasets: [
                  {
                    label: 'Cantidad de Tickets',
                    data: stats.byStatus.map(item => item.count || 0),
                    backgroundColor: [
                      'rgba(59, 130, 246, 0.8)',   // OPEN - Azul
                      'rgba(147, 51, 234, 0.8)',   // ASSIGNED - Morado
                      'rgba(251, 191, 36, 0.8)',   // IN_PROGRESS - Amarillo
                      'rgba(249, 115, 22, 0.8)',   // PENDING - Naranja
                      'rgba(34, 197, 94, 0.8)',    // RESOLVED - Verde
                      'rgba(107, 114, 128, 0.8)',  // CLOSED - Gris
                      'rgba(239, 68, 68, 0.8)',    // CANCELLED - Rojo
                    ],
                    borderColor: [
                      'rgba(59, 130, 246, 1)',
                      'rgba(147, 51, 234, 1)',
                      'rgba(251, 191, 36, 1)',
                      'rgba(249, 115, 22, 1)',
                      'rgba(34, 197, 94, 1)',
                      'rgba(107, 114, 128, 1)',
                      'rgba(239, 68, 68, 1)',
                    ],
                    borderWidth: 2,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                  title: {
                    display: false,
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        return `${context.parsed.y} tickets`;
                      }
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      stepSize: 1,
                    },
                  },
                },
              }}
            />
            </div>
          </div>
          )}

          {/* Gráfico de Barras - Por Prioridad */}
          {stats.byPriority && stats.byPriority.length > 0 && (
          <div className="chart-container">
            <h3>Tickets por Prioridad</h3>
            <div className="chart-wrapper">
            <Bar
              data={{
                labels: stats.byPriority.map(item => {
                  const priorityLabels: Record<string, string> = {
                    LOW: 'Baja',
                    MEDIUM: 'Media',
                    HIGH: 'Alta',
                    URGENT: 'Urgente',
                  };
                  return priorityLabels[item.priority] || item.priority;
                }),
                datasets: [
                  {
                    label: 'Cantidad de Tickets',
                    data: stats.byPriority.map(item => item.count || 0),
                    backgroundColor: [
                      'rgba(34, 197, 94, 0.8)',    // LOW - Verde
                      'rgba(251, 191, 36, 0.8)',   // MEDIUM - Amarillo
                      'rgba(249, 115, 22, 0.8)',   // HIGH - Naranja
                      'rgba(239, 68, 68, 0.8)',    // URGENT - Rojo
                    ],
                    borderColor: [
                      'rgba(34, 197, 94, 1)',
                      'rgba(251, 191, 36, 1)',
                      'rgba(249, 115, 22, 1)',
                      'rgba(239, 68, 68, 1)',
                    ],
                    borderWidth: 2,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                  title: {
                    display: false,
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        return `${context.parsed.y} tickets`;
                      }
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      stepSize: 1,
                    },
                  },
                },
              }}
            />
            </div>
          </div>
          )}

          {/* Gráfico de Torta - Por Sucursal */}
          {stats.byBranch.filter(item => item.branch && item.count > 0).length > 0 && (
            <div className="chart-container">
              <h3>Distribución por Sucursal</h3>
              <div className="chart-wrapper">
              <Pie
                data={{
                  labels: stats.byBranch
                    .filter(item => item.branch && item.count > 0)
                    .map(item => `${item.branch?.name} (${item.branch?.code})`),
                  datasets: [
                    {
                      label: 'Cantidad de Tickets',
                      data: stats.byBranch
                        .filter(item => item.branch && item.count > 0)
                        .map(item => item.count || 0),
                      backgroundColor: [
                        'rgba(239, 68, 68, 0.8)',
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(34, 197, 94, 0.8)',
                        'rgba(251, 191, 36, 0.8)',
                        'rgba(147, 51, 234, 0.8)',
                        'rgba(249, 115, 22, 0.8)',
                        'rgba(236, 72, 153, 0.8)',
                        'rgba(14, 165, 233, 0.8)',
                      ],
                      borderColor: [
                        'rgba(239, 68, 68, 1)',
                        'rgba(59, 130, 246, 1)',
                        'rgba(34, 197, 94, 1)',
                        'rgba(251, 191, 36, 1)',
                        'rgba(147, 51, 234, 1)',
                        'rgba(249, 115, 22, 1)',
                        'rgba(236, 72, 153, 1)',
                        'rgba(14, 165, 233, 1)',
                      ],
                      borderWidth: 2,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom' as const,
                      labels: {
                        boxWidth: 12,
                        padding: 8,
                        font: {
                          size: 11,
                        },
                      },
                    },
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          const label = context.label || '';
                          const value = context.parsed || 0;
                          const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                          const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
                          return `${label}: ${value} tickets (${percentage}%)`;
                        }
                      }
                    }
                  },
                }}
              />
              </div>
            </div>
          )}

          {/* Gráfico de Torta - Por Departamento */}
          {stats.byDepartment && stats.byDepartment.filter(item => item.department && item.count > 0).length > 0 && (
            <div className="chart-container">
              <h3>Distribución por Departamento</h3>
              <div className="chart-wrapper">
              <Pie
                data={{
                  labels: stats.byDepartment
                    .filter(item => item.department && item.count > 0)
                    .map(item => item.department?.name || 'Sin departamento'),
                  datasets: [
                    {
                      label: 'Cantidad de Tickets',
                      data: stats.byDepartment
                        .filter(item => item.department && item.count > 0)
                        .map(item => item.count || 0),
                      backgroundColor: [
                        'rgba(239, 68, 68, 0.8)',
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(34, 197, 94, 0.8)',
                        'rgba(251, 191, 36, 0.8)',
                        'rgba(147, 51, 234, 0.8)',
                        'rgba(249, 115, 22, 0.8)',
                        'rgba(236, 72, 153, 0.8)',
                        'rgba(14, 165, 233, 0.8)',
                        'rgba(168, 85, 247, 0.8)',
                        'rgba(20, 184, 166, 0.8)',
                      ],
                      borderColor: [
                        'rgba(239, 68, 68, 1)',
                        'rgba(59, 130, 246, 1)',
                        'rgba(34, 197, 94, 1)',
                        'rgba(251, 191, 36, 1)',
                        'rgba(147, 51, 234, 1)',
                        'rgba(249, 115, 22, 1)',
                        'rgba(236, 72, 153, 1)',
                        'rgba(14, 165, 233, 1)',
                        'rgba(168, 85, 247, 1)',
                        'rgba(20, 184, 166, 1)',
                      ],
                      borderWidth: 2,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom' as const,
                      labels: {
                        boxWidth: 12,
                        padding: 8,
                        font: {
                          size: 11,
                        },
                      },
                    },
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          const label = context.label || '';
                          const value = context.parsed || 0;
                          const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                          const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
                          return `${label}: ${value} tickets (${percentage}%)`;
                        }
                      }
                    }
                  },
                }}
              />
              </div>
            </div>
          )}
        </div>
      </div>
      )}

      {/* Estadísticas detalladas (tabla de texto) */}
      <div className="detailed-stats">
        <h2 className="detailed-stats-title">Estadísticas Detalladas</h2>
        <div className="detailed-stats-grid">
          <div className="stats-section">
            <h3>Por Estado</h3>
            <div className="stats-list">
              {stats.byStatus.map((item) => (
                <div key={item.status} className="stats-item">
                  <span className="stats-label">{item.label}:</span>
                  <span className="stats-count">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="stats-section">
            <h3>Por Prioridad</h3>
            <div className="stats-list">
              {stats.byPriority.map((item) => (
                <div key={item.priority} className="stats-item">
                  <span className="stats-label">
                    {item.priority === 'LOW' ? 'Baja' : 
                     item.priority === 'MEDIUM' ? 'Media' : 
                     item.priority === 'HIGH' ? 'Alta' : 'Urgente'}:
                  </span>
                  <span className="stats-count">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          {stats.byBranch.length > 0 && (
            <div className="stats-section">
              <h3>Por Sucursal</h3>
              <div className="stats-list">
                {stats.byBranch
                  .filter((item) => item.branch)
                  .map((item) => (
                    <div key={item.branchId} className="stats-item">
                      <span className="stats-label">
                        {item.branch?.name} ({item.branch?.code}):
                      </span>
                      <span className="stats-count">{item.count}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {stats.byDepartment.length > 0 && (
            <div className="stats-section">
              <h3>Por Departamento</h3>
              <div className="stats-list">
                {stats.byDepartment
                  .filter((item) => item.department)
                  .map((item) => (
                    <div key={item.departmentId} className="stats-item">
                      <span className="stats-label">{item.department?.name}:</span>
                      <span className="stats-count">{item.count}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tickets recientes */}
      {stats.recentTickets.length > 0 && !filterStatus && (
        <div className="recent-tickets-section">
          <h3>Tickets Recientes</h3>
          <div className="tickets-list">
            {stats.recentTickets.map((ticket) => {
              const statusBadge = getStatusBadge(ticket.status);
              return (
                <Link 
                  key={ticket.id} 
                  to={`/tickets/${ticket.id}`} 
                  className="ticket-card ticket-card-clickable"
                >
                    <div className="ticket-card-header">
                      <div className="ticket-title-container">
                        <h3 className="ticket-title">{ticket.title}</h3>
                        <span className="ticket-id">Ticket #{String(ticket.ticketNumber).padStart(6, '0')}</span>
                      </div>
                      <span className={`badge ${statusBadge.class}`}>
                        {statusBadge.label}
                      </span>
                    </div>
                    <div className="ticket-card-body">
                      <p className="ticket-description">{ticket.description}</p>
                      <div className="ticket-meta">
                        <span className="meta-item">
                          <strong>Número de Ticket:</strong> <code className="ticket-id-full">#{String(ticket.ticketNumber).padStart(6, '0')}</code>
                        </span>
                        <span className="meta-item">
                          <strong>ID UUID:</strong> <code className="ticket-id-full">{ticket.id}</code>
                        </span>
                        <span className="meta-item">
                          <strong>Creado por:</strong> {ticket.requestedBy.name}
                        </span>
                        <span className="meta-item">
                          <strong>Fecha:</strong>{' '}
                          {new Date(ticket.createdAt).toLocaleString('es-ES')}
                        </span>
                      </div>
                    </div>
                    <div className="ticket-card-footer">
                      <span className="view-details-link">Ver detalles y acciones →</span>
                    </div>
                  </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default Statistics;

