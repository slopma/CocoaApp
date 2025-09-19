import React from "react"
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { COLORS } from "./constants"

interface GraficoConTablaProps {
  conteo: Record<string, number>
}

const GraficoConTabla: React.FC<GraficoConTablaProps> = ({ conteo }) => {
  const data = Object.entries(conteo).map(([estado, valor]) => ({
    name: estado,
    value: valor,
  }))

  return (
    <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
      <div style={{ width: 250, height: 250 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" outerRadius={90} dataKey="value">
              {data.map((entry, index) => (
                <Cell key={index} fill={COLORS[entry.name] || "#ccc"} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <table style={{ borderCollapse: "collapse", fontSize: "14px" }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid #ccc", padding: "6px" }}>Estado</th>
            <th style={{ border: "1px solid #ccc", padding: "6px" }}>Cantidad</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.name}>
              <td style={{ border: "1px solid #ccc", padding: "6px" }}>{row.name}</td>
              <td style={{ border: "1px solid #ccc", padding: "6px" }}>{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default GraficoConTabla
