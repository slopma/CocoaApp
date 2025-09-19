import React, { useEffect, useState } from "react"
import { supabase } from "../../utils/SupabaseClient";
import { contarEstados, contarEstructura } from "./helpers"
import type { Finca } from "../../types/domain"
import GraficoConTabla from "./GraficoConTabla"

interface StatsScreenProps {
  geodata: any
}

const StatsScreen: React.FC<StatsScreenProps> = ({ geodata }) => {
  void geodata
  const [fincas, setFincas] = useState<Finca[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedFinca, setSelectedFinca] = useState<string>("")
  const [selectedLote, setSelectedLote] = useState<string>("")

  useEffect(() => {
    const fetchFincas = async () => {
      setLoading(true)
      const { data, error } = await supabase.from("finca").select(`
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
              especie,
              fruto (
                fruto_id,
                especie,
                created_at,
                estado_cacao ( nombre )
              )
            )
          )
        )
      `)

      if (error) console.error("❌ Error cargando fincas:", error)
      else setFincas(data || [])
      setLoading(false)
    }

    fetchFincas()
  }, [])

  const filteredFincas = fincas
    .filter((f) => (selectedFinca ? f.finca_id === selectedFinca : true))
    .map((f) => ({
      ...f,
      lote: f.lote.filter((l) => (selectedLote ? l.lote_id === selectedLote : true)),
    }))

  const conteoGeneral = contarEstados(filteredFincas)
  const estructuraGeneral = contarEstructura(filteredFincas)

  return (
    <div
      style={{
        padding: "20px",
        paddingBottom: "90px",
        backgroundColor: "#f5f5f5",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header + Filtros */}
      <div style={{ flex: "0 0 auto" }}>
        <h2 style={{ marginBottom: "20px" }}>🌍 Mis Zonas</h2>
        <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
          <select
            value={selectedFinca}
            onChange={(e) => {
              setSelectedFinca(e.target.value)
              setSelectedLote("")
            }}
          >
            <option value="">Todas las fincas</option>
            {fincas.map((f) => (
              <option key={f.finca_id} value={f.finca_id}>
                {f.nombre}
              </option>
            ))}
          </select>

          <select
            value={selectedLote}
            onChange={(e) => setSelectedLote(e.target.value)}
            disabled={!selectedFinca}
          >
            <option value="">Todos los lotes</option>
            {fincas
              .find((f) => f.finca_id === selectedFinca)
              ?.lote.map((l) => (
                <option key={l.lote_id} value={l.lote_id}>
                  {l.nombre}
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* Contenido scrollable */}
      <div style={{ flex: "1 1 auto", overflowY: "auto", paddingRight: "10px" }}>
        {loading && <p>Cargando...</p>}

        {!loading && (
          <>
            {/* General */}
            <div style={{ background: "white", padding: "20px", borderRadius: "10px", marginBottom: "20px" }}>
              <h3>📊 Resumen General</h3>
              <GraficoConTabla conteo={conteoGeneral} />
              <p>
                Fincas: {estructuraGeneral.fincas} | Lotes: {estructuraGeneral.lotes} | Cultivos:{" "}
                {estructuraGeneral.cultivos} | Árboles: {estructuraGeneral.arboles} | Frutos: {estructuraGeneral.frutos}
              </p>
            </div>

            {/* Por finca */}
            {filteredFincas.map((finca) => {
              const conteoFinca = contarEstados([finca])
              const estructuraFinca = contarEstructura([finca])
              return (
                <div key={finca.finca_id} style={{ background: "white", padding: "20px", borderRadius: "10px", marginBottom: "20px" }}>
                  <h3>🏡 {finca.nombre}</h3>
                  <GraficoConTabla conteo={conteoFinca} />
                  <p>
                    Lotes: {estructuraFinca.lotes} | Cultivos: {estructuraFinca.cultivos} | Árboles:{" "}
                    {estructuraFinca.arboles} | Frutos: {estructuraFinca.frutos}
                  </p>
                </div>
              )
            })}
          </>
        )}
      </div>
    </div>
  )
}

export default StatsScreen
