import React, { useEffect, useState } from "react"
import { supabase } from "../utils/SupabaseClient"

// ----------------- Tipos -----------------
interface Fruto {
  fruto_id: string
  especie: string | null
}

interface Arbol {
  arbol_id: string
  nombre: string
  fruto: Fruto[]
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
    const fetchFincas = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from("finca")
        .select(`
          finca_id,
          nombre,
          created_at,
          lote (
            lote_id,
            nombre,
            cultivo (
              cultivo_id,
              nombre,
              arbol (
                arbol_id,
                nombre,
                fruto (
                  fruto_id,
                  especie
                )
              )
            )
          )
        `)

      if (error) {
        console.error("❌ Error cargando fincas:", error)
      } else {
        setFincas(data || [])
      }
      setLoading(false)
    }

    fetchFincas()
  }, [])

  const fetchMetrics = async (arbolId: string) => {
    if (metrics[arbolId]) return // ya cargadas

    const { data, error } = await supabase
      .from("metrics")
      .select("metric_id, raw, voltaje, capacitancia, created_at")
      .eq("arbol_id", arbolId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("❌ Error cargando métricas:", error)
    } else {
      setMetrics((prev) => ({ ...prev, [arbolId]: data || [] }))
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
        backgroundColor: "#f5f5f5",
      }}
    >
      <h2
        style={{
          margin: "0 0 20px 0",
          color: "#333",
          fontSize: "24px",
          fontWeight: "bold",
        }}
      >
        🌍 Mis Zonas
      </h2>

      {loading && <p style={{ color: "#666" }}>Cargando fincas...</p>}
      {!loading && fincas.length === 0 && (
        <p style={{ color: "#666" }}>No tienes fincas registradas</p>
      )}

      {sortAsc(fincas).map((finca) => (
        <div
          key={finca.finca_id}
          style={{
            backgroundColor: "white",
            borderRadius: "12px",
            marginBottom: "20px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            overflow: "hidden",
          }}
        >
          {/* Header de la finca */}
          <div
            style={{
              padding: "20px",
              borderBottom: "1px solid #f0f0f0",
              backgroundColor: "#fafafa",
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
                  color: "#333",
                  fontSize: "18px",
                  fontWeight: "600",
                }}
              >
                🏡 {finca.nombre}
              </h3>
              <p style={{ margin: 0, fontSize: "14px", color: "#666" }}>
                Creada: {new Date(finca.created_at).toLocaleDateString()}
              </p>
            </div>
            <span
              style={{
                fontSize: "18px",
                color: "#999",
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
                    borderBottom: "1px solid #f0f0f0",
                    cursor: "pointer",
                    backgroundColor: "#fff",
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
                    <span style={{ fontSize: "16px", fontWeight: "500" }}>
                      📍 {lote.nombre}
                    </span>
                    <span
                      style={{
                        fontSize: "16px",
                        color: "#999",
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
                            backgroundColor: "#fafafa",
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
                            <span style={{ fontSize: "14px", fontWeight: "500" }}>
                              🌱 {cultivo.nombre}
                            </span>
                            <span
                              style={{
                                fontSize: "14px",
                                color: "#999",
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
                                    backgroundColor: "#fff",
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
                                    <span style={{ fontSize: "13px", color: "#555" }}>
                                      🌳 {arbol.nombre}
                                    </span>
                                    <span
                                      style={{
                                        fontSize: "13px",
                                        color: "#999",
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
                                      {arbol.fruto.length > 0 ? (
                                        sortAsc(arbol.fruto).map((fruto) => (
                                          <div
                                            key={fruto.fruto_id}
                                            style={{
                                              fontSize: "12px",
                                              color: "#444",
                                              marginBottom: "6px",
                                              cursor: "pointer",
                                              padding: "4px 8px",
                                              borderRadius: "6px",
                                              backgroundColor: "#fdfdfd",
                                              boxShadow:
                                                "0 1px 3px rgba(0,0,0,0.05)",
                                            }}
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              fetchMetrics(arbol.arbol_id)
                                            }}
                                          >
                                            🍫 {fruto.especie || "Fruto sin especie"}

                                            {/* Mostrar métricas si ya se cargaron */}
                                            {metrics[arbol.arbol_id] && (
                                              <div
                                                style={{
                                                  marginTop: "4px",
                                                  marginLeft: "16px",
                                                  fontSize: "11px",
                                                  color: "#666",
                                                }}
                                              >
                                                {metrics[arbol.arbol_id].length >
                                                0 ? (
                                                  metrics[arbol.arbol_id].map((m) => (
                                                    <div
                                                      key={m.metric_id}
                                                      style={{ marginBottom: "2px" }}
                                                    >
                                                      ⚡ Raw: {m.raw ?? "-"} | Voltaje:{" "}
                                                      {m.voltaje ?? "-"} | Cap:{" "}
                                                      {m.capacitancia ?? "-"}
                                                      <br />
                                                      📅{" "}
                                                      {new Date(
                                                        m.created_at
                                                      ).toLocaleString()}
                                                    </div>
                                                  ))
                                                ) : (
                                                  <p>No hay métricas</p>
                                                )}
                                              </div>
                                            )}
                                          </div>
                                        ))
                                      ) : (
                                        <p style={{ fontSize: "12px", color: "#888" }}>
                                          Sin frutos
                                        </p>
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
    </div>
  )
}

export default ZonesScreen
