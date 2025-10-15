import React from 'react';

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
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  const getColorStyles = (color: string, variant: string) => {
    const styles = {
      green: {
        primary: {
          backgroundColor: 'var(--primary-green)',
          color: 'white',
          border: 'none',
          ':hover': {
            backgroundColor: 'var(--primary-green-hover)'
          }
        },
        outline: {
          backgroundColor: 'transparent',
          color: 'var(--primary-green)',
          border: '2px solid var(--primary-green)',
          ':hover': {
            backgroundColor: 'var(--primary-green)',
            color: 'white'
          }
        }
      },
      blue: {
        primary: {
          backgroundColor: 'var(--accent-blue)',
          color: 'white',
          border: 'none',
          ':hover': {
            backgroundColor: 'var(--accent-blue-hover)'
          }
        },
        outline: {
          backgroundColor: 'transparent',
          color: 'var(--accent-blue)',
          border: '2px solid var(--accent-blue)',
          ':hover': {
            backgroundColor: 'var(--accent-blue)',
            color: 'white'
          }
        }
      },
      red: {
        primary: {
          backgroundColor: 'var(--error)',
          color: 'white',
          border: 'none',
          ':hover': {
            backgroundColor: '#dc2626'
          }
        },
        outline: {
          backgroundColor: 'transparent',
          color: 'var(--error)',
          border: '2px solid var(--error)',
          ':hover': {
            backgroundColor: 'var(--error)',
            color: 'white'
          }
        }
      }
    };
    
    return styles[color]?.[variant] || styles.blue.primary;
  };

  const sizeStyles = {
    sm: { padding: '8px 16px', fontSize: '14px' },
    md: { padding: '12px 24px', fontSize: '16px' },
    lg: { padding: '16px 32px', fontSize: '18px' }
  };

  const colorStyles = getColorStyles(color, variant);
  const currentSize = sizeStyles[size];

  return (
    <button
      className={className}
      style={{
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
        ...colorStyles,
        ...style
      }}
      onMouseEnter={(e) => {
        if (!disabled && !loading && colorStyles[':hover']) {
          Object.assign(e.currentTarget.style, colorStyles[':hover']);
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !loading) {
          Object.assign(e.currentTarget.style, colorStyles);
        }
      }}
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
