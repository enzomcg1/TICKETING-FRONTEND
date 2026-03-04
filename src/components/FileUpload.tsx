import { useState, useRef } from 'react';
import './FileUpload.css';

interface FileUploadProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  maxFiles?: number;
  maxSize?: number; // en MB
}

export default function FileUpload({ files, onFilesChange, maxFiles = 5, maxSize = 10 }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (newFiles: File[]) => {
    const validFiles: File[] = [];
    const maxSizeBytes = maxSize * 1024 * 1024;

    newFiles.forEach((file) => {
      // Validar tamaño
      if (file.size > maxSizeBytes) {
        alert(`El archivo "${file.name}" excede el tamaño máximo de ${maxSize}MB`);
        return;
      }

      // Validar tipo
      const validTypes = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
        'video/mp4', 'video/webm', 'video/quicktime',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];

      if (!validTypes.includes(file.type)) {
        alert(`El archivo "${file.name}" no es un tipo permitido. Tipos permitidos: imágenes (jpg, png, gif, webp), videos (mp4, webm, mov), documentos (pdf, doc, docx)`);
        return;
      }

      validFiles.push(file);
    });

    // Verificar límite de archivos
    const remainingSlots = maxFiles - files.length;
    if (validFiles.length > remainingSlots) {
      alert(`Solo puedes subir ${remainingSlots} archivo(s) más. Máximo ${maxFiles} archivos.`);
      validFiles.splice(remainingSlots);
    }

    onFilesChange([...files, ...validFiles]);
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    onFilesChange(newFiles);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const getFileIcon = (type: string): string => {
    if (type.startsWith('image/')) return '🖼️';
    if (type.startsWith('video/')) return '🎥';
    if (type === 'application/pdf') return '📄';
    if (type.includes('word')) return '📝';
    return '📎';
  };

  return (
    <div className="file-upload">
      <div
        className={`file-upload-dropzone ${dragActive ? 'active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*,.pdf,.doc,.docx"
          onChange={handleFileInput}
          style={{ display: 'none' }}
        />
        <div className="file-upload-content">
          <span className="file-upload-icon">📎</span>
          <p className="file-upload-text">
            {dragActive ? 'Suelta los archivos aquí' : 'Haz clic o arrastra archivos aquí'}
          </p>
          <p className="file-upload-hint">
            Máximo {maxFiles} archivos, {maxSize}MB cada uno
          </p>
        </div>
      </div>

      {files.length > 0 && (
        <div className="file-upload-list">
          <h4>Archivos seleccionados ({files.length}/{maxFiles}):</h4>
          {files.map((file, index) => (
            <div key={index} className="file-upload-item">
              <span className="file-icon">{getFileIcon(file.type)}</span>
              <div className="file-info">
                <span className="file-name">{file.name}</span>
                <span className="file-size">{formatFileSize(file.size)}</span>
              </div>
              <button
                type="button"
                className="file-remove-btn"
                onClick={() => removeFile(index)}
                title="Eliminar archivo"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

