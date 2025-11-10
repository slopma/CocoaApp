import React, { useEffect, useState } from "react"
import type { Finca } from "../types/domain"
import GraficoConTabla from "../components/stats/GraficoConTabla"
import "../styles/stats-screen.css"

interface StatsScreenProps {
  geodata: any
}

interface StatsResponse {
  resumen_general: {
    conteo: Record<string, number>
    estructura: {
      fincas: number
      lotes: number
      cultivos: number
      arboles: number
      frutos: number
    }
  }
  por_finca: Array<{
    finca_id: string
    nombre: string
    conteo: Record<string, number>
    estructura: any
  }>
  fincas: Finca[]
}

const StatsScreen: React.FC<StatsScreenProps> = ({ geodata }) => {
  void geodata
  const [statsData, setStatsData] = useState<StatsResponse | null>(null)
  const [fincasList, setFincasList] = useState<Array<{ finca_id: string; nombre: string }>>([])
  const [lotesList, setLotesList] = useState<Array<{ lote_id: string; nombre: string }>>([])
  const [loading, setLoading] = useState(true)
  const [selectedFinca, setSelectedFinca] = useState<string>("")
  const [selectedLote, setSelectedLote] = useState<string>("")

  useEffect(() => {
    const fetchFincas = async () => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/stats/fincas/`)
      const data = await res.json()
      setFincasList(data)
    }
    fetchFincas()
  }, [])

  useEffect(() => {
    if (selectedFinca) {
      const fetchLotes = async () => {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/stats/lotes?finca_id=${selectedFinca}`)
        
        const data = await res.json()
        setLotesList(data)
      }
      fetchLotes()
    } else {
      setLotesList([])
      setSelectedLote("")
    }
  }, [selectedFinca])

  useEffect(() => {
    
    const fetchStats = async () => {
      setLoading(true)
      try {
        let url = `${import.meta.env.VITE_API_URL}/stats/`
        
        const params = new URLSearchParams()
        if (selectedFinca) params.append("finca_id", selectedFinca)
        if (selectedLote) params.append("lote_id", selectedLote)
        if (params.toString()) url += `?${params.toString()}`

        const res = await fetch(url)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        
        const data = await res.json();
        console.debug("📦 Datos recibidos desde /stats/:", data);
        setStatsData(data);
        setStatsData(data)
      } catch (error) {
        console.error("❌ Error cargando estadísticas:", error)
      } finally {
        setLoading(false)
      }
    }
    

    fetchStats()
  }, [selectedFinca, selectedLote])

  const estructuraGeneral = statsData?.resumen_general.estructura || {
    fincas: 0,
    lotes: 0,
    cultivos: 0,
    arboles: 0,
    frutos: 0,
  }

  const conteoGeneral = statsData?.resumen_general.conteo || {
    Fincas: estructuraGeneral.fincas,
    Lotes: estructuraGeneral.lotes,
    Cultivos: estructuraGeneral.cultivos,
    Árboles: estructuraGeneral.arboles,
    Frutos: estructuraGeneral.frutos,
  };

  console.debug("🧩 Estado actual:", {
    selectedFinca,
    selectedLote,
    conteoGeneral,
    estructuraGeneral,
    porFinca: statsData?.por_finca,
  });


  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        backgroundColor: "var(--bg-secondary)",
        display: "flex",
        justifyContent: "center",
        paddingBottom: "90px",
      }}
    >
      {/* Contenedor centrado con ancho máximo */}
      <div
        style={{
          width: "100%",
          maxWidth: "1200px",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header + Filtros */}
        <div style={{ flex: "0 0 auto", marginBottom: "24px" }}>
          <h2 
            style={{ 
              marginBottom: "20px", 
              color: "var(--text-primary)", 
              fontSize: "28px", 
              fontWeight: "700",
              letterSpacing: "-0.5px"
            }}
          >
            📊 Estadísticas
          </h2>
          <div 
            style={{ 
              display: "flex", 
              flexWrap: "wrap",
              gap: "12px", 
              marginBottom: "20px" 
            }}
          >
            <select
              value={selectedFinca}
              onChange={(e) => {
                setSelectedFinca(e.target.value)
                setSelectedLote("")
              }}
              style={{
                padding: "12px 16px",
                borderRadius: "12px",
                border: "2px solid var(--border-color)",
                backgroundColor: "var(--card-bg)",
                color: "var(--text-primary)",
                fontSize: "15px",
                fontWeight: "500",
                minWidth: "180px",
                flex: "1 1 180px",
                cursor: "pointer",
                transition: "all 0.2s ease",
                outline: "none",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "var(--accent-blue)"
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)"
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "var(--border-color)"
                e.currentTarget.style.boxShadow = "none"
              }}
            >
              <option value="">📍 Todas las fincas</option>
              {fincasList.map((f) => (
                <option key={f.finca_id} value={f.finca_id}>
                  {f.nombre}
                </option>
              ))}
            </select>

            <select
              value={selectedLote}
              onChange={(e) => setSelectedLote(e.target.value)}
              disabled={!selectedFinca}
              style={{
                padding: "12px 16px",
                borderRadius: "12px",
                border: "2px solid var(--border-color)",
                backgroundColor: "var(--card-bg)",
                color: "var(--text-primary)",
                fontSize: "15px",
                fontWeight: "500",
                minWidth: "180px",
                flex: "1 1 180px",
                cursor: selectedFinca ? "pointer" : "not-allowed",
                transition: "all 0.2s ease",
                outline: "none",
                opacity: !selectedFinca ? 0.5 : 1,
              }}
              onFocus={(e) => {
                if (selectedFinca) {
                  e.currentTarget.style.borderColor = "var(--accent-blue)"
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)"
                }
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "var(--border-color)"
                e.currentTarget.style.boxShadow = "none"
              }}
            >
              <option value="">🌳 Todos los lotes</option>
              {lotesList.map((l) => {
                const isLote1 = l.nombre === "Lote 1";
                return (
                  <option 
                    key={l.lote_id} 
                    value={l.lote_id}
                    disabled={isLote1}
                    style={{
                      opacity: isLote1 ? 0.5 : 1,
                      fontStyle: isLote1 ? "italic" : "normal",
                    }}
                  >
                    {l.nombre}{isLote1 ? " (Administrativo)" : ""}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* Contenido scrollable */}
        <div style={{ flex: "1 1 auto" }}>
          {loading && (
            <div style={{ 
              textAlign: "center", 
              padding: "60px 20px",
              color: "var(--text-secondary)"
            }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>⏳</div>
              <p style={{ fontSize: "16px", fontWeight: "500" }}>Cargando estadísticas...</p>
            </div>
          )}

          {!loading && statsData && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {/* Mostrar Resumen General solo si NO hay finca seleccionada O si hay más de una finca */}
              {(!selectedFinca || (statsData.por_finca && statsData.por_finca.length > 1)) && (
                <div 
                style={{ 
                  background: "var(--card-bg)", 
                  padding: "28px", 
                  borderRadius: "20px", 
                  border: "2px solid var(--border-color)", 
                  boxShadow: "var(--shadow)",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)"
                  e.currentTarget.style.boxShadow = "0 8px 24px rgba(0, 0, 0, 0.12)"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)"
                  e.currentTarget.style.boxShadow = "var(--shadow)"
                }}
              >
                <h3 
                  style={{ 
                    color: "var(--text-primary)", 
                    marginBottom: "20px", 
                    fontSize: "20px", 
                    fontWeight: "700",
                    letterSpacing: "-0.3px"
                  }}
                >
                  📊 Resumen General
                </h3>
                <GraficoConTabla conteo={conteoGeneral} />
                <div 
                  style={{ 
                    marginTop: "20px",
                    padding: "16px",
                    backgroundColor: "var(--bg-secondary)",
                    borderRadius: "12px",
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "16px",
                    justifyContent: "space-around"
                  }}
                >
                  {[
                    { label: "Fincas", value: estructuraGeneral.fincas, icon: "🏡" },
                    { label: "Lotes", value: estructuraGeneral.lotes, icon: "📦" },
                    { label: "Cultivos", value: estructuraGeneral.cultivos, icon: "🌱" },
                    { label: "Árboles", value: estructuraGeneral.arboles, icon: "🌳" },
                    { label: "Frutos", value: estructuraGeneral.frutos, icon: "🫘" },
                  ].map((item) => (
                    <div key={item.label} style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "24px", marginBottom: "4px" }}>{item.icon}</div>
                      <div style={{ fontSize: "22px", fontWeight: "700", color: "var(--text-primary)" }}>
                        {item.value}
                      </div>
                      <div style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: "500" }}>
                        {item.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              )}

              {/* Por finca - Solo mostrar si hay una finca seleccionada Y hay UNA SOLA finca en los resultados */}
              {selectedFinca && statsData.por_finca && statsData.por_finca.length === 1 && statsData.por_finca.map((finca) => (
                <div 
                  key={finca.finca_id} 
                  style={{ 
                    background: "var(--card-bg)", 
                    padding: "28px", 
                    borderRadius: "20px", 
                    border: "2px solid var(--border-color)", 
                    boxShadow: "var(--shadow)",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)"
                    e.currentTarget.style.boxShadow = "0 8px 24px rgba(0, 0, 0, 0.12)"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)"
                    e.currentTarget.style.boxShadow = "var(--shadow)"
                  }}
                >
                  <h3 
                    style={{ 
                      color: "var(--text-primary)", 
                      marginBottom: "20px", 
                      fontSize: "20px", 
                      fontWeight: "700",
                      letterSpacing: "-0.3px"
                    }}
                  >
                    🏡 {finca.nombre}
                  </h3>
                  <GraficoConTabla conteo={finca.conteo} />
                  <div 
                    style={{ 
                      marginTop: "20px",
                      padding: "16px",
                      backgroundColor: "var(--bg-secondary)",
                      borderRadius: "12px",
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "16px",
                      justifyContent: "space-around"
                    }}
                  >
                    {[
                      { label: "Lotes", value: finca.estructura.lotes, icon: "📦" },
                      { label: "Cultivos", value: finca.estructura.cultivos, icon: "🌱" },
                      { label: "Árboles", value: finca.estructura.arboles, icon: "🌳" },
                      { label: "Frutos", value: finca.estructura.frutos, icon: "🫘" },
                    ].map((item) => (
                      <div key={item.label} style={{ textAlign: "center" }}>
                        <div style={{ fontSize: "24px", marginBottom: "4px" }}>{item.icon}</div>
                        <div style={{ fontSize: "22px", fontWeight: "700", color: "var(--text-primary)" }}>
                          {item.value}
                        </div>
                        <div style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: "500" }}>
                          {item.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default StatsScreen
