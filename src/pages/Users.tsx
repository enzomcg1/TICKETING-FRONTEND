import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userService, branchService, departmentService, Branch, Department } from '../services/api';
import ChangePasswordModal from '../components/ChangePasswordModal';
import editIcon from '../media/editar-eliminar-aceptar-rechazar/editar.png';
import deleteIcon from '../media/editar-eliminar-aceptar-rechazar/eliminar.png';
import './Users.css';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  departmentId?: string;
  branchId?: string;
  isActive: boolean;
  department?: {
    id: string;
    name: string;
    code: string;
  };
  branch?: {
    id: string;
    name: string;
    code: string;
  };
}

function Users() {
  const { canManageUsers, user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [error, setError] = useState('');
  const [loadingAction, setLoadingAction] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [passwordChangeUserId, setPasswordChangeUserId] = useState<string | null>(null);
  const [passwordChangeUserName, setPasswordChangeUserName] = useState<string>('');

  useEffect(() => {
    if (!canManageUsers()) {
      return;
    }
    loadUsers();
    loadBranches();
  }, [canManageUsers]);

  useEffect(() => {
    if (editingUser?.branchId) {
      loadDepartments(editingUser.branchId);
    } else {
      setDepartments([]);
    }
  }, [editingUser?.branchId]);

  const loadUsers = async () => {
    try {
      const response = await userService.getAll();
      setUsers(response.data);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBranches = async () => {
    try {
      const response = await branchService.getAll();
      setBranches(response.data);
    } catch (error) {
      console.error('Error al cargar sucursales:', error);
    }
  };

  const loadDepartments = async (branchId: string) => {
    setLoadingDepartments(true);
    try {
      const response = await departmentService.getAll(branchId);
      setDepartments(response.data);
    } catch (error) {
      console.error('Error al cargar departamentos:', error);
    } finally {
      setLoadingDepartments(false);
    }
  };

  // Función helper para determinar jerarquía de roles
  const getRoleHierarchy = (role: string): number => {
    const hierarchy: Record<string, number> = {
      ADMIN: 5,
      SUPERVISOR: 4,
      TECHNICIAN: 3,
      AUDITOR: 2,
      USER: 1,
    };
    return hierarchy[role] || 0;
  };

  // Verificar si un usuario puede ser editado/eliminado
  const canEditUser = (user: User): boolean => {
    if (!currentUser || currentUser.role !== 'ADMIN') return false;
    const currentHierarchy = getRoleHierarchy(currentUser.role);
    const targetHierarchy = getRoleHierarchy(user.role);
    return targetHierarchy < currentHierarchy;
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

  const getRoleBadgeClass = (role: string) => {
    const classes: Record<string, string> = {
      ADMIN: 'badge-admin',
      TECHNICIAN: 'badge-technician',
      USER: 'badge-user',
      SUPERVISOR: 'badge-supervisor',
      AUDITOR: 'badge-auditor',
    };
    return classes[role] || 'badge-default';
  };

  const handleEdit = (user: User) => {
    setEditingUser({ ...user });
    setError('');
  };

  const handleDelete = async (user: User) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar al usuario "${user.name}" (${user.email})?`)) {
      return;
    }

    try {
      await userService.delete(user.id);
      alert('Usuario eliminado exitosamente');
      loadUsers();
    } catch (error: any) {
      console.error('Error al eliminar usuario:', error);
      const errorMessage = error.response?.data?.error || 'Error al eliminar usuario';
      const errorDetails = error.response?.data?.details;
      
      // Si hay detalles sobre tickets, mostrar un mensaje más específico
      if (errorDetails && (errorDetails.createdTickets > 0 || errorDetails.assignedTickets > 0)) {
        const detailsMessage = `\n\nTickets creados: ${errorDetails.createdTickets || 0}\nTickets asignados: ${errorDetails.assignedTickets || 0}\n\nPor favor, desactive el usuario o reasigne los tickets antes de eliminarlo.`;
        alert(errorMessage + detailsMessage);
      } else {
        alert(errorMessage);
      }
    }
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;

    setError('');
    setLoadingAction(true);

    try {
      const updateData: any = {
        name: editingUser.name,
        role: editingUser.role,
        branchId: editingUser.branchId || null,
        departmentId: editingUser.departmentId || null,
        isActive: editingUser.isActive,
      };

      await userService.update(editingUser.id, updateData);
      alert('Usuario actualizado exitosamente');
      setEditingUser(null);
      loadUsers();
    } catch (error: any) {
      setError(error.response?.data?.error || 'Error al actualizar usuario');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleEditChange = (field: string, value: any) => {
    if (!editingUser) return;
    
    setEditingUser(prev => {
      if (!prev) return null;
      
      const updated = { ...prev, [field]: value };
      
      // Si se cambia la sucursal, limpiar el departamento
      if (field === 'branchId') {
        updated.departmentId = '';
        if (value) {
          loadDepartments(value);
        } else {
          setDepartments([]);
        }
      }
      
      return updated;
    });
  };

  if (!canManageUsers()) {
    return <div>No tiene permisos para ver esta página</div>;
  }

  if (loading) {
    return <div className="loading">Cargando usuarios...</div>;
  }

  return (
    <div className="users-page">
      <div className="users-header">
        <h2>Gestión de Usuarios</h2>
        <Link to="/users/new" className="btn btn-primary">
          Registrar Nuevo Usuario
        </Link>
      </div>

      {users.length === 0 ? (
        <div className="empty-state">
          <p>No hay usuarios registrados</p>
          <Link to="/users/new" className="btn btn-primary">
            Registrar Primer Usuario
          </Link>
        </div>
      ) : (
        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Sucursal</th>
                <th>Departamento</th>
                <th>Estado</th>
                {currentUser?.role === 'ADMIN' && <th>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`badge ${getRoleBadgeClass(user.role)}`}>
                      {getRoleLabel(user.role)}
                    </span>
                  </td>
                  <td>{user.branch?.name || '-'}</td>
                  <td>{user.department?.name || '-'}</td>
                  <td>
                    <span className={user.isActive ? 'status-active' : 'status-inactive'}>
                      {user.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  {currentUser?.role === 'ADMIN' && (
                    <td>
                      <div className="action-buttons">
                        {canEditUser(user) && (
                          <>
                            <button
                              onClick={() => handleEdit(user)}
                              className="btn-action btn-edit"
                              title="Editar usuario"
                            >
                              <img src={editIcon} alt="Editar" className="btn-icon" />
                            </button>
                            <button
                              onClick={() => handleDelete(user)}
                              className="btn-action btn-delete"
                              title="Eliminar usuario"
                            >
                              <img src={deleteIcon} alt="Eliminar" className="btn-icon" />
                            </button>
                          </>
                        )}
                        {!canEditUser(user) && (
                          <span className="no-actions" title="No puedes editar usuarios con rol igual o superior">
                            -
                          </span>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de edición */}
      {editingUser && (
        <div className="modal-overlay" onClick={() => setEditingUser(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Editar Usuario</h3>
              <button className="modal-close" onClick={() => setEditingUser(null)}>×</button>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="modal-body">
              <div className="form-group">
                <label>Nombre Completo *</label>
                <input
                  type="text"
                  value={editingUser.name}
                  onChange={(e) => handleEditChange('name', e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={editingUser.email}
                  disabled
                  className="disabled-input"
                />
                <small className="form-hint">El email no se puede modificar</small>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Rol *</label>
                  <select
                    value={editingUser.role}
                    onChange={(e) => handleEditChange('role', e.target.value)}
                    required
                  >
                    <option value="USER">Usuario</option>
                    <option value="TECHNICIAN">Técnico</option>
                    <option value="SUPERVISOR">Supervisor</option>
                    <option value="AUDITOR">Auditor</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Estado</label>
                  <select
                    value={editingUser.isActive ? 'active' : 'inactive'}
                    onChange={(e) => handleEditChange('isActive', e.target.value === 'active')}
                  >
                    <option value="active">Activo</option>
                    <option value="inactive">Inactivo</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Sucursal</label>
                  <select
                    value={editingUser.branchId || ''}
                    onChange={(e) => handleEditChange('branchId', e.target.value)}
                  >
                    <option value="">Seleccione una sucursal</option>
                    {branches.map(branch => (
                      <option key={branch.id} value={branch.id}>
                        {branch.name} ({branch.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Departamento</label>
                  <select
                    value={editingUser.departmentId || ''}
                    onChange={(e) => handleEditChange('departmentId', e.target.value)}
                    disabled={!editingUser.branchId || loadingDepartments}
                  >
                    <option value="">
                      {loadingDepartments 
                        ? 'Cargando...' 
                        : !editingUser.branchId 
                        ? 'Primero seleccione una sucursal'
                        : 'Seleccione un departamento'}
                    </option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name} ({dept.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {currentUser?.role === 'ADMIN' && canEditUser(editingUser) && (
                <div className="form-group" style={{ marginTop: '8px', paddingTop: '16px', borderTop: '1px solid var(--neutral-border)' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setPasswordChangeUserId(editingUser.id);
                      setPasswordChangeUserName(editingUser.name);
                      setShowChangePasswordModal(true);
                    }}
                    className="btn-change-password-inline"
                  >
                    🔒 Cambiar Contraseña de este Usuario
                  </button>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="btn btn-secondary"
                disabled={loadingAction}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="btn btn-primary"
                disabled={loadingAction}
              >
                {loadingAction ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de cambio de contraseña para otros usuarios (solo admin) */}
      {passwordChangeUserId && (
        <ChangePasswordModal
          isOpen={showChangePasswordModal}
          onClose={() => {
            setShowChangePasswordModal(false);
            setPasswordChangeUserId(null);
            setPasswordChangeUserName('');
          }}
          userId={passwordChangeUserId}
          userName={passwordChangeUserName}
          onSuccess={() => {
            // Recargar usuarios después de cambiar contraseña
            loadUsers();
          }}
        />
      )}
    </div>
  );
}

export default Users;

