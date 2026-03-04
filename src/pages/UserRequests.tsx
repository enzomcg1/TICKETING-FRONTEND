import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { userRequestService, UserRequest } from '../services/api';
import acceptIcon from '../media/editar-eliminar-aceptar-rechazar/aceptar.png';
import deleteIcon from '../media/editar-eliminar-aceptar-rechazar/eliminar.png';
import './UserRequests.css';

function UserRequests() {
  const { canManageUsers } = useAuth();
  const [requests, setRequests] = useState<UserRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'PENDING' | 'APPROVED' | 'REJECTED'>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (!canManageUsers()) {
      return;
    }
    loadRequests();
  }, [canManageUsers, filter]);

  const loadRequests = async () => {
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await userRequestService.getAll(params);
      setRequests(response.data);
    } catch (error) {
      console.error('Error al cargar solicitudes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    if (!window.confirm('¿Está seguro de aprobar esta solicitud?')) {
      return;
    }

    setActionLoading(id);
    try {
      await userRequestService.approve(id);
      alert('Solicitud aprobada exitosamente');
      loadRequests();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error al aprobar solicitud');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    const reason = rejectionReason[id] || '';
    if (!window.confirm('¿Está seguro de rechazar esta solicitud?')) {
      return;
    }

    setActionLoading(id);
    try {
      await userRequestService.reject(id, reason);
      alert('Solicitud rechazada exitosamente');
      setRejectionReason(prev => ({ ...prev, [id]: '' }));
      loadRequests();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error al rechazar solicitud');
    } finally {
      setActionLoading(null);
    }
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

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; class: string }> = {
      PENDING: { label: 'Pendiente', class: 'badge-pending' },
      APPROVED: { label: 'Aprobada', class: 'badge-approved' },
      REJECTED: { label: 'Rechazada', class: 'badge-rejected' },
    };
    return badges[status] || badges.PENDING;
  };

  if (!canManageUsers()) {
    return <div>No tiene permisos para ver esta página</div>;
  }

  if (loading) {
    return <div className="loading">Cargando solicitudes...</div>;
  }

  const pendingCount = requests.filter(r => r.status === 'PENDING').length;

  return (
    <div className="user-requests-page">
      <div className="user-requests-header">
        <div>
          <h2>Solicitudes de Registro</h2>
          {pendingCount > 0 && (
            <span className="pending-badge">{pendingCount} pendiente{pendingCount !== 1 ? 's' : ''}</span>
          )}
        </div>
        <div className="filter-tabs">
          <button
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            Todas
          </button>
          <button
            className={filter === 'PENDING' ? 'active' : ''}
            onClick={() => setFilter('PENDING')}
          >
            Pendientes
          </button>
          <button
            className={filter === 'APPROVED' ? 'active' : ''}
            onClick={() => setFilter('APPROVED')}
          >
            Aprobadas
          </button>
          <button
            className={filter === 'REJECTED' ? 'active' : ''}
            onClick={() => setFilter('REJECTED')}
          >
            Rechazadas
          </button>
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="empty-state">
          <p>No hay solicitudes de registro</p>
        </div>
      ) : (
        <div className="requests-table-container">
          <table className="requests-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol Solicitado</th>
                <th>Sucursal</th>
                <th>Departamento</th>
                <th>Fecha Solicitud</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => {
                const statusBadge = getStatusBadge(request.status);
                const canAction = request.status === 'PENDING';
                
                return (
                  <tr key={request.id}>
                    <td>{request.name}</td>
                    <td>{request.email}</td>
                    <td>{getRoleLabel(request.requestedRole)}</td>
                    <td>{request.branch?.name || '-'}</td>
                    <td>{request.department?.name || '-'}</td>
                    <td>{new Date(request.createdAt).toLocaleDateString('es-ES')}</td>
                    <td>
                      <span className={`badge ${statusBadge.class}`}>
                        {statusBadge.label}
                      </span>
                    </td>
                    <td>
                      {canAction ? (
                        <div className="action-buttons">
                          <button
                            onClick={() => handleApprove(request.id)}
                            className="btn-approve"
                            disabled={actionLoading === request.id}
                            title="Aprobar"
                          >
                            {actionLoading === request.id ? (
                              'Procesando...'
                            ) : (
                              <img src={acceptIcon} alt="Aprobar" className="btn-icon" />
                            )}
                          </button>
                          <button
                            onClick={() => handleReject(request.id)}
                            className="btn-reject"
                            disabled={actionLoading === request.id}
                            title="Rechazar"
                          >
                            {actionLoading === request.id ? (
                              'Procesando...'
                            ) : (
                              <img src={deleteIcon} alt="Rechazar" className="btn-icon" />
                            )}
                          </button>
                        </div>
                      ) : (
                        <span className="processed-info">
                          {request.processedBy?.name && (
                            <small>Por: {request.processedBy.name}</small>
                          )}
                          {request.rejectionReason && (
                            <div className="rejection-reason">
                              <strong>Motivo:</strong> {request.rejectionReason}
                            </div>
                          )}
                        </span>
                      )}
                      {canAction && (
                        <div className="rejection-input">
                          <input
                            type="text"
                            placeholder="Motivo de rechazo (opcional)"
                            value={rejectionReason[request.id] || ''}
                            onChange={(e) => setRejectionReason(prev => ({
                              ...prev,
                              [request.id]: e.target.value
                            }))}
                          />
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default UserRequests;

