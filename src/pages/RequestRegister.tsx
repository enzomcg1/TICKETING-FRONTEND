import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { userRequestService, branchService, departmentService, Branch, Department } from '../services/api';
import PasswordInput from '../components/PasswordInput';
import './RequestRegister.css';

function RequestRegister() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    requestedRole: 'USER',
    branchId: '',
    departmentId: '',
  });
  const [branches, setBranches] = useState<Branch[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadBranches();
  }, []);

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
      await userRequestService.create({
        ...formData,
        branchId: formData.branchId || undefined,
        departmentId: formData.departmentId || undefined,
      });
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al enviar solicitud');
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

  if (success) {
    return (
      <div className="request-register-container">
        <div className="success-card">
          <h2>✅ Solicitud Enviada</h2>
          <p>Tu solicitud de registro ha sido enviada exitosamente.</p>
          <p>Un administrador revisará tu solicitud y te notificará cuando sea aprobada.</p>
          <p>Serás redirigido al login en unos segundos...</p>
          <Link to="/login" className="btn btn-primary">
            Ir al Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="request-register-container">
      <div className="request-register-card">
        <div className="request-register-header">
          <h1>Solicitar Registro</h1>
          <p>Completa el formulario para solicitar una cuenta en el sistema</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="request-register-form">
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
                placeholder="Juan Pérez"
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
              <label htmlFor="password">Contraseña *</label>
              <PasswordInput
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                placeholder="Mínimo 6 caracteres"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="requestedRole">Rol Solicitado *</label>
              <select
                id="requestedRole"
                name="requestedRole"
                value={formData.requestedRole}
                onChange={handleChange}
                required
              >
                <option value="USER">Usuario</option>
                <option value="TECHNICIAN">Técnico</option>
                <option value="SUPERVISOR">Supervisor</option>
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
            <Link to="/login" className="btn btn-secondary">
              Cancelar
            </Link>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Enviando solicitud...' : 'Enviar Solicitud'}
            </button>
          </div>
        </form>

        <div className="request-register-footer">
          <p>
            ¿Ya tienes una cuenta?{' '}
            <Link to="/login" className="link">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RequestRegister;
