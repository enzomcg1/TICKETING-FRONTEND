import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ticketService, CombinedHistoryEvent } from '../services/api';
import './Logs.css';

function Logs() {
  const { canManageConfig } = useAuth();
  const [history, setHistory] = useState<CombinedHistoryEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    action: '',
    ticketId: '',
    userSearch: '',
    startDate: '',
    endDate: '',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    if (!canManageConfig()) {
      return;
    }
    loadHistory();
  }, [filters, pagination.page, canManageConfig]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: pagination.page,
        limit: pagination.limit,
      };

      if (filters.action) params.action = filters.action;
      if (filters.ticketId) params.ticketId = filters.ticketId;
      if (filters.userSearch && filters.userSearch.trim()) params.userSearch = filters.userSearch.trim();
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const response = await ticketService.getHistory(params);
      setHistory(response.history);
      setPagination(prev => ({
        ...prev,
        total: response.pagination.total,
        totalPages: response.pagination.totalPages,
      }));
    } catch (error) {
      console.error('Error al cargar historial:', error);
      alert('Error al cargar el historial de cambios');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const getActionLabel = (action?: string, message?: string, type?: string) => {
    if (type === 'system_log' && message) {
      return message;
    }
    
    if (action) {
      const labels: Record<string, string> = {
        'CREATED': 'Ticket creado',
        'STATUS_CHANGED': 'Estado cambiado',
        'PRIORITY_CHANGED': 'Prioridad cambiada',
        'ASSIGNED': 'Ticket asignado',
        'DELETED': 'Ticket eliminado',
      };
      return labels[action] || action;
    }
    
    return '-';
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

  const getUserName = (event: CombinedHistoryEvent) => {
    if (event.type === 'ticket_history') {
      return event.changedByUser?.name || '-';
    } else {
      return event.user?.name || '-';
    }
  };

  const getChangeDescription = (event: CombinedHistoryEvent): string => {
    if (event.type === 'system_log') {
      // Para eventos del sistema, ya viene en message
      return '';
    }

    if (event.type === 'ticket_history' && event.action) {
      if (event.action === 'STATUS_CHANGED') {
        return `${getStatusLabel(event.oldValue)} → ${getStatusLabel(event.newValue)}`;
      } else if (event.action === 'PRIORITY_CHANGED') {
        return `${getPriorityLabel(event.oldValue)} → ${getPriorityLabel(event.newValue)}`;
      } else if (event.action === 'ASSIGNED') {
        return event.oldValue === 'UNASSIGNED' 
          ? `Asignado a: ${event.newValue || 'Sin asignar'}` 
          : `${event.oldValue} → ${event.newValue || 'Sin asignar'}`;
      } else if (event.action === 'CREATED') {
        return `Estado inicial: ${getStatusLabel(event.newValue)}`;
      } else if (event.action === 'DELETED') {
        return 'Ticket eliminado';
      }
    }

    return '-';
  };

  if (!canManageConfig()) {
    return <div>No tiene permisos para ver esta página</div>;
  }

  if (loading && history.length === 0) {
    return <div className="loading">Cargando historial de cambios...</div>;
  }

  return (
    <div className="logs-page">
      <div className="logs-header">
        <h2>Historial de Cambios</h2>
        <button onClick={loadHistory} className="btn btn-primary">
          Actualizar
        </button>
      </div>

      {/* Filtros */}
      <div className="filters-section">
        <h3>Filtros</h3>
        <div className="filter-row">
          <div className="filter-group">
            <label htmlFor="action-filter">Tipo de Evento</label>
            <select
              id="action-filter"
              value={filters.action}
              onChange={(e) => handleFilterChange('action', e.target.value)}
            >
              <option value="">Todos</option>
              <optgroup label="Tickets">
                <option value="CREATED">Ticket creado</option>
                <option value="STATUS_CHANGED">Estado cambiado</option>
                <option value="PRIORITY_CHANGED">Prioridad cambiada</option>
                <option value="ASSIGNED">Ticket asignado</option>
                <option value="DELETED">Ticket eliminado</option>
              </optgroup>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="user-filter">Por Usuario</label>
            <input
              type="text"
              id="user-filter"
              value={filters.userSearch}
              onChange={(e) => handleFilterChange('userSearch', e.target.value)}
              placeholder="Nombre o correo del usuario"
            />
          </div>

          <div className="filter-group">
            <label htmlFor="ticket-id-filter">ID de Ticket</label>
            <input
              type="text"
              id="ticket-id-filter"
              value={filters.ticketId}
              onChange={(e) => handleFilterChange('ticketId', e.target.value)}
              placeholder="ID del ticket"
            />
          </div>

          <div className="filter-group">
            <label htmlFor="start-date">Fecha Inicio</label>
            <input
              type="date"
              id="start-date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label htmlFor="end-date">Fecha Fin</label>
            <input
              type="date"
              id="end-date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Lista de cambios */}
      <div className="logs-table-container">
        <table className="logs-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Evento</th>
              <th>Ticket</th>
              <th>Cambio</th>
              <th>Usuario</th>
            </tr>
          </thead>
          <tbody>
            {history.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '40px' }}>
                  No hay cambios registrados
                </td>
              </tr>
            ) : (
              history.map((item) => {
                const eventLabel = getActionLabel(item.action, item.message, item.type);
                const changeDescription = getChangeDescription(item);
                const userName = getUserName(item);

                return (
                  <tr key={item.id} className="log-row">
                    <td>{new Date(item.createdAt).toLocaleString('es-ES')}</td>
                    <td>
                      <span className={`badge ${item.type === 'system_log' ? 'badge-info' : 'badge-info'}`}>
                        {eventLabel}
                      </span>
                    </td>
                    <td>
                      {item.ticket ? (
                        <>
                          #{String(item.ticket.ticketNumber).padStart(6, '0')} - {item.ticket.title}
                        </>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="log-message">{changeDescription || '-'}</td>
                    <td>{userName}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            disabled={pagination.page === 1}
            className="btn btn-secondary"
          >
            Anterior
          </button>
          <span>
            Página {pagination.page} de {pagination.totalPages} ({pagination.total} total)
          </span>
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            disabled={pagination.page >= pagination.totalPages}
            className="btn btn-secondary"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}

export default Logs;
