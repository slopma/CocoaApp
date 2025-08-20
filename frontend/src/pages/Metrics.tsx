import React, { useEffect, useState } from "react";
import axios from "axios";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";

function Metrics() {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:8000/metrics")
      .then(res => setData(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Metrics</h1>
      <LineChart width={600} height={300} data={data}>
        <Line type="monotone" dataKey="value" stroke="#3b82f6" />
        <CartesianGrid stroke="#ccc" />
        <XAxis dataKey="time" />
        <YAxis />
        <Tooltip />
      </LineChart>
    </div>
  );
}

export default Metrics;
