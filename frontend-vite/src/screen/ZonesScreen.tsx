import React, { useEffect, useState } from "react"
import { estadoToIconUrl } from "../utils/mapIcons"

// Icono de árbol de cacao desde Supabase
const ARBOL_ICON_URL = "https://zlkdxzfxkhohlpswdmap.supabase.co/storage/v1/object/public/Cocoa-bucket/icons/cocoa-icons/arbol-de-cacao.png"

// ----------------- Tipos (iguales a los del mapa) -----------------
interface Fruto {
  fruto_id: string
  especie?: string
  estado_fruto?: string | { nombre?: string }
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

// Reemplaza toda la función organizeDataByHierarchy por la siguiente versión más robusta
const organizeDataByHierarchy = (arbolesData: any, cultivosData: any, lotesData: any) => {
  const arboles = arbolesData.arboles || []
  const cultivos = cultivosData.features || []
  const lotes = lotesData.features || []

  console.log("📊 Datos recibidos:", {
    arboles: arboles.length,
    cultivos: cultivos.length,
    lotes: lotes.length
  })

  // --- utilidades geo/simple ---
  const normalize = (s: any) => (s || "").toString().trim().toLowerCase()

  function getPolygonRings(feature: any) {
    if (!feature || !feature.geometry) return []
    const g = feature.geometry
    if (g.type === "Polygon") return g.coordinates
    if (g.type === "MultiPolygon") return g.coordinates.flat()
    return []
  }

  function pointInRing(point: [number, number], ring: number[][]) {
    // Ray-casting algorithm for a single ring
    const x = point[0], y = point[1]
    let inside = false
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const xi = ring[i][0], yi = ring[i][1]
      const xj = ring[j][0], yj = ring[j][1]
      const intersect = ((yi > y) !== (yj > y)) &&
        (x < (xj - xi) * (y - yi) / (yj - yi + 0.0) + xi)
      if (intersect) inside = !inside
    }
    return inside
  }

  function polygonContainsPoint(feature: any, point: [number, number]) {
    const rings = getPolygonRings(feature)
    for (const ring of rings) {
      if (pointInRing(point, ring)) return true
    }
    return false
  }

  function centroidOfFeature(feature: any): [number, number] | null {
    if (!feature || !feature.geometry) return null
    const g = feature.geometry
    if (g.type === "Point") return [g.coordinates[0], g.coordinates[1]]
    // polygon centroid approx: average of first ring vertices
    const rings = getPolygonRings(feature)
    if (rings.length === 0) return null
    const ring0 = rings[0]
    const xs = ring0.map((p: number[]) => p[0])
    const ys = ring0.map((p: number[]) => p[1])
    const cx = xs.reduce((a: number, b: number) => a + b, 0) / xs.length
    const cy = ys.reduce((a: number, b: number) => a + b, 0) / ys.length
    return [cx, cy]
  }

  // --- maps de lotes por id y por nombre (normalizado) ---
  const lotesById = new Map<string, any>()
  const lotesByName = new Map<string, any>() // nombre normalizado -> lote

  lotes.forEach((l: any) => {
    const props = l.properties || {}
    if (!props.lote_id) return
    lotesById.set(props.lote_id, {
      lote_id: props.lote_id,
      nombre: props.nombre,
      finca_id: props.finca_id || "finca-yariguies",
      estado: props.estado,
      __feature: l
    })
    lotesByName.set(normalize(props.nombre), {
      lote_id: props.lote_id,
      nombre: props.nombre,
      finca_id: props.finca_id || "finca-yariguies",
      estado: props.estado,
      __feature: l
    })
  })

  // --- cultivos: resolver lote_id (varios fallbacks) ---
  const cultivosMap = new Map<string, any>()
  cultivos.forEach((c: any) => {
    const p = c.properties || {}
    const cultivoId = p.cultivo_id || p.id || null
    const nombre = p.nombre || p.name || ""
    let loteId = p.lote_id || null

    // fallback 1: si nombre tiene "Lote X" o "Zona X" intentar emparejar por nombre
    if (!loteId) {
      const m = nombre.match(/(Lote|Zona)\s*\d+/i)
      if (m) {
        // buscamos lote con esa cadena en su nombre
        const search = normalize(m[0])
        // buscar exact match o includes
        // después
        for (const [, v] of lotesById) {
          if (normalize(v.nombre).includes(search) || search.includes(normalize(v.nombre))) {
            loteId = v.lote_id
            break
          }
        }

        if (!loteId) {
          // buscar por nombre completo
          const found = lotesByName.get(normalize(nombre.split(" - ")[0] || nombre))
          if (found) loteId = found.lote_id
        }
      }
    }

    // fallback 2: coincidencia por nombre exacto (normalized)
    if (!loteId) {
      const maybe = lotesByName.get(normalize(nombre))
      if (maybe) loteId = maybe.lote_id
    }

    // fallback 3: búsqueda espacial (centroid + point-in-polygon)
    if (!loteId) {
      const centro = centroidOfFeature(c)
      if (centro) {
        for (const [id, loteObj] of lotesById.entries()) {
          if (polygonContainsPoint(loteObj.__feature, centro)) {
            loteId = id
            break
          }
        }
      }
    }

    cultivosMap.set(cultivoId || `no-id-${Math.random()}`, {
      cultivo_id: cultivoId,
      nombre,
      especie: p.especie || p.species || null,
      lote_id: loteId,
      __feature: c
    })

    console.log(`➡️ Cultivo '${nombre}' -> lote_id=${loteId}`)
  })

  // --- agrupar árboles por cultivo_id (ya vienen del backend) ---
  const arbolesPorCultivo = new Map<string, any[]>()
  arboles.forEach((arbol: any) => {
    const cultivoId = arbol.cultivo_id
    if (!arbolesPorCultivo.has(cultivoId)) arbolesPorCultivo.set(cultivoId, [])
    arbolesPorCultivo.get(cultivoId)!.push({
      ...arbol,
      frutos: arbol.frutos || []
    })
  })

  // --- agrupar cultivos por lote_id ---
  const cultivosPorLote = new Map<string, any[]>()
  for (const [, cultivo] of cultivosMap.entries()) {
    const lid = cultivo.lote_id
    if (!cultivosPorLote.has(lid)) cultivosPorLote.set(lid, [])
    cultivosPorLote.get(lid)!.push({
      cultivo_id: cultivo.cultivo_id,
      nombre: cultivo.nombre,
      especie: cultivo.especie,
      arbol: arbolesPorCultivo.get(cultivo.cultivo_id) || []
    })
  }

  // --- construir fincas usando lotesById (usa finca_id desde lote) ---
  const fincasMap = new Map<string, any>()
  for (const [, loteObj] of lotesById.entries()) {
    const fincaId = loteObj.finca_id || "finca-yariguies"
    if (!fincasMap.has(fincaId)) {
      fincasMap.set(fincaId, {
        finca_id: fincaId,
        nombre: "Finca Yariguíes",
        created_at: new Date().toISOString(),
        lote: []
      })
    }
    fincasMap.get(fincaId).lote.push({
      lote_id: loteObj.lote_id,
      nombre: loteObj.nombre,
      finca_id: fincaId,
      estado: loteObj.estado,
      cultivo: cultivosPorLote.get(loteObj.lote_id) || []
    })
  }

  const result = Array.from(fincasMap.values())
  console.log("🏗️ Estructura organizada:", result)
  return result
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
        // Obtener árboles con frutos (mismos datos que el mapa)
        const arbolesRes = await fetch(`${import.meta.env.VITE_API_URL}/arboles/`)
        if (!arbolesRes.ok) throw new Error(`HTTP ${arbolesRes.status}`)
        const arbolesData = await arbolesRes.json()
        
        // Obtener cultivos para organizar por lotes
        const cultivosRes = await fetch(`${import.meta.env.VITE_API_URL}/cultivos/`)
      
        if (!cultivosRes.ok) throw new Error(`HTTP ${cultivosRes.status}`)
        const cultivosData = await cultivosRes.json()
        
        // Obtener lotes
        const lotesRes = await fetch(`${import.meta.env.VITE_API_URL}/lotes/`)
        
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
                      <span style={{ fontSize: "16px", fontWeight: "500", color: "var(--text-primary)" }}>
                        📍 {lote.nombre}
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
                                        ).map((fruto: Fruto) => {
                                          const estadoNombre = (fruto.estado_fruto as any)?.nombre ?? fruto.estado_fruto ?? "inmaduro";
                                          const altText = (fruto.estado_fruto as any)?.nombre ?? fruto.estado_fruto ?? "Inmaduro";
                                          
                                          return (
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
                                              src={estadoToIconUrl[estadoNombre.toLowerCase()] || estadoToIconUrl.inmaduro}
                                              alt={altText}
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
                                                  Estado: {altText}
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
                                          )})
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
