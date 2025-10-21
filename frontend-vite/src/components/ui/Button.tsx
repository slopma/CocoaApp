import React, { useState } from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  color?: 'green' | 'blue' | 'red' | 'gray';
  fullWidth?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  color = 'blue',
  fullWidth = false,
  loading = false,
  icon,
  iconPosition = 'left',
  className = '',
  style,
  disabled,
  ...props
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const getColorStyles = (
    color: NonNullable<ButtonProps['color']>,
    variant: NonNullable<ButtonProps['variant']>
  ): [React.CSSProperties, React.CSSProperties] => {
    const styles = {
      green: {
        primary: {
          base: { backgroundColor: 'var(--primary-green)', color: 'white', border: 'none' },
          hover: { backgroundColor: 'var(--primary-green-hover)' },
        },
        outline: {
          base: { backgroundColor: 'transparent', color: 'var(--primary-green)', border: '2px solid var(--primary-green)' },
          hover: { backgroundColor: 'var(--primary-green)', color: 'white' },
        },
        secondary: {
          base: { backgroundColor: 'var(--primary-green-light)', color: 'var(--primary-green-hover)', border: 'none' },
          hover: { backgroundColor: '#a7f3d0' },
        },
        ghost: {
          base: { backgroundColor: 'transparent', color: 'var(--primary-green)', border: 'none' },
          hover: { backgroundColor: 'var(--primary-green-light)' },
        },
      },
      blue: {
        primary: {
          base: { backgroundColor: 'var(--accent-blue)', color: 'white', border: 'none' },
          hover: { backgroundColor: 'var(--accent-blue-hover)' },
        },
        outline: {
          base: { backgroundColor: 'transparent', color: 'var(--accent-blue)', border: '2px solid var(--accent-blue)' },
          hover: { backgroundColor: 'var(--accent-blue)', color: 'white' },
        },
        secondary: {
          base: { backgroundColor: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-blue)', border: 'none' },
          hover: { backgroundColor: 'rgba(59, 130, 246, 0.2)' },
        },
        ghost: {
          base: { backgroundColor: 'transparent', color: 'var(--accent-blue)', border: 'none' },
          hover: { backgroundColor: 'rgba(59, 130, 246, 0.1)' },
        },
      },
      red: {
        primary: {
          base: { backgroundColor: 'var(--error)', color: 'white', border: 'none' },
          hover: { backgroundColor: '#dc2626' },
        },
        outline: {
          base: { backgroundColor: 'transparent', color: 'var(--error)', border: '2px solid var(--error)' },
          hover: { backgroundColor: 'var(--error)', color: 'white' },
        },
        secondary: {
          base: { backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', border: 'none' },
          hover: { backgroundColor: 'rgba(239, 68, 68, 0.2)' },
        },
        ghost: {
          base: { backgroundColor: 'transparent', color: 'var(--error)', border: 'none' },
          hover: { backgroundColor: 'rgba(239, 68, 68, 0.1)' },
        },
      },
      gray: {
        primary: {
          base: { backgroundColor: 'var(--text-muted)', color: 'white', border: 'none' },
          hover: { backgroundColor: 'var(--text-secondary)' },
        },
        outline: {
          base: { backgroundColor: 'transparent', color: 'var(--text-secondary)', border: '2px solid var(--text-muted)' },
          hover: { backgroundColor: 'var(--text-muted)', color: 'white' },
        },
        secondary: {
          base: { backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: 'none' },
          hover: { backgroundColor: 'var(--border-color)' },
        },
        ghost: {
          base: { backgroundColor: 'transparent', color: 'var(--text-secondary)', border: 'none' },
          hover: { backgroundColor: 'var(--bg-secondary)' },
        },
      }
    };

    const styleSet = styles[color]?.[variant] || styles.blue.primary;
    return [styleSet.base, styleSet.hover];
  };

  const sizeStyles = {
    sm: { padding: '8px 16px', fontSize: '14px' },
    md: { padding: '12px 24px', fontSize: '16px' },
    lg: { padding: '16px 32px', fontSize: '18px' },
  };

  const [baseColorStyles, hoverColorStyles] = getColorStyles(color, variant);
  const currentSize = sizeStyles[size];

  const buttonStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '600',
    borderRadius: '12px',
    transition: 'all 0.2s ease-in-out',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled || loading ? 0.6 : 1,
    width: fullWidth ? '100%' : 'auto',
    boxShadow: variant === 'primary' ? 'var(--shadow)' : 'none',
    ...currentSize,
    ...baseColorStyles,
    ...(isHovered && !disabled && !loading ? hoverColorStyles : {}),
    ...style,
  };

  return (
    <button
      className={className}
      style={buttonStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      
      {!loading && icon && iconPosition === 'left' && (
        <span className="mr-2">{icon}</span>
      )}
      
      {children}
      
      {!loading && icon && iconPosition === 'right' && (
        <span className="ml-2">{icon}</span>
      )}
    </button>
  );
};

export default Button;
