import React, { useEffect, useState } from "react"
import { estadoToIconUrl } from "../utils/mapIcons"

// ----------------- Tipos (iguales a los del mapa) -----------------
interface Fruto {
  fruto_id: string
  especie?: string
  estado_fruto?: string
}

interface Arbol {
  arbol_id: string
  nombre: string
  estado_arbol?: string
  ubicacion?: any
  frutos: Fruto[]  // Cambio: frutos en lugar de fruto
}

interface Cultivo {
  cultivo_id: string
  nombre: string
  arbol: Arbol[]
}

interface Lote {
  lote_id: string
  nombre: string
  cultivo: Cultivo[]
}

interface Finca {
  finca_id: string
  nombre: string
  created_at: string
  lote: Lote[]
}



// ----------------- Componente -----------------
const ZonesScreen: React.FC = () => {
  const [fincas, setFincas] = useState<Finca[]>([])
  const [loading, setLoading] = useState(true)

  // Estados para desplegables
  const [openFinca, setOpenFinca] = useState<string | null>(null)
  const [openLote, setOpenLote] = useState<string | null>(null)
  const [openCultivo, setOpenCultivo] = useState<string | null>(null)
  const [openArbol, setOpenArbol] = useState<string | null>(null)
  const [metrics, setMetrics] = useState<Record<string, any[]>>({})

  useEffect(() => {
    const fetchZonesData = async () => {
      setLoading(true)
      try {
        // Obtener árboles con frutos (mismos datos que el mapa)
        const arbolesRes = await fetch("http://localhost:8000/arboles")
        if (!arbolesRes.ok) throw new Error(`HTTP ${arbolesRes.status}`)
        const arbolesData = await arbolesRes.json()
        
        // Obtener cultivos para organizar por lotes
        const cultivosRes = await fetch("http://localhost:8000/cultivos")
        if (!cultivosRes.ok) throw new Error(`HTTP ${cultivosRes.status}`)
        const cultivosData = await cultivosRes.json()
        
        // Obtener lotes
        const lotesRes = await fetch("http://localhost:8000/lotes")
        if (!lotesRes.ok) throw new Error(`HTTP ${lotesRes.status}`)
        const lotesData = await lotesRes.json()
        
                // Organizar datos en la estructura jerárquica
                const organizedData = organizeDataByHierarchy(arbolesData, cultivosData, lotesData)
        console.log("🗺️ Datos organizados para zonas:", organizedData)
        console.log("🌳 Árboles originales:", arbolesData.arboles)
        setFincas(organizedData)
      } catch (error) {
        console.error("❌ Error cargando datos de zonas:", error)
      } finally {
      setLoading(false)
      }
    }

    fetchZonesData()
  }, [])

          // Función para organizar los datos en estructura jerárquica
          const organizeDataByHierarchy = (arbolesData: any, cultivosData: any, lotesData: any) => {
            // Extraer datos de los formatos de respuesta
            const arboles = arbolesData.arboles || []
            const cultivos = cultivosData.features || []
            const lotes = lotesData.features || []
            
            console.log("📊 Datos recibidos:", {
              arboles: arboles.length,
              cultivos: cultivos.length, 
              lotes: lotes.length
            })
            
            // Crear mapas para acceso rápido
            const cultivosMap = new Map()
            cultivos.forEach((c: any) => {
              if (c.properties?.cultivo_id) {
                cultivosMap.set(c.properties.cultivo_id, {
                  cultivo_id: c.properties.cultivo_id,
                  nombre: c.properties.nombre,
                  especie: c.properties.especie,
                  lote_id: c.properties.nombre.split(' - ')[0].replace('Lote ', '') // Extraer número de lote del nombre
                })
              }
            })
            
            const lotesMap = new Map()
            lotes.forEach((l: any) => {
              if (l.properties?.lote_id) {
                const loteNumero = l.properties.nombre.replace('Lote ', '')
                lotesMap.set(loteNumero, {
                  lote_id: l.properties.lote_id,
                  nombre: l.properties.nombre,
                  finca_id: "finca-yariguies", // Hardcodeado por ahora
                  estado: l.properties.estado
                })
              }
            })
            
            // Agrupar árboles por cultivo
            const arbolesPorCultivo = new Map<string, any[]>()
            arboles.forEach((arbol: any) => {
              const cultivoId = arbol.cultivo_id
              if (!arbolesPorCultivo.has(cultivoId)) {
                arbolesPorCultivo.set(cultivoId, [])
              }
              
              // Usar los frutos reales del backend
              const frutosReales = arbol.frutos || []
              
              arbolesPorCultivo.get(cultivoId)!.push({
                ...arbol,
                frutos: frutosReales
              })
            })
            
            // Agrupar cultivos por lote
            const cultivosPorLote = new Map<string, any[]>()
            cultivosMap.forEach((cultivo: any) => {
              const loteNumero = cultivo.lote_id
              if (!cultivosPorLote.has(loteNumero)) {
                cultivosPorLote.set(loteNumero, [])
              }
              cultivosPorLote.get(loteNumero)!.push({
                ...cultivo,
                arbol: arbolesPorCultivo.get(cultivo.cultivo_id) || []
              })
            })
            
            // Crear estructura de fincas
            const fincasMap = new Map<string, any>()
            lotesMap.forEach((lote: any) => {
              const fincaId = lote.finca_id
              if (!fincasMap.has(fincaId)) {
                fincasMap.set(fincaId, {
                  finca_id: fincaId,
                  nombre: "Finca Yariguíes",
                  created_at: new Date().toISOString(),
                  lote: []
                })
              }
              
              fincasMap.get(fincaId).lote.push({
                ...lote,
                cultivo: cultivosPorLote.get(lote.nombre.replace('Lote ', '')) || []
              })
            })
            
            const result = Array.from(fincasMap.values())
            console.log("🏗️ Estructura organizada:", result)
            return result
          }

  const fetchMetrics = async (arbolId: string) => {
    if (metrics[arbolId]) return // ya cargadas

    try {
      const res = await fetch(`http://localhost:8000/stats/metrics/${arbolId}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      
      const data = await res.json()
      setMetrics((prev) => ({ ...prev, [arbolId]: data || [] }))
    } catch (error) {
      console.error("❌ Error cargando métricas:", error)
    }
  }

  // Función para ordenar ascendente
  const sortAsc = <T extends { nombre?: string; especie?: string | null }>(
    arr: T[]
  ) =>
    [...arr].sort((a, b) =>
      (a.nombre ?? a.especie ?? "").localeCompare(b.nombre ?? b.especie ?? "")
    )

  return (
    <div
      style={{
        padding: "20px",
        paddingBottom: "90px",
        height: "100vh",
        overflowY: "auto",
        backgroundColor: "var(--bg-secondary)",
      }}
    >
      <h2
        style={{
          margin: "0 0 20px 0",
          color: "var(--text-primary)",
          fontSize: "24px",
          fontWeight: "bold",
        }}
      >
        🌍 Mis Zonas
      </h2>

      {loading && <p style={{ color: "var(--text-secondary)" }}>Cargando fincas...</p>}
      {!loading && fincas.length === 0 && (
        <p style={{ color: "var(--text-secondary)" }}>No tienes fincas registradas</p>
      )}

      {sortAsc(fincas).map((finca) => (
        <div
          key={finca.finca_id}
          style={{
            backgroundColor: "var(--card-bg)",
            borderRadius: "16px",
            marginBottom: "20px",
            boxShadow: "var(--shadow)",
            border: "2px solid var(--border-color)",
            overflow: "hidden",
          }}
        >
          {/* Header de la finca */}
          <div
            style={{
              padding: "20px",
              borderBottom: "1px solid var(--border-color)",
              backgroundColor: "var(--bg-secondary)",
              cursor: "pointer",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
            onClick={() =>
              setOpenFinca(openFinca === finca.finca_id ? null : finca.finca_id)
            }
          >
            <div>
              <h3
                style={{
                  margin: "0 0 6px 0",
                  color: "var(--text-primary)",
                  fontSize: "18px",
                  fontWeight: "600",
                }}
              >
                🏡 {finca.nombre}
              </h3>
              <p style={{ margin: 0, fontSize: "14px", color: "var(--text-secondary)" }}>
                Creada: {new Date(finca.created_at).toLocaleDateString()}
              </p>
            </div>
            <span
              style={{
                fontSize: "18px",
                color: "var(--text-muted)",
                transform:
                  openFinca === finca.finca_id ? "rotate(90deg)" : "rotate(0)",
                transition: "transform 0.2s ease",
              }}
            >
              ›
            </span>
          </div>

          {/* Lotes */}
          {openFinca === finca.finca_id && (
            <div>
              {sortAsc(finca.lote).map((lote) => (
                <div
                  key={lote.lote_id}
                  style={{
                    padding: "16px 20px",
                    borderBottom: "1px solid var(--border-color)",
                    cursor: "pointer",
                    backgroundColor: "var(--card-bg)",
                  }}
                  onClick={() =>
                    setOpenLote(openLote === lote.lote_id ? null : lote.lote_id)
                  }
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ fontSize: "16px", fontWeight: "500", color: "var(--text-primary)" }}>
                      📍 {lote.nombre}
                    </span>
                    <span
                      style={{
                        fontSize: "16px",
                        color: "var(--text-muted)",
                        transform:
                          openLote === lote.lote_id
                            ? "rotate(90deg)"
                            : "rotate(0)",
                        transition: "transform 0.2s ease",
                      }}
                    >
                      ›
                    </span>
                  </div>

                  {/* Cultivos */}
                  {openLote === lote.lote_id && (
                    <div style={{ marginTop: "8px", marginLeft: "20px" }}>
                      {sortAsc(lote.cultivo).map((cultivo) => (
                        <div
                          key={cultivo.cultivo_id}
                          style={{
                            marginBottom: "8px",
                            padding: "10px 12px",
                            backgroundColor: "var(--bg-secondary)",
                            borderRadius: "8px",
                            cursor: "pointer",
                          }}
                          onClick={(e) => {
                            e.stopPropagation()
                            setOpenCultivo(
                              openCultivo === cultivo.cultivo_id
                                ? null
                                : cultivo.cultivo_id
                            )
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <span style={{ fontSize: "14px", fontWeight: "500", color: "var(--text-primary)" }}>
                              🌱 {cultivo.nombre}
                            </span>
                            <span
                              style={{
                                fontSize: "14px",
                                color: "var(--text-muted)",
                                transform:
                                  openCultivo === cultivo.cultivo_id
                                    ? "rotate(90deg)"
                                    : "rotate(0)",
                                transition: "transform 0.2s ease",
                              }}
                            >
                              ›
                            </span>
                          </div>

                          {/* Árboles */}
                          {openCultivo === cultivo.cultivo_id && (
                            <div style={{ marginTop: "6px", marginLeft: "20px" }}>
                              {sortAsc(cultivo.arbol).map((arbol) => (
                                <div
                                  key={arbol.arbol_id}
                                  style={{
                                    marginBottom: "6px",
                                    padding: "6px 10px",
                                    backgroundColor: "var(--card-bg)",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setOpenArbol(
                                      openArbol === arbol.arbol_id
                                        ? null
                                        : arbol.arbol_id
                                    )
                                  }}
                                >
                                  <div
                                    style={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      alignItems: "center",
                                    }}
                                  >
                                    <span style={{ fontSize: "13px", color: "var(--text-primary)" }}>
                                      🌳 {arbol.nombre}
                                    </span>
                                    <span
                                      style={{
                                        fontSize: "13px",
                                        color: "var(--text-muted)",
                                        transform:
                                          openArbol === arbol.arbol_id
                                            ? "rotate(90deg)"
                                            : "rotate(0)",
                                        transition: "transform 0.2s ease",
                                      }}
                                    >
                                      ›
                                    </span>
                                  </div>

                                  {/* Frutos */}
                                  {openArbol === arbol.arbol_id && (
                                    <div
                                      style={{ marginTop: "4px", marginLeft: "20px" }}
                                    >
                                      {arbol.frutos.length > 0 ? (
                                        sortAsc(arbol.frutos).map((fruto) => (
                                          <div
                                            key={fruto.fruto_id}
                                            style={{
                                              fontSize: "12px",
                                              color: "var(--text-primary)",
                                              marginBottom: "6px",
                                              cursor: "pointer",
                                              padding: "8px 12px",
                                              borderRadius: "10px",
                                              backgroundColor: "var(--card-bg)",
                                              border: "1px solid var(--border-color)",
                                              display: "flex",
                                              alignItems: "center",
                                              gap: "10px",
                                              transition: "all 0.3s ease",
                                              boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                                            }}
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              fetchMetrics(arbol.arbol_id)
                                            }}
                                            onMouseEnter={(e) => {
                                              e.currentTarget.style.backgroundColor = "var(--accent-blue)";
                                              e.currentTarget.style.transform = "translateY(-2px)";
                                              e.currentTarget.style.boxShadow = "0 4px 12px rgba(59, 130, 246, 0.15)";
                                              e.currentTarget.style.borderColor = "var(--accent-blue-hover)";
                                              
                                              // Hover effect en la imagen
                                              const img = e.currentTarget.querySelector('img');
                                              if (img) {
                                                img.style.transform = "scale(1.1)";
                                                img.style.filter = "drop-shadow(0 4px 8px rgba(0,0,0,0.2))";
                                              }
                                            }}
                                            onMouseLeave={(e) => {
                                              e.currentTarget.style.backgroundColor = "var(--card-bg)";
                                              e.currentTarget.style.transform = "translateY(0)";
                                              e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.05)";
                                              e.currentTarget.style.borderColor = "var(--border-color)";
                                              
                                              // Reset hover effect en la imagen
                                              const img = e.currentTarget.querySelector('img');
                                              if (img) {
                                                img.style.transform = "scale(1)";
                                                img.style.filter = "drop-shadow(0 2px 4px rgba(0,0,0,0.1))";
                                              }
                                            }}
                                          >
                                            <img
                                              src={estadoToIconUrl[fruto.estado_fruto?.toLowerCase() || "inmaduro"]}
                                              alt={fruto.estado_fruto || "Inmaduro"}
                                              style={{
                                                width: "22px",
                                                height: "22px",
                                                borderRadius: "6px",
                                                transition: "all 0.2s ease",
                                                filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
                                              }}
                                            />
                                            <span style={{ fontWeight: "500" }}>
                                              {fruto.especie || "CH13"}
                                              {fruto.estado_fruto && (
                                                <span style={{ 
                                                  fontSize: "10px", 
                                                  color: "var(--text-secondary)",
                                                  marginLeft: "4px"
                                                }}>
                                                  - {fruto.estado_fruto}
                                                </span>
                                              )}
                                            </span>

                                                    </div>
                                                  ))
                                                ) : (
                                        <div style={{ 
                                          fontSize: "12px", 
                                          color: "var(--text-muted)",
                                          padding: "8px 12px",
                                          backgroundColor: "var(--bg-secondary)",
                                          borderRadius: "6px",
                                          textAlign: "center"
                                        }}>
                                          Sin cacaos disponibles
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
      
      {/* Mostrar métricas en un modal o sección expandida */}
      {Object.keys(metrics).length > 0 && (
        <div style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          backgroundColor: "var(--card-bg)",
          border: "1px solid var(--border-color)",
          borderRadius: "12px",
          padding: "16px",
          maxWidth: "300px",
          maxHeight: "200px",
          overflowY: "auto",
          boxShadow: "var(--shadow-lg)",
          zIndex: 1000
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <h4 style={{ margin: 0, color: "var(--text-primary)", fontSize: "14px" }}>
              📊 Métricas del Cacao
            </h4>
            <button
              onClick={() => setMetrics({})}
              style={{
                background: "none",
                border: "none",
                color: "var(--text-muted)",
                cursor: "pointer",
                fontSize: "16px",
                padding: "4px"
              }}
            >
              ✕
            </button>
          </div>
          {Object.entries(metrics).map(([arbolId, metricas]) => (
            <div key={arbolId} style={{ marginBottom: "12px" }}>
              {metricas.length > 0 ? (
                metricas.slice(0, 3).map((m) => (
                  <div
                    key={m.metric_id}
                    style={{
                      fontSize: "11px",
                      color: "var(--text-secondary)",
                      marginBottom: "4px",
                      padding: "4px 6px",
                      backgroundColor: "var(--bg-secondary)",
                      borderRadius: "4px"
                    }}
                  >
                    ⚡ Raw: {m.raw ?? "-"} | V: {m.voltaje ?? "-"} | C: {m.capacitancia ?? "-"}
                    <br />
                    📅 {new Date(m.created_at).toLocaleDateString()}
                  </div>
                ))
              ) : (
                <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>Sin métricas</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ZonesScreen
