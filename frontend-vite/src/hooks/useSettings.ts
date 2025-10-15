import { useState, useEffect } from 'react'

export interface AppSettings {
  theme: 'light' | 'dark'
  notifications: boolean
  autoRefresh: boolean
  refreshInterval: number
}

const defaultSettings: AppSettings = {
  theme: 'light',
  notifications: true,
  autoRefresh: true,
  refreshInterval: 30
}

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings)
  const [loading, setLoading] = useState(true)

  // Cargar configuraciones al inicializar
  useEffect(() => {
    const loadSettings = () => {
      try {
        const saved = localStorage.getItem('cocoaApp_settings')
        if (saved) {
          const parsedSettings = JSON.parse(saved)
          setSettings({ ...defaultSettings, ...parsedSettings })
          console.log('🔧 Settings loaded:', parsedSettings)
        } else {
          console.log('🔧 No saved settings found, using defaults')
        }
      } catch (error) {
        console.error('🔧 Error loading settings:', error)
        setSettings(defaultSettings)
      } finally {
        setLoading(false)
      }
    }

    loadSettings()
  }, [])

  // Aplicar tema al documento
  useEffect(() => {
    const applyTheme = () => {
      const root = document.documentElement
      
      if (settings.theme === 'dark') {
        root.style.setProperty('--bg-primary', '#111827')
        root.style.setProperty('--bg-secondary', '#1f2937')
        root.style.setProperty('--text-primary', '#f9fafb')
        root.style.setProperty('--text-secondary', '#d1d5db')
        root.style.setProperty('--text-muted', '#9ca3af')
        root.style.setProperty('--border-color', '#374151')
        root.style.setProperty('--card-bg', '#1f2937')
        root.style.setProperty('--input-bg', '#374151')
        root.style.setProperty('--shadow', '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3)')
        root.style.setProperty('--shadow-lg', '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)')
        
        // Aplicar al body
        document.body.style.backgroundColor = '#111827'
        document.body.style.color = '#f9fafb'
        
        console.log('🌙 Dark theme applied')
      } else {
        root.style.setProperty('--bg-primary', '#ffffff')
        root.style.setProperty('--bg-secondary', '#f8f9fa')
        root.style.setProperty('--text-primary', '#1a1a1a')
        root.style.setProperty('--text-secondary', '#6c757d')
        root.style.setProperty('--text-muted', '#9ca3af')
        root.style.setProperty('--border-color', '#e5e7eb')
        root.style.setProperty('--card-bg', '#ffffff')
        root.style.setProperty('--input-bg', '#ffffff')
        root.style.setProperty('--shadow', '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)')
        root.style.setProperty('--shadow-lg', '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)')
        
        // Aplicar al body
        document.body.style.backgroundColor = '#ffffff'
        document.body.style.color = '#1a1a1a'
        
        console.log('☀️ Light theme applied')
      }
    }

    if (!loading) {
      applyTheme()
    }
  }, [settings.theme, loading])


  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    
    try {
      localStorage.setItem('cocoaApp_settings', JSON.stringify(newSettings))
      console.log(`🔧 Setting updated: ${key} = ${value}`)
    } catch (error) {
      console.error('🔧 Error saving settings:', error)
    }
  }

  const resetSettings = () => {
    setSettings(defaultSettings)
    localStorage.removeItem('cocoaApp_settings')
    console.log('🔧 Settings reset to defaults')
  }

  return {
    settings,
    loading,
    updateSetting,
    resetSettings
  }
}
