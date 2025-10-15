import React from 'react';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'green' | 'blue' | 'purple';
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  checked,
  onChange,
  disabled = false,
  size = 'md',
  color = 'green'
}) => {
  const sizeClasses = {
    sm: { width: '40px', height: '22px', thumb: '18px' },
    md: { width: '50px', height: '28px', thumb: '24px' },
    lg: { width: '60px', height: '34px', thumb: '30px' }
  };

  const colorClasses = {
    green: {
      on: 'var(--primary-green)',
      hover: 'var(--primary-green-hover)'
    },
    blue: {
      on: 'var(--accent-blue)',
      hover: 'var(--accent-blue-hover)'
    },
    purple: {
      on: '#8b5cf6',
      hover: '#7c3aed'
    }
  };

  const currentSize = sizeClasses[size];
  const currentColor = colorClasses[color];

  return (
    <div
      style={{
        width: currentSize.width,
        height: currentSize.height,
        backgroundColor: checked ? currentColor.on : '#e5e7eb',
        borderRadius: '9999px',
        position: 'relative',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease-in-out',
        opacity: disabled ? 0.5 : 1,
        boxShadow: checked ? '0 2px 4px rgba(0, 0, 0, 0.1)' : 'none'
      }}
      onClick={() => !disabled && onChange(!checked)}
      onMouseEnter={(e) => {
        if (!disabled && checked) {
          e.currentTarget.style.backgroundColor = currentColor.hover;
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && checked) {
          e.currentTarget.style.backgroundColor = currentColor.on;
        }
      }}
    >
      <div
        style={{
          width: currentSize.thumb,
          height: currentSize.thumb,
          backgroundColor: 'white',
          borderRadius: '50%',
          position: 'absolute',
          top: '2px',
          left: checked ? `calc(100% - ${currentSize.thumb} - 2px)` : '2px',
          transition: 'all 0.2s ease-in-out',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {checked && (
          <span style={{ fontSize: '10px', color: currentColor.on }}>
            ✓
          </span>
        )}
      </div>
    </div>
  );
};

export default ToggleSwitch;
