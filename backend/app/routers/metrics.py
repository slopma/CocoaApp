from fastapi import APIRouter
from ..db import influx_client, INFLUX_BUCKET

router = APIRouter()

@router.get("/")
def get_metrics():
    query = f'from(bucket: "{INFLUX_BUCKET}") |> range(start: -1h)'
    tables = influx_client.query_api().query(query)
    results = []
    for table in tables:
        for record in table.records:
            results.append({
                "time": record.get_time().isoformat(),
                "value": record.get_value()
            })
    return results
