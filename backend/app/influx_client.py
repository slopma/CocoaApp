from influx_client import InfluxDBClient
import os

influx_client = InfluxDBClient(
    url=os.getenv("INFLUXDB_URL"),
    token=os.getenv("INFLUXDB_TOKEN"),
    org=os.getenv("INFLUXDB_ORG")
)

write_api = influx_client.write_api()
query_api = influx_client.query_api()
