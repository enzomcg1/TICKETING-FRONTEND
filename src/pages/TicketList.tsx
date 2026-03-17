import { Funnel, Plus, Search, Sparkles, Ticket as TicketIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GlowCard } from '@/components/magicui/glow-card';
import { ShimmerButton } from '@/components/magicui/shimmer-button';
import { ticketService, Ticket } from '../services/api';

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
    const badges: Record<string, { label: string; className: string }> = {
      OPEN: { label: 'Nuevo', className: 'bg-sky-100 text-sky-800' },
      ASSIGNED: { label: 'Asignado', className: 'bg-violet-100 text-violet-800' },
      IN_PROGRESS: { label: 'En Proceso', className: 'bg-amber-100 text-amber-800' },
      PENDING: { label: 'En Espera', className: 'bg-pink-100 text-pink-800' },
      RESOLVED: { label: 'Resuelto', className: 'bg-emerald-100 text-emerald-800' },
      CLOSED: { label: 'Cerrado', className: 'bg-slate-200 text-slate-700' },
      CANCELLED: { label: 'Rechazado', className: 'bg-rose-100 text-rose-800' },
    };
    return badges[status] || badges.OPEN;
  };

  const getPriorityBadge = (priority: Ticket['priority']) => {
    const badges: Record<string, { label: string; className: string }> = {
      LOW: { label: 'Baja', className: 'bg-emerald-100 text-emerald-800' },
      MEDIUM: { label: 'Media', className: 'bg-amber-100 text-amber-800' },
      HIGH: { label: 'Alta', className: 'bg-orange-100 text-orange-800' },
      URGENT: { label: 'Urgente', className: 'bg-rose-100 text-rose-800' },
    };
    return badges[priority] || badges.MEDIUM;
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const openCount = tickets.filter((ticket) => ticket.status === 'OPEN').length;
  const urgentCount = tickets.filter((ticket) => ticket.priority === 'URGENT').length;
  const assignedCount = tickets.filter((ticket) => ticket.assignedTo).length;

  if (loading) {
    return <div className="loading">Cargando tickets...</div>;
  }

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[32px] border border-slate-200/70 bg-[linear-gradient(135deg,#111827_0%,#1f2937_44%,#7f1d1d_100%)] px-6 py-7 text-white shadow-[0_28px_90px_rgba(15,23,42,0.16)] sm:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_28%)]" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-rose-100">
              <Sparkles className="h-4 w-4" />
              Vista renovada
            </div>
            <h2 className="mt-4 text-3xl font-bold sm:text-4xl">Lista de tickets</h2>
            <p className="mt-3 text-sm text-slate-200 sm:text-base">
              Mantenemos los mismos datos y filtros, pero con una capa visual mas clara para
              trabajar mejor en escritorio y movil.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[22px] border border-white/12 bg-white/10 px-4 py-4 backdrop-blur-md">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Total</p>
              <p className="mt-2 text-3xl font-bold">{tickets.length}</p>
            </div>
            <div className="rounded-[22px] border border-white/12 bg-white/10 px-4 py-4 backdrop-blur-md">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Nuevos</p>
              <p className="mt-2 text-3xl font-bold">{openCount}</p>
            </div>
            <div className="rounded-[22px] border border-white/12 bg-white/10 px-4 py-4 backdrop-blur-md">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Urgentes</p>
              <p className="mt-2 text-3xl font-bold">{urgentCount}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)]">
        <GlowCard className="rounded-[30px] border-slate-200/80 bg-white/84">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
              <Funnel className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-950">Filtros</h3>
              <p className="text-sm text-slate-500">La logica de busqueda sigue intacta.</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
            <div className="form-group mb-0">
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

            <div className="form-group mb-0">
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

            <div className="form-group mb-0">
              <label htmlFor="search-type">Buscar en</label>
              <select
                id="search-type"
                value={filters.searchType}
                onChange={(e) => handleFilterChange('searchType', e.target.value)}
              >
                <option value="all">Todos los campos</option>
                <option value="ticketNumber">Numero de Ticket</option>
                <option value="title">Titulo</option>
                <option value="description">Descripcion</option>
              </select>
            </div>

            <div className="form-group mb-0 sm:col-span-2 xl:col-span-1">
              <label htmlFor="search">Buscar</label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  id="search"
                  className="pl-11"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder={
                    filters.searchType === 'ticketNumber' ? 'Ej: 123456' : 'Buscar tickets...'
                  }
                />
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50/80 p-4">
            <p className="text-sm font-semibold text-slate-900">Resumen rapido</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
                <span className="text-sm text-slate-500">Asignados</span>
                <span className="text-lg font-bold text-slate-950">{assignedCount}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
                <span className="text-sm text-slate-500">Con filtro activo</span>
                <span className="text-lg font-bold text-slate-950">
                  {[filters.status, filters.priority, filters.search].filter(Boolean).length}
                </span>
              </div>
            </div>
          </div>
        </GlowCard>

        <div className="space-y-5">
          <GlowCard className="rounded-[30px] border-slate-200/80 bg-white/84">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-rose-500">Tickets</p>
                <h3 className="mt-2 text-2xl font-bold text-slate-950">Bandeja de trabajo</h3>
                <p className="mt-2 text-sm text-slate-500">
                  Visualizamos el mismo contenido con cards mas legibles y mejor jerarquia.
                </p>
              </div>
              <ShimmerButton type="button" onClick={() => navigate('/tickets/new')} className="sm:w-auto">
                <Plus className="h-4 w-4" />
                Nuevo Ticket
              </ShimmerButton>
            </div>
          </GlowCard>

          {tickets.length === 0 ? (
            <GlowCard className="rounded-[30px] border-dashed border-slate-300/90 bg-white/72 py-14">
              <div className="flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-slate-950 text-white shadow-[0_20px_40px_rgba(15,23,42,0.18)]">
                  <TicketIcon className="h-7 w-7" />
                </div>
                <h3 className="mt-6 text-2xl font-bold text-slate-950">No hay tickets disponibles</h3>
                <p className="mt-3 max-w-md text-sm text-slate-500">
                  Cuando el equipo cree tickets, apareceran aqui con esta nueva presentacion visual.
                </p>
                <div className="mt-6">
                  <ShimmerButton type="button" onClick={() => navigate('/tickets/new')}>
                    <Plus className="h-4 w-4" />
                    Crear Primer Ticket
                  </ShimmerButton>
                </div>
              </div>
            </GlowCard>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
              {tickets.map((ticket) => {
                const statusBadge = getStatusBadge(ticket.status);
                const priorityBadge = getPriorityBadge(ticket.priority);

                return (
                  <Link key={ticket.id} to={`/tickets/${ticket.id}`} className="group block">
                    <GlowCard className="h-full rounded-[30px] border-slate-200/70 bg-white/84 transition duration-300 group-hover:border-rose-200 group-hover:shadow-[0_30px_90px_rgba(15,23,42,0.2)]">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                            Ticket #{String(ticket.ticketNumber).padStart(6, '0')}
                          </p>
                          <h4 className="mt-3 line-clamp-2 text-xl font-bold text-slate-950">
                            {ticket.title}
                          </h4>
                        </div>
                        <div className="rounded-2xl bg-slate-950 p-3 text-white shadow-[0_18px_30px_rgba(15,23,42,0.18)]">
                          <TicketIcon className="h-5 w-5" />
                        </div>
                      </div>

                      <div className="mt-5 flex flex-wrap gap-2">
                        <span className={`badge ${statusBadge.className}`}>{statusBadge.label}</span>
                        <span className={`badge ${priorityBadge.className}`}>{priorityBadge.label}</span>
                      </div>

                      <p className="mt-5 line-clamp-4 text-sm leading-6 text-slate-600">
                        {ticket.description}
                      </p>

                      <div className="mt-6 grid gap-3 text-sm text-slate-500">
                        <div className="rounded-2xl bg-slate-50/90 px-4 py-3">
                          <span className="block text-xs uppercase tracking-[0.16em] text-slate-400">
                            Sucursal
                          </span>
                          <span className="mt-1 block font-semibold text-slate-900">
                            {ticket.branch.name} · {ticket.department.name}
                          </span>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="rounded-2xl bg-slate-50/90 px-4 py-3">
                            <span className="block text-xs uppercase tracking-[0.16em] text-slate-400">
                              Solicitante
                            </span>
                            <span className="mt-1 block font-semibold text-slate-900">
                              {ticket.requestedBy.name}
                            </span>
                          </div>
                          <div className="rounded-2xl bg-slate-50/90 px-4 py-3">
                            <span className="block text-xs uppercase tracking-[0.16em] text-slate-400">
                              Asignado
                            </span>
                            <span className="mt-1 block font-semibold text-slate-900">
                              {ticket.assignedTo?.name || 'Pendiente'}
                            </span>
                          </div>
                        </div>
                        <div className="rounded-2xl bg-slate-50/90 px-4 py-3">
                          <span className="block text-xs uppercase tracking-[0.16em] text-slate-400">
                            Fecha
                          </span>
                          <span className="mt-1 block font-semibold text-slate-900">
                            {new Date(ticket.createdAt).toLocaleDateString('es-ES')}
                          </span>
                        </div>
                      </div>
                    </GlowCard>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TicketList;
