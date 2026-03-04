import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ticketService, Ticket } from '../services/api';
import addIcon from '../media/tickets/nuevo ticket/anadir.png';
import './TicketList.css';

function TicketList() {
  const navigate = useNavigate();
  
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    branchId: '',
    departmentId: '',
    search: '',
    searchType: 'all',
  });

  useEffect(() => {
    loadTickets();
  }, [filters]);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const params: any = {};
      
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;
      if (filters.branchId) params.branchId = filters.branchId;
      if (filters.departmentId) params.departmentId = filters.departmentId;
      if (filters.search) {
        params.search = filters.search;
        params.searchType = filters.searchType;
      }

      const ticketsData = await ticketService.getAll(params);
      setTickets(ticketsData);
    } catch (error) {
      console.error('Error al cargar tickets:', error);
      alert('Error al cargar los tickets');
    } finally {
      setLoading(false);
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

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  if (loading) {
    return <div className="loading">Cargando tickets...</div>;
  }

  return (
    <div className="ticket-list-page">
      <div className="ticket-list-header">
        <h2>Lista de Tickets</h2>
        <button
          onClick={() => navigate('/tickets/new')}
          className="btn btn-primary"
          title="Nuevo Ticket"
        >
          <img src={addIcon} alt="Nuevo Ticket" className="btn-icon" />
          <span>Nuevo Ticket</span>
        </button>
      </div>

      {/* Filtros */}
      <div className="filters-section">
        <div className="filter-row">
          <div className="filter-group">
            <label htmlFor="status-filter">Estado</label>
            <select
              id="status-filter"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">Todos</option>
              <option value="OPEN">Nuevo</option>
              <option value="ASSIGNED">Asignado</option>
              <option value="IN_PROGRESS">En Proceso</option>
              <option value="PENDING">En Espera</option>
              <option value="RESOLVED">Resuelto</option>
              <option value="CLOSED">Cerrado</option>
              <option value="CANCELLED">Rechazado</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="priority-filter">Prioridad</label>
            <select
              id="priority-filter"
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
            >
              <option value="">Todas</option>
              <option value="LOW">Baja</option>
              <option value="MEDIUM">Media</option>
              <option value="HIGH">Alta</option>
              <option value="URGENT">Urgente</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="search-type">Buscar en</label>
            <select
              id="search-type"
              value={filters.searchType}
              onChange={(e) => handleFilterChange('searchType', e.target.value)}
            >
              <option value="all">Todos los campos</option>
              <option value="ticketNumber">NÃºmero de Ticket</option>
              <option value="title">TÃ­tulo</option>
              <option value="description">DescripciÃ³n</option>
            </select>
          </div>

          <div className="filter-group filter-search">
            <label htmlFor="search">Buscar</label>
            <input
              type="text"
              id="search"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder={
                filters.searchType === 'ticketNumber'
                  ? 'Ej: 123456'
                  : 'Buscar tickets...'
              }
            />
          </div>
        </div>
      </div>

      {/* Lista de tickets */}
      {tickets.length === 0 ? (
        <div className="empty-state">
          <p>No hay tickets disponibles</p>
          <button
            onClick={() => navigate('/tickets/new')}
            className="btn btn-primary"
            title="Crear Primer Ticket"
          >
            <img src={addIcon} alt="Crear Primer Ticket" className="btn-icon" />
            <span>Crear Primer Ticket</span>
          </button>
        </div>
      ) : (
        <div className="tickets-grid">
          {tickets.map((ticket) => {
            const statusBadge = getStatusBadge(ticket.status);
            const priorityBadge = getPriorityBadge(ticket.priority);

            return (
              <Link
                key={ticket.id}
                to={`/tickets/${ticket.id}`}
                className="ticket-card"
              >
                <div className="ticket-card-header">
                  <h3 className="ticket-title">{ticket.title}</h3>
                  <div className="ticket-badges">
                    <span className={`badge ${statusBadge.class}`}>
                      {statusBadge.label}
                    </span>
                    <span className={`priority ${priorityBadge.class}`}>
                      {priorityBadge.label}
                    </span>
                  </div>
                </div>
                <div className="ticket-card-body">
                  <p className="ticket-description">
                    {ticket.description.length > 150
                      ? `${ticket.description.substring(0, 150)}...`
                      : ticket.description}
                  </p>
                  <div className="ticket-meta">
                    <span className="ticket-number">
                      Ticket #{String(ticket.ticketNumber).padStart(6, '0')}
                    </span>
                    <span className="ticket-branch">
                      {ticket.branch.name} - {ticket.department.name}
                    </span>
                    <span className="ticket-requester">
                      Por: {ticket.requestedBy.name}
                    </span>
                    {ticket.assignedTo && (
                      <span className="ticket-assigned">
                        Asignado a: {ticket.assignedTo.name}
                      </span>
                    )}
                    <span className="ticket-date">
                      {new Date(ticket.createdAt).toLocaleDateString('es-ES')}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default TicketList;



