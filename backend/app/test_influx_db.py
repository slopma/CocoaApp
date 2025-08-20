from db import influx_client, INFLUX_BUCKET, INFLUX_ORG

# Escribir un punto
write_api = influx_client.write_api()
write_api.write(
    bucket=INFLUX_BUCKET,
    org=INFLUX_ORG,
    record={"measurement": "cpu", "fields": {"usage": 55.2}}
)

print("✅ Dato escrito en InfluxDB")

# Leer datos
query = f'from(bucket: "{INFLUX_BUCKET}") |> range(start: -1h)'
tables = influx_client.query_api().query(query)

for table in tables:
    for record in table.records:
        print(f"🔹 {record.get_time()} | {record.get_field()} = {record.get_value()}")
