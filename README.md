# IFE-2015-Spring-Task

这里是用来存放我的百度前端任务代码。

---

## 说明

[百度前端学院2015春](https://github.com/baidu-ife/ife/tree/master/2015_spring/task)

## task1

深入学习了HTML、CSS，理解 CSS 布局和 BFC 技术。

最终实现了一个多页静态博客。

- [任务要求](https://github.com/baidu-ife/ife/tree/master/2015_spring/task/task0001)
- [在线 demo](https://archmee.github.io/demo/show/ife_task_1_7/)
- [开发日志](https://archmee.github.io/201608/2016-08-13.html)

## task2

学习 JavaScript。

自己封装了一个 util.js 工具库，包含深度克隆、数组去重、添加删除 CSS 样式、类似jQ的mini$、封装 Ajax 等功能。

后面的练习中实现了兴趣列表、倒计时、图片轮播、输入框即时提示、拖拽交互等任务。

- [任务要求](https://github.com/baidu-ife/ife/tree/master/2015_spring/task/task0002)
- [在线 Demo]
    + [兴趣列表](https://archmee.github.io/demo/show/ife_task_2/task0002_1.html)
    + [倒计时](https://archmee.github.io/demo/show/ife_task_2/task0002_2.html)
    + [面向对象的轮播](https://archmee.github.io/demo/show/ife_task_2/task0002_3.html)
    + [模拟搜索框](https://archmee.github.io/demo/show/ife_task_2/task0002_4.html)
    + [拖拽交互](https://archmee.github.io/demo/show/ife_task_2/task0002_5.html)
- [开发日志](https://archmee.github.io/201612/2016-12-11.html)

## task3

任务三实现了一个 ToDo 的单页应用。

使用 localStorage 存储数据，JSON 模拟数据表，实现了分类和待办状态的改变，具有良好的交互体验。

- [任务要求](https://github.com/baidu-ife/ife/tree/master/2015_spring/task/task0003)
- [在线 Demo](https://archmee.github.io/demo/show/ife_task_3/)
- [笔记](https://archmee.github.io/201703/2017-02-06-2.html)

## task4

任务四是将任务三的 ToDo 应用优化，以适应移动端设备。

- [任务要求](https://github.com/baidu-ife/ife/tree/master/2015_spring/task/task0004)
- [在线 Demo](https://archmee.github.io/demo/show/ife_task_4/)
- [笔记](https://archmee.github.io/201703/2017-03-13.html)
- [开发日志](https://archmee.github.io/201704/2017-04-08.html)


## task5
本来没有task5，只是我将task4中需要做工程化重构的部分单独拿出来了

- 使用Less重构CSS代码：变量、继承、mixin等特性可以简化CSS
- 处理XSS防护：转义html字符
- 性能优化：使用artTemplate，分离js中的模板字符串。压缩js、css、图片等
- 工程化：使用gulp及其插件简化工作流
- 模块化：使用requirejs模块化js代码

- 笔记：
    + [安全](https://archmee.github.io/201704/2017-04-20-1.html)
    + [性能](https://archmee.github.io/201704/2017-04-20-2.html)
    + [模块化](https://archmee.github.io/201704/2017-04-20-3.html)
    + [工程化](https://archmee.github.io/201704/2017-04-15.html)
    + [jshint](https://archmee.github.io/201704/2017-04-10.html)

- [在线 demo](https://archmee.github.io/demo/show/ife_task_5)

## task6

这个任务管理工具Vue-Todo和 task5 的功能和界面都是完全一样的，只是这里使用了Vue2来实现，当时还没有学习Vue全家桶就开始开发，所以除了Vue外，还是使用Gulp和RequireJs。

效果展示 [点这里](https://archmee.github.io/demo/show/ife_task_5)，由于该项目是gulp打包发布，还需要安装一些插件，个人觉得麻烦就省略了，反正效果和IFE任务5一样，当然，在本地是完全可以运行的。

想要在本地运行项目的话
1. npm install
2. gulp 或者gulp default就启动项目了，每次修改文件后都会将处理后的文件输出到目标位置
3. gulp clear-all 可以清理目标重新生成
4. ctrl + c 结束运行