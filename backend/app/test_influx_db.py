from db import influx_client, INFLUX_BUCKET, INFLUX_ORG
from influxdb_client.client.write_api import SYNCHRONOUS  # <-- Importar SYNCHRONOUS

# -----------------------------
# ESCRIBIR DATOS
# -----------------------------
with influx_client.write_api(write_options=SYNCHRONOUS) as write_api:
    write_api.write(
        bucket=INFLUX_BUCKET,
        org=INFLUX_ORG,
        record={"measurement": "cpu", "fields": {"usage": 55.2}}
    )

print("✅ Dato escrito en InfluxDB")

# -----------------------------
# LEER DATOS
# -----------------------------
query_api = influx_client.query_api()
query = f'from(bucket: "{INFLUX_BUCKET}") |> range(start: -1h)'

tables = query_api.query(query)

for table in tables:
    for record in table.records:
        print(f"🔹 {record.get_time()} | {record.get_field()} = {record.get_value()}")

# -----------------------------
# CERRAR CLIENTE
# -----------------------------
influx_client.close()
