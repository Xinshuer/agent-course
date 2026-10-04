"""第 02 节选做练习参考答案：基于模型的恒温水壶规则
Lesson 02 optional exercise, solution: a model-based kettle rule

运行环境 / Environment: .venv（任何 Python 3 都行 / any Python 3 works）
运行 / Run:
    cd practice
    & ..\\.venv\\Scripts\\python.exe l02_kettle_solution.py

注意缩进 / Mind the indentation:
    if __name__ == "__main__": 下面的代码缩进 4 格；两个 if 下面的 print 再缩进 4 格（共 8 格）；
    最后的「检查完毕」只缩进 4 格，所以不管预测结果如何都会执行。
    Code under if __name__ == "__main__": is indented 4 spaces; the prints under the two ifs go
    4 further (8 in total); the final "Check finished" is indented only 4, so it always runs.
"""

if __name__ == "__main__":
    last_temp = 30      # 上一次测到的水温（内部状态）/ the previous reading (internal state)
    temp = 40           # 这一次测到的水温（改成 33 再试试）/ this reading (try 33 too)

    # 1. 预测：照刚才的升温速度往后推一次 / predict: push the current heating rate one step ahead
    predicted = temp + (temp - last_temp)
    print("预测下一次 / predicted next reading:", predicted)

    # 2. 低于 45：加热 / below 45: heat
    if predicted < 45:
        print("加热 / heat")

    # 3. 大于等于 45：停止 / 45 or more: stop
    if predicted >= 45:
        print("停止加热 / stop heating")

    # 4. 不归任何 if 管，总会执行 / under no if, so it always runs
    print("检查完毕 / Check finished")
