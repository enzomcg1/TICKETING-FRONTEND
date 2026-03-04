import { useState } from 'react';
import { authService, userService } from '../services/api';
import PasswordInput from './PasswordInput';
import './ChangePasswordModal.css';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string; // Si no se proporciona, se cambia la contraseña propia
  userName?: string; // Nombre del usuario para mostrar en el título
  onSuccess?: () => void; // Callback opcional cuando se cambia la contraseña exitosamente
}

function ChangePasswordModal({ isOpen, onClose, userId, userName, onSuccess }: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const isAdminChange = !!userId; // Si hay userId, es un cambio por admin

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validaciones
    if (!isAdminChange && !currentPassword) {
      setError('La contraseña actual es requerida');
      return;
    }

    if (!newPassword) {
      setError('La nueva contraseña es requerida');
      return;
    }

    if (newPassword.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);

    try {
      if (isAdminChange) {
        // Cambio de contraseña por admin
        await userService.changePassword(userId, newPassword);
      } else {
        // Cambio de contraseña propia
        await authService.changePassword(currentPassword, newPassword);
      }

      setSuccess(true);
      
      // Limpiar formulario
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      // Llamar callback de éxito si existe
      if (onSuccess) {
        onSuccess();
      }

      // Cerrar modal después de 1.5 segundos
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 1500);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Error al cambiar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setError('');
      setSuccess(false);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="change-password-modal-overlay" onClick={handleClose}>
      <div className="change-password-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="change-password-modal-header">
          <h3>
            {isAdminChange 
              ? `Cambiar Contraseña de ${userName || 'Usuario'}` 
              : 'Cambiar Mi Contraseña'}
          </h3>
          <button className="change-password-modal-close" onClick={handleClose} disabled={loading}>
            ×
          </button>
        </div>

        {error && <div className="change-password-error">{error}</div>}
        {success && <div className="change-password-success">¡Contraseña actualizada exitosamente!</div>}

        <form onSubmit={handleSubmit} className="change-password-form">
          {!isAdminChange && (
            <div className="form-group">
              <label htmlFor="currentPassword">Contraseña Actual *</label>
              <PasswordInput
                id="currentPassword"
                name="currentPassword"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                placeholder="Ingrese su contraseña actual"
                disabled={loading}
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="newPassword">Nueva Contraseña *</label>
            <PasswordInput
              id="newPassword"
              name="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              placeholder="Mínimo 6 caracteres"
              disabled={loading}
            />
            <small className="form-hint">La contraseña debe tener al menos 6 caracteres</small>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar Nueva Contraseña *</label>
            <PasswordInput
              id="confirmPassword"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              placeholder="Confirme la nueva contraseña"
              disabled={loading}
            />
          </div>

          <div className="change-password-modal-footer">
            <button
              type="button"
              onClick={handleClose}
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
              {loading ? 'Cambiando...' : 'Cambiar Contraseña'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ChangePasswordModal;

