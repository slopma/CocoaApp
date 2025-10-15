import React from 'react';
import { useSettings } from '../hooks/useSettings';
import ToggleSwitch from '../components/ui/ToggleSwitch';
import Button from '../components/ui/Button';

const SettingsScreen: React.FC = () => {
  const { settings, loading, updateSetting, resetSettings } = useSettings();

  const SettingItem: React.FC<{
    title: string;
    subtitle?: string;
    children: React.ReactNode;
  }> = ({ title, subtitle, children }) => (
    <div
      style={{
        backgroundColor: "var(--card-bg)",
        borderRadius: "16px",
        padding: "24px",
        marginBottom: "16px",
        boxShadow: "var(--shadow)",
        border: "1px solid var(--border-color)",
      }}
    >
      <div style={{ marginBottom: subtitle ? "12px" : "16px" }}>
        <h3 style={{ 
          margin: 0, 
          color: "var(--text-primary)", 
          fontSize: "18px", 
          fontWeight: "700",
          letterSpacing: "-0.025em"
        }}>
          {title}
        </h3>
        {subtitle && (
          <p style={{ 
            margin: "4px 0 0 0", 
            color: "var(--text-secondary)", 
            fontSize: "14px",
            lineHeight: "1.5"
          }}>
            {subtitle}
          </p>
        )}
      </div>
      {children}
    </div>
  );

  const Toggle: React.FC<{
    checked: boolean;
    onChange: (checked: boolean) => void;
  }> = ({ checked, onChange }) => (
    <ToggleSwitch
      checked={checked}
      onChange={onChange}
      size="md"
      color="blue"
    />
  );

  const Select: React.FC<{
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
  }> = ({ value, onChange, options }) => (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: "100%",
        padding: "12px 16px",
        borderRadius: "12px",
        border: "2px solid var(--border-color)",
        backgroundColor: "var(--input-bg)",
        color: "var(--text-primary)",
        fontSize: "14px",
        fontWeight: "500",
        transition: "all 0.2s ease-in-out",
        cursor: "pointer",
        appearance: "none",
        WebkitAppearance: "none",
        MozAppearance: "none"
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = "var(--accent-blue)";
        e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = "var(--border-color)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );

  const NumberInput: React.FC<{
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    unit?: string;
  }> = ({ value, onChange, min = 0, max = 100, unit }) => (
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value) || min)}
        min={min}
        max={max}
        style={{
          width: "80px",
          padding: "10px 12px",
          borderRadius: "12px",
          border: "2px solid var(--border-color)",
          backgroundColor: "var(--input-bg)",
          color: "var(--text-primary)",
          fontSize: "14px",
          fontWeight: "500",
          transition: "all 0.2s ease-in-out",
          textAlign: "center"
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "var(--accent-blue)";
          e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "var(--border-color)";
          e.currentTarget.style.boxShadow = "none";
        }}
      />
      {unit && <span style={{ color: "var(--text-secondary)", fontSize: "14px", fontWeight: "500" }}>{unit}</span>}
    </div>
  );

  if (loading) {
    return (
      <div
        style={{
          padding: "20px",
          paddingBottom: "90px",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "var(--bg-secondary)",
        }}
      >
        <p style={{ color: "var(--text-secondary)", fontSize: "16px" }}>Cargando configuración...</p>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "20px",
        paddingBottom: "90px",
        backgroundColor: "var(--bg-secondary)",
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          marginBottom: "20px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <h1 style={{ margin: 0, color: "var(--text-primary)", fontSize: "24px", fontWeight: "bold" }}>
          ⚙️ Configuración
        </h1>
      </div>

      <SettingItem
        title="Apariencia"
        subtitle="Personaliza la interfaz de la aplicación"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
          <span style={{ color: "var(--text-primary)", fontSize: "15px", fontWeight: "600", minWidth: "120px" }}>Tema</span>
            <Select
              value={settings.theme}
              onChange={(value) => updateSetting('theme', value as 'light' | 'dark')}
              options={[
                { value: "light", label: "Claro" },
                { value: "dark", label: "Oscuro" },
              ]}
            />
          </div>
        </div>
      </SettingItem>

      <SettingItem
        title="Notificaciones"
        subtitle="Gestiona las alertas y notificaciones"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
            <span style={{ color: "var(--text-primary)", fontSize: "15px", fontWeight: "600", minWidth: "120px" }}>Activar notificaciones</span>
            <Toggle
              checked={settings.notifications}
              onChange={(checked) => updateSetting('notifications', checked)}
            />
          </div>
        </div>
      </SettingItem>


      <SettingItem
        title="Actualización Automática"
        subtitle="Configura la frecuencia de actualización de datos"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
            <span style={{ color: "var(--text-primary)", fontSize: "15px", fontWeight: "600", minWidth: "120px" }}>Actualización automática</span>
            <Toggle
              checked={settings.autoRefresh}
              onChange={(checked) => updateSetting('autoRefresh', checked)}
            />
          </div>
          {settings.autoRefresh && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
              <span style={{ color: "var(--text-primary)", fontSize: "15px", fontWeight: "600", minWidth: "120px" }}>Intervalo de actualización</span>
              <NumberInput
                value={settings.refreshInterval}
                onChange={(value) => updateSetting('refreshInterval', value)}
                min={10}
                max={300}
                unit="segundos"
              />
            </div>
          )}
        </div>
      </SettingItem>


      <div
        style={{
          backgroundColor: "var(--card-bg)",
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "12px",
          boxShadow: "var(--shadow)",
          border: "1px solid var(--border-color)",
        }}
      >
        <h3 style={{ margin: "0 0 12px 0", color: "var(--text-primary)", fontSize: "16px", fontWeight: "600" }}>
          Acciones
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <Button
            onClick={resetSettings}
            variant="outline"
            color="red"
            fullWidth
            icon="🔄"
          >
            Restaurar configuración por defecto
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsScreen;