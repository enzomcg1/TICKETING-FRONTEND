import { useState, useEffect } from 'react';
import { Attachment, attachmentService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { SOCKET_URL } from '../config/env';
import addIcon from '../media/tickets/nuevo ticket/anadir.png';
import deleteIcon from '../media/editar-eliminar-aceptar-rechazar/eliminar.png';
import './AttachmentsList.css';

interface AttachmentsListProps {
  attachments: Attachment[];
  ticketId: string;
  onAttachmentsChange: () => void;
}

export default function AttachmentsList({ attachments, ticketId, onAttachmentsChange }: AttachmentsListProps) {
  const { user } = useAuth();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<Attachment | null>(null);

  const handleDownload = async (attachment: Attachment) => {
    try {
      await attachmentService.download(attachment.id);
    } catch (error) {
      console.error('Error al descargar archivo:', error);
      alert('Error al descargar el archivo');
    }
  };

  const handleDelete = async (attachment: Attachment) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar "${attachment.originalName}"?`)) {
      return;
    }

    try {
      setDeletingId(attachment.id);
      await attachmentService.delete(attachment.id);
      onAttachmentsChange();
    } catch (error) {
      console.error('Error al eliminar archivo:', error);
      alert('Error al eliminar el archivo');
    } finally {
      setDeletingId(null);
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const files = Array.from(e.target.files);
    try {
      setUploading(true);
      await attachmentService.upload(ticketId, files);
      onAttachmentsChange();
      e.target.value = ''; // Reset input
    } catch (error) {
      console.error('Error al subir archivos:', error);
      alert('Error al subir los archivos');
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const getFileIcon = (mimeType: string): string => {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.startsWith('video/')) return '🎥';
    if (mimeType === 'application/pdf') return '📄';
    if (mimeType.includes('word')) return '📝';
    return '📎';
  };

  const isImage = (mimeType: string): boolean => {
    return mimeType.startsWith('image/');
  };

  const canDelete = (attachment: Attachment): boolean => {
    return user?.role === 'ADMIN' || attachment.uploadedById === user?.id;
  };

  const handleImageClick = (attachment: Attachment) => {
    if (isImage(attachment.mimeType)) {
      setSelectedImage(attachment);
    }
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
  };

  // Cerrar modal con tecla ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedImage) {
        handleCloseModal();
      }
    };

    if (selectedImage) {
      document.addEventListener('keydown', handleEscape);
      // Prevenir scroll del body cuando el modal está abierto
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [selectedImage]);

  const getImageUrl = (attachment: Attachment): string => {
    if (attachment.fileUrl.startsWith('http')) {
      return attachment.fileUrl;
    }
    // Construir URL completa usando la URL base del backend
    const baseUrl = SOCKET_URL.replace('/api', '');
    const url = attachment.fileUrl.startsWith('/') 
      ? `${baseUrl}${attachment.fileUrl}` 
      : `${baseUrl}/${attachment.fileUrl}`;
    return url;
  };

  const getCurrentImageIndex = (): number => {
    if (!selectedImage) return -1;
    const imageAttachments = attachments.filter(a => isImage(a.mimeType));
    return imageAttachments.findIndex(a => a.id === selectedImage.id);
  };

  const handlePreviousImage = () => {
    const imageAttachments = attachments.filter(a => isImage(a.mimeType));
    const currentIndex = getCurrentImageIndex();
    if (currentIndex > 0) {
      setSelectedImage(imageAttachments[currentIndex - 1]);
    }
  };

  const handleNextImage = () => {
    const imageAttachments = attachments.filter(a => isImage(a.mimeType));
    const currentIndex = getCurrentImageIndex();
    if (currentIndex < imageAttachments.length - 1) {
      setSelectedImage(imageAttachments[currentIndex + 1]);
    }
  };

  return (
    <div className="attachments-list">
      <div className="attachments-header">
        <h3>Adjuntos ({attachments.length})</h3>
        <label className="btn-upload-more">
          <input
            type="file"
            multiple
            accept="image/*,video/*,.pdf,.doc,.docx"
            onChange={handleFileInput}
            disabled={uploading}
            style={{ display: 'none' }}
          />
          {uploading ? (
            'Subiendo...'
          ) : (
            <>
              <img src={addIcon} alt="Agregar archivos" className="btn-icon" />
              <span>Agregar archivos</span>
            </>
          )}
        </label>
      </div>

      {attachments.length === 0 ? (
        <p className="no-attachments">No hay adjuntos</p>
      ) : (
        <div className="attachments-grid">
          {attachments.map((attachment) => (
            <div key={attachment.id} className="attachment-item">
              {isImage(attachment.mimeType) ? (
                <div className="attachment-image">
                  <img
                    src={getImageUrl(attachment)}
                    alt={attachment.originalName}
                    onClick={() => handleImageClick(attachment)}
                    title="Haz clic para ver imagen completa"
                  />
                </div>
              ) : (
                <div className="attachment-icon">
                  <span>{getFileIcon(attachment.mimeType)}</span>
                </div>
              )}
              <div className="attachment-info">
                <span className="attachment-name" title={attachment.originalName}>
                  {attachment.originalName}
                </span>
                <span className="attachment-meta">
                  {formatFileSize(attachment.fileSize)} • {new Date(attachment.createdAt).toLocaleDateString('es-ES')}
                </span>
                <span className="attachment-uploader">
                  Subido por: {attachment.uploadedBy.name}
                </span>
              </div>
              <div className="attachment-actions">
                <button
                  onClick={() => handleDownload(attachment)}
                  className="btn-download"
                  title="Descargar"
                >
                  ⬇️
                </button>
                {canDelete(attachment) && (
                  <button
                    onClick={() => handleDelete(attachment)}
                    className="btn-delete"
                    disabled={deletingId === attachment.id}
                    title="Eliminar"
                  >
                    {deletingId === attachment.id ? (
                      '⏳'
                    ) : (
                      <img src={deleteIcon} alt="Eliminar" className="btn-icon" />
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal para mostrar imagen completa */}
      {selectedImage && (
        <div className="image-modal-overlay" onClick={handleCloseModal}>
          <div className="image-modal-container" onClick={(e) => e.stopPropagation()}>
            <button className="image-modal-close" onClick={handleCloseModal} aria-label="Cerrar">
              ✕
            </button>
            
            {(() => {
              const imageAttachments = attachments.filter(a => isImage(a.mimeType));
              const currentIndex = getCurrentImageIndex();
              const hasPrevious = currentIndex > 0;
              const hasNext = currentIndex < imageAttachments.length - 1;
              
              return (
                <>
                  {hasPrevious && (
                    <button 
                      className="image-modal-nav image-modal-prev" 
                      onClick={handlePreviousImage}
                      aria-label="Imagen anterior"
                    >
                      ‹
                    </button>
                  )}
                  
                  <div className="image-modal-content">
                    <img
                      src={getImageUrl(selectedImage)}
                      alt={selectedImage.originalName}
                      className="image-modal-img"
                    />
                    <div className="image-modal-info">
                      <p className="image-modal-name">{selectedImage.originalName}</p>
                      <p className="image-modal-meta">
                        {formatFileSize(selectedImage.fileSize)} • 
                        {imageAttachments.length > 1 && ` Imagen ${currentIndex + 1} de ${imageAttachments.length}`}
                      </p>
                      <div className="image-modal-actions">
                        <button
                          onClick={() => {
                            handleDownload(selectedImage);
                          }}
                          className="btn-modal-download"
                        >
                          ⬇️ Descargar
                        </button>
                        {canDelete(selectedImage) && (
                          <button
                            onClick={() => {
                              handleDelete(selectedImage);
                              handleCloseModal();
                            }}
                            className="btn-modal-delete"
                            disabled={deletingId === selectedImage.id}
                            title="Eliminar"
                          >
                            <img src={deleteIcon} alt="Eliminar" className="btn-icon" />
                            <span>Eliminar</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {hasNext && (
                    <button 
                      className="image-modal-nav image-modal-next" 
                      onClick={handleNextImage}
                      aria-label="Siguiente imagen"
                    >
                      ›
                    </button>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

