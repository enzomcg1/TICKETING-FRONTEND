import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ticketService, branchService, departmentService, attachmentService, Branch, Department } from '../services/api';
import FileUpload from '../components/FileUpload';
import addIcon from '../media/tickets/nuevo ticket/anadir.png';
import './CreateTicket.css';

function CreateTicket() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM' as const,
    category: '',
    branchId: user?.branch?.id || '',
    departmentId: user?.department?.id || '',
  });

  useEffect(() => {
    loadBranches();
    
    // Si es USER, cargar su departamento automÃ¡ticamente
    if (user?.role === 'USER' && user.branch?.id) {
      loadDepartments(user.branch.id);
    }
  }, [user]);

  useEffect(() => {
    // Solo permitir cambiar departamentos si no es USER
    if (user?.role !== 'USER' && formData.branchId) {
      loadDepartments(formData.branchId);
    } else if (user?.role !== 'USER' && !formData.branchId) {
      setDepartments([]);
      setFormData(prev => ({ ...prev, departmentId: '' }));
    }
  }, [formData.branchId, user]);

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
    setLoading(true);

    try {
      // Si es USER, usar sus datos por defecto
      const ticketData = {
        ...formData,
        branchId: user?.role === 'USER' ? (user.branch?.id || formData.branchId) : formData.branchId,
        departmentId: user?.role === 'USER' ? (user.department?.id || formData.departmentId) : formData.departmentId,
      };

      // Crear el ticket
      const newTicket = await ticketService.create(ticketData);

      // Si hay archivos seleccionados, subirlos
      if (selectedFiles.length > 0) {
        setUploadingFiles(true);
        try {
          const result = await attachmentService.upload(newTicket.id, selectedFiles);
          console.log('Archivos subidos exitosamente:', result);
        } catch (error: any) {
          console.error('Error al subir archivos:', error);
          const errorMessage = error.response?.data?.error || error.message || 'Error desconocido';
          const errorDetails = error.response?.data?.details || '';
          alert(`Ticket creado exitosamente, pero hubo un error al subir los archivos:\n\n${errorMessage}${errorDetails ? `\n${errorDetails}` : ''}\n\nPuedes subirlos despuÃ©s desde el detalle del ticket.`);
        } finally {
          setUploadingFiles(false);
        }
      }

      // Navegar al ticket independientemente de si se subieron archivos o no
      navigate(`/tickets/${newTicket.id}`);
    } catch (error) {
      console.error('Error al crear ticket:', error);
      alert('Error al crear el ticket. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="create-ticket">
      <h2>Crear Nuevo Ticket</h2>
      
      <form onSubmit={handleSubmit} className="ticket-form">
        <div className="form-group">
          <label htmlFor="title">TÃ­tulo *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="Ej: Problema con impresora"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">DescripciÃ³n *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={5}
            placeholder="Describe el problema o solicitud..."
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="branchId">Sucursal *</label>
            {user?.role === 'USER' ? (
              <input
                type="text"
                id="branchId"
                value={branches.find(b => b.id === formData.branchId)?.name || 'Cargando...'}
                disabled
                className="disabled-input"
              />
            ) : (
              <select
                id="branchId"
                name="branchId"
                value={formData.branchId}
                onChange={handleChange}
                required
              >
                <option value="">Seleccione una sucursal</option>
                {branches.map(branch => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name} ({branch.code}) - {branch.city}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="departmentId">Departamento *</label>
            {user?.role === 'USER' ? (
              <input
                type="text"
                id="departmentId"
                value={departments.find(d => d.id === formData.departmentId)?.name || 'Cargando...'}
                disabled
                className="disabled-input"
              />
            ) : (
              <select
                id="departmentId"
                name="departmentId"
                value={formData.departmentId}
                onChange={handleChange}
                required
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
            )}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="priority">Prioridad *</label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              required
            >
              <option value="LOW">Baja</option>
              <option value="MEDIUM">Media</option>
              <option value="HIGH">Alta</option>
              <option value="URGENT">Urgente</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="category">CategorÃ­a</label>
            <input
              type="text"
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              placeholder="Ej: Hardware, Software, Red"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Adjuntar archivos (opcional)</label>
          <FileUpload
            files={selectedFiles}
            onFilesChange={setSelectedFiles}
            maxFiles={5}
            maxSize={10}
          />
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="btn btn-secondary"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || uploadingFiles}
            title="Crear Ticket"
          >
            {loading || uploadingFiles ? (
              loading ? 'Creando...' : 'Subiendo archivos...'
            ) : (
              <>
                <img src={addIcon} alt="Crear Ticket" className="btn-icon" />
                <span>Crear Ticket</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateTicket;


