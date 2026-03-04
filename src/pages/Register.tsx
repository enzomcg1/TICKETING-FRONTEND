import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { branchService, departmentService, Branch, Department } from '../services/api';
import PasswordInput from '../components/PasswordInput';
import './Register.css';

function Register() {
  const navigate = useNavigate();
  const { register, canManageUsers } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [branches, setBranches] = useState<Branch[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'USER',
    branchId: '',
    departmentId: '',
  });

  useEffect(() => {
    // Solo ADMIN puede registrar usuarios
    if (!canManageUsers()) {
      navigate('/');
      return;
    }
    loadBranches();
  }, [canManageUsers, navigate]);

  useEffect(() => {
    if (formData.branchId) {
      loadDepartments(formData.branchId);
    } else {
      setDepartments([]);
      setFormData(prev => ({ ...prev, departmentId: '' }));
    }
  }, [formData.branchId]);

  const loadBranches = async () => {
    try {
      const response = await branchService.getAll();
      setBranches(response.data);
    } catch (error) {
      console.error('Error al cargar sucursales:', error);
    }
  };

  const loadDepartments = async (branchId: string) => {
    try {
      const response = await departmentService.getAll(branchId);
      setDepartments(response.data);
    } catch (error) {
      console.error('Error al cargar departamentos:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register({
        ...formData,
        branchId: formData.branchId || undefined,
        departmentId: formData.departmentId || undefined,
      });
      alert('Usuario registrado exitosamente');
      navigate('/users');
    } catch (err: any) {
      setError(err.message || 'Error al registrar usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!canManageUsers()) {
    return null;
  }

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <h2>Registrar Nuevo Usuario</h2>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Nombre Completo *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Juan PÃ©rez"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="usuario@empresa.com"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">ContraseÃ±a *</label>
              <PasswordInput
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                placeholder="MÃ­nimo 6 caracteres"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="role">Rol *</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
              >
                <option value="USER">Usuario</option>
                <option value="TECHNICIAN">TÃ©cnico</option>
                <option value="SUPERVISOR">Supervisor</option>
                <option value="ADMIN">Administrador</option>
                <option value="AUDITOR">Auditor</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="branchId">Sucursal</label>
              <select
                id="branchId"
                name="branchId"
                value={formData.branchId}
                onChange={handleChange}
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
              <label htmlFor="departmentId">Departamento</label>
              <select
                id="departmentId"
                name="departmentId"
                value={formData.departmentId}
                onChange={handleChange}
                disabled={!formData.branchId}
              >
                <option value="">
                  {formData.branchId ? 'Seleccione un departamento' : 'Primero seleccione una sucursal'}
                </option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name} ({dept.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/users')}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Registrando...' : 'Registrar Usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register;


