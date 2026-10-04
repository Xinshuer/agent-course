"""第 02 节选做练习：基于模型的恒温水壶规则（TODO 版）——练习缩进
Lesson 02 optional exercise: a model-based kettle rule (TODO version) - practise indentation

水壶上一次测到 last_temp 度，这一次测到 temp 度。按 TODO 写出基于模型的反射规则。
The kettle's previous reading was last_temp and this one is temp. Follow the TODOs to write
the model-based reflex rule.

运行环境 / Environment: .venv（任何 Python 3 都行 / any Python 3 works）
运行 / Run:
    cd practice
    & ..\\.venv\\Scripts\\python.exe l02_kettle_todo.py
参考答案 / Solution: l02_kettle_solution.py

关于缩进 / About indentation:
    最下面那行 if __name__ == "__main__": 先照抄（05 节再讲），意思是「直接运行这个文件时，执行下面的代码」。
    它也以冒号结尾，所以下面的代码都缩进了 4 格、归它管；你写的 if 再往里缩进 4 格，就是 8 格。
    Copy the line if __name__ == "__main__": as it is for now (lesson 05 explains it): "when this file is
    run directly, run the code below". It ends with a colon too, so everything under it is indented
    4 spaces; the body of your own if goes 4 spaces further, i.e. 8 spaces.
"""

if __name__ == "__main__":
    last_temp = 30      # 上一次测到的水温（内部状态）/ the previous reading (internal state)
    temp = 40           # 这一次测到的水温 / this reading

    # TODO 1 算出预测温度：把右边的 0 换成 temp + (temp - last_temp)
    #        Work out the prediction: replace the 0 on the right with temp + (temp - last_temp)
    predicted = 0
    print("预测下一次 / predicted next reading:", predicted)

    # TODO 2 predicted 低于 45 时打印「加热」（if 下面再缩进 4 格）
    #        When predicted is below 45, print "heat" (indent 4 more spaces under the if)


    # TODO 3 predicted 大于等于 45（>=）时打印「停止加热」
    #        When predicted is 45 or more (>=), print "stop heating"


    # TODO 4 和 TODO 1 对齐（不归任何 if 管），打印「检查完毕」
    #        Lined up with TODO 1 (not under any if), print "Check finished"

    # 写完后把 temp 改成 33 再运行：这次应该打印「加热」。
    # When done, change temp to 33 and run again: this time it should print "heat".
