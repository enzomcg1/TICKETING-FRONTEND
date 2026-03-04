import { useState, useEffect } from 'react';
import { ticketService } from '../services/api';
import { branchService, departmentService } from '../services/api';
import exportExcelIcon from '../media/editar-eliminar-aceptar-rechazar/exportarexcel.png';
import exportPDFIcon from '../media/editar-eliminar-aceptar-rechazar/exportarpdf.png';
import './Export.css';

interface Branch {
  id: string;
  name: string;
  code: string;
}

interface Department {
  id: string;
  name: string;
  code: string;
}

function Export() {
  
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    branchId: '',
    departmentId: '',
    startDate: '',
    endDate: '',
  });
  const [branches, setBranches] = useState<Branch[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [loadingDepartments, setLoadingDepartments] = useState(false);

  useEffect(() => {
    loadBranches();
    loadDepartments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadBranches = async () => {
    try {
      setLoadingBranches(true);
      const response = await branchService.getAll();
      setBranches(response.data);
    } catch (error) {
      console.error('Error al cargar sucursales:', error);
    } finally {
      setLoadingBranches(false);
    }
  };

  const loadDepartments = async () => {
    try {
      setLoadingDepartments(true);
      const response = await departmentService.getAll();
      setDepartments(response.data);
    } catch (error) {
      console.error('Error al cargar departamentos:', error);
    } finally {
      setLoadingDepartments(false);
    }
  };

  const handleExport = async (format: 'csv' | 'pdf') => {
    try {
      setLoading(true);

      const exportFilters: any = {};
      if (filters.status) exportFilters.status = filters.status;
      if (filters.priority) exportFilters.priority = filters.priority;
      if (filters.branchId) exportFilters.branchId = filters.branchId;
      if (filters.departmentId) exportFilters.departmentId = filters.departmentId;
      if (filters.startDate) exportFilters.startDate = filters.startDate;
      if (filters.endDate) exportFilters.endDate = filters.endDate;

      if (format === 'csv') {
        await ticketService.export(exportFilters);
      } else {
        await ticketService.exportPDF(exportFilters);
      }

      alert(`ExportaciÃ³n ${format.toUpperCase()} completada exitosamente`);
    } catch (error: any) {
      console.error('Error al exportar:', error);
      alert(`Error al exportar: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      priority: '',
      branchId: '',
      departmentId: '',
      startDate: '',
      endDate: '',
    });
  };

  return (
    <div className="export-page">
      <div className="export-header">
        <h2>Exportar Tickets</h2>
        <p className="export-subtitle">Exporta los tickets segÃºn tus filtros en formato CSV o PDF</p>
      </div>

      <div className="export-filters">
        <h3>Filtros de ExportaciÃ³n</h3>
        <div className="filters-grid">
          <div className="filter-group">
            <label>Estado</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="filter-select"
            >
              <option value="">Todos</option>
              <option value="OPEN">Abierto</option>
              <option value="ASSIGNED">Asignado</option>
              <option value="IN_PROGRESS">En Progreso</option>
              <option value="PENDING">Pendiente</option>
              <option value="RESOLVED">Resuelto</option>
              <option value="CLOSED">Cerrado</option>
              <option value="CANCELLED">Cancelado</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Prioridad</label>
            <select
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              className="filter-select"
            >
              <option value="">Todas</option>
              <option value="LOW">Baja</option>
              <option value="MEDIUM">Media</option>
              <option value="HIGH">Alta</option>
              <option value="URGENT">Urgente</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Sucursal</label>
            <select
              value={filters.branchId}
              onChange={(e) => handleFilterChange('branchId', e.target.value)}
              className="filter-select"
              disabled={loadingBranches}
            >
              <option value="">Todas</option>
              {branches.map(branch => (
                <option key={branch.id} value={branch.id}>
                  {branch.name} ({branch.code})
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Departamento</label>
            <select
              value={filters.departmentId}
              onChange={(e) => handleFilterChange('departmentId', e.target.value)}
              className="filter-select"
              disabled={loadingDepartments}
            >
              <option value="">Todos</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>
                  {dept.name} ({dept.code})
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Fecha Inicio</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="filter-input"
            />
          </div>

          <div className="filter-group">
            <label>Fecha Fin</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="filter-input"
            />
          </div>
        </div>

        <div className="filter-actions">
          <button
            type="button"
            onClick={clearFilters}
            className="btn btn-secondary"
            disabled={loading}
          >
            Limpiar Filtros
          </button>
        </div>
      </div>

      <div className="export-actions">
        <h3>Formato de ExportaciÃ³n</h3>
        <div className="export-buttons">
          <button
            type="button"
            onClick={() => handleExport('csv')}
            className="btn btn-export btn-export-csv"
            disabled={loading}
            title="Exportar Excel"
          >
            {loading ? (
              'Exportando...'
            ) : (
              <img src={exportExcelIcon} alt="Exportar Excel" className="btn-icon" />
            )}
          </button>
          <button
            type="button"
            onClick={() => handleExport('pdf')}
            className="btn btn-export btn-export-pdf"
            disabled={loading}
            title="Exportar PDF"
          >
            {loading ? (
              'Exportando...'
            ) : (
              <img src={exportPDFIcon} alt="Exportar PDF" className="btn-icon" />
            )}
          </button>
        </div>
      </div>

      <div className="export-info">
        <h4>InformaciÃ³n</h4>
        <ul>
          <li>Los filtros aplicados determinarÃ¡n quÃ© tickets se exportarÃ¡n.</li>
          <li>El formato Excel (.xlsx) incluye formato empresarial, colores, bordes y filtros automÃ¡ticos.</li>
          <li>El formato PDF es ideal para impresiÃ³n o presentaciones con diseÃ±o profesional.</li>
          <li>Si no seleccionas filtros, se exportarÃ¡n todos los tickets visibles segÃºn tu rol.</li>
        </ul>
      </div>
    </div>
  );
}

export default Export;





