import React, { useEffect, useState } from "react"
import { estadoToIconUrl } from "../utils/mapIcons"

// Iconos desde Supabase
const ARBOL_ICON_URL = "https://zlkdxzfxkhohlpswdmap.supabase.co/storage/v1/object/public/Cocoa-bucket/icons/cocoa-icons/cacao-arbol.png"
const FINCA_ICON_URL = "https://zlkdxzfxkhohlpswdmap.supabase.co/storage/v1/object/public/Cocoa-bucket/icons/app-icons/finca.png"
const PIN_ICON_URL = "https://zlkdxzfxkhohlpswdmap.supabase.co/storage/v1/object/public/Cocoa-bucket/icons/app-icons/pin.png"

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



// ----------------- Props -----------------
interface ZonesScreenProps {
  onNavigateToMap?: (arbolId: string) => void
}

// ----------------- Componente -----------------
const ZonesScreen: React.FC<ZonesScreenProps> = ({ onNavigateToMap }) => {
  const [fincas, setFincas] = useState<Finca[]>([])
  const [loading, setLoading] = useState(true)
  const [showTip, setShowTip] = useState(true) // Estado para mostrar/ocultar el tip

  // Estados para desplegables
  const [openFinca, setOpenFinca] = useState<string | null>("finca-yariguies") // Finca expandida por defecto
  const [openLote, setOpenLote] = useState<string | null>(null)
  const [openArbol, setOpenArbol] = useState<string | null>(null)

  useEffect(() => {
    const fetchZonesData = async () => {
      setLoading(true)
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        
        // Obtener árboles con frutos (mismos datos que el mapa)
        const arbolesRes = await fetch(`${apiUrl}/arboles`)
        if (!arbolesRes.ok) throw new Error(`HTTP ${arbolesRes.status}`)
        const arbolesData = await arbolesRes.json()
        
        // Obtener cultivos para organizar por lotes
        const cultivosRes = await fetch(`${apiUrl}/cultivos`)
        if (!cultivosRes.ok) throw new Error(`HTTP ${cultivosRes.status}`)
        const cultivosData = await cultivosRes.json()
        
        // Obtener lotes
        const lotesRes = await fetch(`${apiUrl}/lotes`)
        if (!lotesRes.ok) throw new Error(`HTTP ${lotesRes.status}`)
        const lotesData = await lotesRes.json()
        
                // Organizar datos en la estructura jerárquica
                const organizedData = organizeDataByHierarchy(arbolesData, cultivosData, lotesData)
        console.log("🗺️ Datos organizados para zonas:", organizedData)
        console.log("🌳 Árboles originales:", arbolesData.arboles)
        setFincas(organizedData)
        
        // Expandir la primera finca automáticamente si hay datos
        if (organizedData.length > 0) {
          setOpenFinca(organizedData[0].finca_id)
        }
      } catch (error) {
        console.error("❌ Error cargando datos de zonas:", error)
      } finally {
      setLoading(false)
      }
    }

    fetchZonesData()
  }, [])

          // Función para organizar los datos en estructura jerárquica (usando IDs reales)
          const organizeDataByHierarchy = (arbolesData: any, cultivosData: any, lotesData: any) => {
            const arboles: any[] = arbolesData?.arboles || []
            const cultivos: any[] = cultivosData?.features || []
            const lotes: any[] = lotesData?.features || []

            console.log("📊 Datos recibidos:", {
              arboles: arboles.length,
              cultivos: cultivos.length,
              lotes: lotes.length,
            })

            // Mapear lotes por lote_id (normalizar IDs a string)
            const lotesById = new Map<string, any>()
            lotes.forEach((l: any) => {
              const id = String(l?.properties?.lote_id || '').trim()
              if (id) {
                lotesById.set(id, {
                  lote_id: id,
                  nombre: l.properties.nombre,
                  finca_id: "finca-yariguies",
                  estado: l.properties.estado,
                  cultivo: [],
                })
              }
            })
            console.log(`📍 Lotes mapeados: ${lotesById.size}`, Array.from(lotesById.keys()))

            // Finca única (por ahora)
            const finca = {
              finca_id: "finca-yariguies",
              nombre: "Finca Yariguies",
              created_at: new Date().toISOString(),
              lote: Array.from(lotesById.values()),
            }

            // Asignar cultivos por properties.lote_id (normalizar IDs)
            let cultivosAsignados = 0
            let cultivosSinLote = 0
            cultivos.forEach((c: any) => {
              const loteId = String(c?.properties?.lote_id || '').trim()
              const lote = loteId ? lotesById.get(loteId) : null
              if (lote) {
                lote.cultivo.push({
                  cultivo_id: String(c.properties.cultivo_id || '').trim(),
                  nombre: c.properties.nombre,
                  especie: c.properties.especie,
                  arbol: [],
                })
                cultivosAsignados++
              } else {
                cultivosSinLote++
                console.warn(`⚠️ Cultivo sin lote_id válido:`, {
                  cultivo_id: c.properties?.cultivo_id,
                  nombre: c.properties?.nombre,
                  lote_id: c.properties?.lote_id,
                  lote_id_normalizado: loteId,
                  lotes_disponibles: Array.from(lotesById.keys())
                })
              }
            })
            console.log(`📦 Cultivos asignados: ${cultivosAsignados}, sin asignar: ${cultivosSinLote}`)

            // Índice de cultivos (normalizar IDs)
            const cultivosById = new Map<string, any>()
            finca.lote.forEach((l: any) => l.cultivo.forEach((c: any) => {
              const cultivoId = String(c.cultivo_id || '').trim()
              if (cultivoId) cultivosById.set(cultivoId, c)
            }))
            console.log(`🌾 Cultivos indexados: ${cultivosById.size}`, Array.from(cultivosById.keys()).slice(0, 5))

            // Asignar árboles a sus cultivos (normalizar IDs)
            let arbolesAsignados = 0
            let arbolesSinCultivo = 0
            arboles.forEach((a: any) => {
              const cultivoId = String(a.cultivo_id || '').trim()
              const c = cultivoId ? cultivosById.get(cultivoId) : null
              if (c) {
                c.arbol.push(a)
                arbolesAsignados++
              } else {
                arbolesSinCultivo++
                console.warn(`⚠️ Árbol sin cultivo_id válido:`, {
                  arbol_id: a.arbol_id,
                  nombre: a.nombre,
                  cultivo_id: a.cultivo_id,
                  cultivo_id_normalizado: cultivoId,
                  cultivos_disponibles: Array.from(cultivosById.keys()).slice(0, 5)
                })
              }
            })
            console.log(`🌳 Árboles asignados: ${arbolesAsignados}, sin asignar: ${arbolesSinCultivo}`)
            
            // Log de estructura final
            finca.lote.forEach((l: any) => {
              const totalArboles = l.cultivo.reduce((acc: number, c: any) => acc + (c.arbol?.length || 0), 0)
              console.log(`📍 ${l.nombre}: ${l.cultivo.length} cultivos, ${totalArboles} árboles`)
            })

            return [finca]
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
        padding: "24px",
        paddingBottom: "100px",
        height: "100vh",
        overflowY: "auto",
        backgroundColor: "var(--bg-secondary)",
      }}
    >
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        marginBottom: "24px",
      }}>
        <div style={{
          width: "40px",
          height: "40px",
          borderRadius: "12px",
          backgroundColor: "var(--card-bg)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "20px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}>
          🌍
        </div>
        <h2
          style={{
            margin: 0,
            color: "var(--text-primary)",
            fontSize: "28px",
            fontWeight: "700",
          }}
        >
          Mis Zonas
        </h2>
      </div>

      {loading && <p style={{ color: "var(--text-secondary)" }}>Cargando fincas...</p>}
      {!loading && fincas.length === 0 && (
        <p style={{ color: "var(--text-secondary)" }}>No tienes fincas registradas</p>
      )}
      
      {!loading && fincas.length > 0 && showTip && (
        <div style={{
          backgroundColor: "#3b82f6",
          padding: "12px 16px",
          borderRadius: "12px",
          marginBottom: "20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "10px",
          boxShadow: "0 2px 8px rgba(59, 130, 246, 0.2)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "18px" }}>💡</span>
            <span style={{ color: "white", fontSize: "13px", fontWeight: "500" }}>
              Toca cualquier fruto para verlo en el mapa
            </span>
          </div>
          <button
            onClick={() => setShowTip(false)}
            style={{
              background: "rgba(255, 255, 255, 0.2)",
              border: "none",
              color: "white",
              cursor: "pointer",
              fontSize: "16px",
              padding: "4px 8px",
              borderRadius: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s ease",
              fontWeight: "bold",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
            }}
          >
            ✕
          </button>
        </div>
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
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <img 
                  src={FINCA_ICON_URL} 
                  alt="Finca"
                  style={{
                    width: "20px",
                    height: "20px",
                    objectFit: "contain",
                  }}
                />
                {finca.nombre}
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
              {sortAsc(finca.lote).map((lote) => {
                // Verificar si es el Lote 1 (administrativo)
                const isLote1 = lote.nombre === "Lote 1";
                
                return (
                <div
                  key={lote.lote_id}
                  style={{
                    padding: "18px 22px",
                    borderBottom: "1px solid var(--border-color)",
                    cursor: isLote1 ? "not-allowed" : "pointer",
                    backgroundColor: isLote1 ? "var(--bg-secondary)" : "var(--card-bg)",
                    opacity: isLote1 ? 0.6 : 1,
                    transition: "all 0.2s ease",
                  }}
                  onClick={() => {
                    if (!isLote1) {
                      setOpenLote(openLote === lote.lote_id ? null : lote.lote_id)
                    }
                  }}
                  onMouseEnter={(e) => {
                    if (!isLote1) {
                      e.currentTarget.style.backgroundColor = "var(--bg-secondary)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isLote1) {
                      e.currentTarget.style.backgroundColor = "var(--card-bg)";
                    }
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <span style={{ 
                        fontSize: "16px", 
                        fontWeight: "500", 
                        color: "var(--text-primary)",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px"
                      }}>
                        <img 
                          src={PIN_ICON_URL} 
                          alt="Pin"
                          style={{
                            width: "16px",
                            height: "16px",
                            objectFit: "contain",
                          }}
                        />
                        {lote.nombre}
                      </span>
                      {isLote1 && (
                        <span style={{ 
                          fontSize: "12px", 
                          color: "var(--text-muted)", 
                          fontStyle: "italic" 
                        }}>
                          🔒 Lote administrativo
                        </span>
                      )}
                    </div>
                    {!isLote1 && (
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
                    )}
                  </div>

                  {/* Árboles directamente en el lote */}
                  {openLote === lote.lote_id && !isLote1 && (
                    <div style={{ marginTop: "8px", marginLeft: "20px" }}>
                      {(() => {
                        // Recopilar todos los árboles de todos los cultivos del lote
                        const allArboles: any[] = []
                        lote.cultivo.forEach((cultivo: any) => {
                          if (cultivo.arbol && Array.isArray(cultivo.arbol)) {
                            allArboles.push(...cultivo.arbol)
                          }
                        })
                        
                        return sortAsc(allArboles).map((arbol) => (
                                <div
                                  key={arbol.arbol_id}
                                  style={{
                                    marginBottom: "10px",
                                    padding: "12px 14px",
                                    backgroundColor: "var(--card-bg)",
                                    borderRadius: "12px",
                                    cursor: "pointer",
                                    border: "1px solid var(--border-color)",
                                    transition: "all 0.2s ease",
                                    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setOpenArbol(
                                      openArbol === arbol.arbol_id
                                        ? null
                                        : arbol.arbol_id
                                    )
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = "var(--bg-secondary)";
                                    e.currentTarget.style.transform = "translateY(-1px)";
                                    e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.1)";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = "var(--card-bg)";
                                    e.currentTarget.style.transform = "translateY(0)";
                                    e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.05)";
                                  }}
                                >
                                  <div
                                    style={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      alignItems: "center",
                                    }}
                                  >
                                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                      <img 
                                        src={ARBOL_ICON_URL} 
                                        alt="Árbol de cacao"
                                        style={{
                                          width: "24px",
                                          height: "24px",
                                          objectFit: "contain",
                                        }}
                                      />
                                      <span style={{ 
                                        fontSize: "14px", 
                                        fontWeight: "500",
                                        color: "var(--text-primary)" 
                                      }}>
                                        {arbol.nombre}
                                      </span>
                                    </div>
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
                                        [...arbol.frutos].sort((a: Fruto, b: Fruto) =>
                                          (a.especie ?? "").localeCompare(b.especie ?? "")
                                        ).map((fruto: Fruto) => (
                                          <div
                                            key={fruto.fruto_id}
                                            style={{
                                              fontSize: "13px",
                                              color: "var(--text-primary)",
                                              marginBottom: "8px",
                                              cursor: "pointer",
                                              padding: "10px 14px",
                                              borderRadius: "12px",
                                              backgroundColor: "var(--bg-secondary)",
                                              border: "2px solid var(--border-color)",
                                              display: "flex",
                                              alignItems: "center",
                                              gap: "12px",
                                              transition: "all 0.3s ease",
                                              boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                                            }}
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              // Navegar al mapa cuando se hace clic en un fruto y hacer zoom al árbol
                                              if (onNavigateToMap) {
                                                onNavigateToMap(arbol.arbol_id)
                                              }
                                            }}
                                            onMouseEnter={(e) => {
                                              e.currentTarget.style.backgroundColor = "#3b82f6";
                                              e.currentTarget.style.transform = "translateX(4px) scale(1.02)";
                                              e.currentTarget.style.boxShadow = "0 6px 16px rgba(59, 130, 246, 0.25)";
                                              e.currentTarget.style.borderColor = "#2563eb";
                                              e.currentTarget.style.color = "white";
                                              
                                              // Hover effect en la imagen
                                              const img = e.currentTarget.querySelector('img');
                                              if (img) {
                                                img.style.transform = "scale(1.15) rotate(-5deg)";
                                                img.style.filter = "drop-shadow(0 4px 12px rgba(0,0,0,0.3)) brightness(1.1)";
                                              }
                                            }}
                                            onMouseLeave={(e) => {
                                              e.currentTarget.style.backgroundColor = "var(--bg-secondary)";
                                              e.currentTarget.style.transform = "translateX(0) scale(1)";
                                              e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.08)";
                                              e.currentTarget.style.borderColor = "var(--border-color)";
                                              e.currentTarget.style.color = "var(--text-primary)";
                                              
                                              // Reset hover effect en la imagen
                                              const img = e.currentTarget.querySelector('img');
                                              if (img) {
                                                img.style.transform = "scale(1) rotate(0deg)";
                                                img.style.filter = "drop-shadow(0 2px 4px rgba(0,0,0,0.1))";
                                              }
                                            }}
                                          >
                                            <img
                                              src={estadoToIconUrl[fruto.estado_fruto?.toLowerCase() || "inmaduro"]}
                                              alt={fruto.estado_fruto || "Inmaduro"}
                                              style={{
                                                width: "28px",
                                                height: "28px",
                                                borderRadius: "8px",
                                                transition: "all 0.3s ease",
                                                filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
                                              }}
                                            />
                                            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "2px" }}>
                                              <span style={{ fontWeight: "600", fontSize: "14px" }}>
                                                {fruto.especie || "CH13"}
                                              </span>
                                              {fruto.estado_fruto && (
                                                <span style={{ 
                                                  fontSize: "11px", 
                                                  color: "inherit",
                                                  opacity: 0.8,
                                                  fontWeight: "500"
                                                }}>
                                                  Estado: {fruto.estado_fruto}
                                                </span>
                                              )}
                                            </div>
                                            <span style={{
                                              fontSize: "18px",
                                              opacity: 0.6,
                                              transition: "all 0.2s ease"
                                            }}>
                                              →
                                            </span>

                                                    </div>
                                                  ))
                                                ) : (
                                        <div style={{ 
                                          fontSize: "13px", 
                                          color: "var(--text-muted)",
                                          padding: "12px 16px",
                                          backgroundColor: "var(--bg-secondary)",
                                          borderRadius: "10px",
                                          textAlign: "center",
                                          border: "1px dashed var(--border-color)",
                                          fontStyle: "italic"
                                        }}>
                                          🍫 Sin frutos de cacao disponibles
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                        ))
                      })()}
                    </div>
                  )}
                </div>
              )})}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default ZonesScreen
