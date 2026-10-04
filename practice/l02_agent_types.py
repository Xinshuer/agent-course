"""第 02 节演示：五类 Agent 里的前四类，用纯 Python 模拟（不调用模型，不需要 key）
Lesson 02 demo: the first four of the five agent types, simulated in plain Python (no model, no key)

① 恒温水壶（目标 45 度）：同一串水温，交给「简单反射型」和「基于模型的反射型」，看它们在哪几次决定不同。
   A thermostatic kettle (set to 45 °C): the same readings go to a simple reflex agent and a
   model-based reflex agent - see where their decisions differ.
② 去机场的三条路线：「基于目标型」拿到第一条能到的就走；「基于效用型」给每条算代价，选最好的。
   Three routes to the airport: the goal-based agent takes the first one that gets there;
   the utility-based agent scores each one and picks the best.

运行环境 / Environment: .venv（任何 Python 3 都行 / any Python 3 works）
运行 / Run:
    cd practice
    & ..\\.venv\\Scripts\\python.exe l02_agent_types.py

试一试 / Try it:
    - 把 READINGS 改成升温更慢的一串（比如 [20, 25, 30, 35, 40, 43, 45]），两种水壶还会不一样吗？
      Make READINGS rise more slowly (e.g. [20, 25, 30, 35, 40, 43, 45]) - do the kettles still differ?
    - 把 cost() 里的过路费乘以 3（觉得钱更重要），基于效用型会改选哪条路？
      Multiply the toll by 3 in cost() (money matters more) - which route does the utility agent pick now?
代码里的 def、for、if 在 05 节讲，缩进的读法见 02 节的 Python 小课堂。
def, for and if come in lesson 05; for reading indentation see the Python mini-lesson in 02.
"""

READINGS = [20, 30, 40, 44, 47, 46, 44]   # 每隔 10 秒测到的水温 / readings taken every 10 seconds
TARGET = 45                                # 恒温目标 / the target temperature

ROUTES = [
    {"name": "绕城高速 / ring motorway", "minutes": 50, "toll": 30},
    {"name": "市区主路 / city main road", "minutes": 45, "toll": 0},
    {"name": "机场快速路 / airport expressway", "minutes": 30, "toll": 10},
]


def simple_reflex(temp):
    """简单反射型：只看这一次的温度，按「条件 → 动作」规则反应。
    Simple reflex: looks only at this reading and applies a condition -> action rule."""
    if temp < TARGET:
        return "加热 / heat"
    return "停止 / stop"


def model_based(temp, last_temp):
    """基于模型的反射型：记得上一次的温度（内部状态），先预测，再按规则反应。
    Model-based reflex: remembers the last reading (internal state), predicts, then applies the rule."""
    predicted = temp + (temp - last_temp)      # 照刚才的升温速度往后推一次 / push the current rate one step ahead
    if predicted < TARGET:
        return "加热 / heat"
    return "停止 / stop (预测 predicts " + str(predicted) + ")"


def cost(route):
    """效用函数：代价越小越好。这里把 1 元过路费算成 1 分钟。
    Utility function: lower cost is better. Here 1 yuan of toll counts as 1 minute."""
    return route["minutes"] + route["toll"]


def goal_based(routes):
    """基于目标型：只要能到就行，拿第一条能到的路线。 Goal-based: any route that gets there - take the first."""
    return routes[0]


def utility_based(routes):
    """基于效用型：在能到的路线里选代价最小的。 Utility-based: of the routes that get there, pick the cheapest."""
    best = routes[0]
    for route in routes:
        if cost(route) < cost(best):
            best = route
    return best


if __name__ == "__main__":
    print("① 恒温水壶 / thermostatic kettle, target", TARGET)
    last_temp = READINGS[0]                    # 内部状态 / internal state
    for temp in READINGS:
        print(f"  {temp:>3} | 简单反射 simple: {simple_reflex(temp):<12} | 基于模型 model-based: {model_based(temp, last_temp)}")
        last_temp = temp                       # 更新内部状态 / update the state

    print()
    print("② 去机场 / to the airport")
    for route in ROUTES:
        print("  ", route["name"], "代价 cost =", cost(route))
    print("  基于目标型 goal-based    →", goal_based(ROUTES)["name"])
    print("  基于效用型 utility-based →", utility_based(ROUTES)["name"])
