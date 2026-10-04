"""浏览器版 weather_tool.py：get_weather 返回一个假的气温（浏览器里不能直接访问天气网站）。

Browser version of weather_tool.py: get_weather returns a fake temperature.
"""


def get_weather(latitude, longitude):
    return round(12 + (abs(latitude) * 7 + abs(longitude) * 3) % 15, 1)


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
