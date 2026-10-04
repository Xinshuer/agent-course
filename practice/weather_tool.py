"""查天气的工具：函数本身 + 交给模型看的工具说明（tools）。

A weather tool: the function itself plus the tool description the model reads.
Open-Meteo needs no API key.
"""
import httpx


def get_weather(latitude, longitude):
    # Open-Meteo 偶尔会断开连接，所以最多试 3 次 / Open-Meteo sometimes drops the connection, so try up to 3 times
    for attempt in range(3):
        try:
            response = httpx.get(
                "https://api.open-meteo.com/v1/forecast",
                params={"latitude": latitude, "longitude": longitude, "current": "temperature_2m"},
                timeout=10,
            )
            data = response.json()
            return data["current"]["temperature_2m"]
        except (httpx.HTTPError, KeyError, ValueError) as error:
            last_error = error
    return f"天气服务暂时不可用 / weather service unavailable: {last_error}"


tools = [{
    "type": "function",
    "function": {
        "name": "get_weather",
        "description": "Get the current temperature (Celsius) for a given latitude and longitude.",
        "parameters": {
            "type": "object",
            "properties": {
                "latitude": {"type": "number", "description": "The latitude of the location."},
                "longitude": {"type": "number", "description": "The longitude of the location."},
            },
            "required": ["latitude", "longitude"],
            "additionalProperties": False,
        },
    },
}]


if __name__ == "__main__":
    print(get_weather(39.9042, 116.4074))
