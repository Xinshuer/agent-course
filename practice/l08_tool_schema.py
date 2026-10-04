"""第 08 节小实验：@function_tool 到底生成了什么？（不调用模型，不需要 key）
Lesson 08 mini-experiment: what does @function_tool actually produce? (no model call, no key needed)

做了什么 / What it does:
    把一个普通函数交给 function_tool，打印生成的工具名、描述和参数 JSON Schema，
    方便和 05 节手写的 weather_tool.tools 对照。
    Passes a plain function to function_tool and prints the generated name, description and
    parameter JSON Schema, so you can compare it with the hand-written weather_tool.tools from lesson 05.

运行环境 / Environment: .venv
运行 / Run:
    cd practice
    & ..\\.venv\\Scripts\\python.exe l08_tool_schema.py
"""
import json

from agents import function_tool


def get_temperature(latitude: float, longitude: float) -> str:
    """查询某个经纬度当前的气温（摄氏度）。

    Args:
        latitude: 纬度，例如北京是 39.9
        longitude: 经度，例如北京是 116.4
    """
    return "20°C"


def no_hints(latitude, longitude):
    return "20°C"


if __name__ == "__main__":
    # 写 @function_tool 和下面这一行完全等价 / writing @function_tool is exactly this line
    tool = function_tool(get_temperature)

    print("类型 / type:       ", type(tool).__name__)
    print("工具名 / name:     ", tool.name)
    print("描述 / description:", tool.description)
    print("参数 / parameters:")
    print(json.dumps(tool.params_json_schema, ensure_ascii=False, indent=2))

    # 没有类型标注和 docstring 时，模型拿到的信息少得多
    # Without type hints and a docstring, the model gets far less information
    bare = function_tool(no_hints)
    print("\n没有类型标注的版本 / without type hints:")
    print("描述 / description:", repr(bare.description))
    print(json.dumps(bare.params_json_schema, ensure_ascii=False, indent=2))

    # 原来的函数还能直接调用，装饰后的 tool 不能
    # The original function is still callable; the decorated tool is not
    print("\nget_temperature(39.9, 116.4) ->", get_temperature(39.9, 116.4))
    try:
        tool(39.9, 116.4)
    except TypeError as e:
        print("tool(39.9, 116.4) ->", "TypeError:", e)
