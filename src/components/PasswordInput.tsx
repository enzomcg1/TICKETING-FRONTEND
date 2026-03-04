import { useState } from 'react';
import './PasswordInput.css';

interface PasswordInputProps {
  id?: string;
  name?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  autoComplete?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  minLength?: number;
  className?: string;
}

function PasswordInput({
  id,
  name = 'password',
  value,
  onChange,
  autoComplete,
  placeholder = '********',
  required = false,
  disabled = false,
  minLength,
  className = '',
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={`password-input-container ${className}`}>
      <input
        type={showPassword ? 'text' : 'password'}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        minLength={minLength}
        className="password-input"
      />
      <button
        type="button"
        className="password-toggle"
        onClick={togglePasswordVisibility}
        disabled={disabled}
        aria-label={showPassword ? 'Ocultar contrasena' : 'Mostrar contrasena'}
      >
        {showPassword ? 'Hide' : 'Show'}
      </button>
    </div>
  );
}

export default PasswordInput;
