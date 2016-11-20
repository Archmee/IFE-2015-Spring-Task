<!-- 这个文件用来记录我review的所有参加并提交了任务的同学的代码 -->

# github用户
## util.js
1. [davidxi](https://github.com/davidxi/ife/tree/homework-2/task/task0002/work/davidxi)
    + 108行：没有搞懂unique函数的意图？？？
    + 149行：绑定函数时，在匿名函数中保存了一个函数什么意图？？？
    + 165行：并不是最好的一个escapeRegExp版本，链接页面中提供了一个重复问题的链接，那个才是比较理想的答案
    + 171行：代码应该没问题，但是搞得太复杂（这条仅仅是个人代码品味）
    + 188行：hasClass函数用正则来匹配是不是要更好一点
    + 232行：isSiblingNode判断兄弟节点遍历了当前节点的前面的和后面的所有节点，这样效率有点低，而且繁琐，直接判断是否是同一个父亲节点不就ok了吗
    + 267行：定位当前节点在浏览器窗口的位置需要减去滚动的距离吗？
    + 293行：query方法写得太繁琐，实在看不下去了，浏览了一下，没有完全搞清楚他的编程思路，紧接着的416的$方法调用query的思路也没搞懂
    + 432行：事件的这一块代码可能是更复杂的写法，但是感觉太繁琐，效率也有所影响，增加了代码复杂度，也增加了review代码的复杂度，个人不是很喜欢
    + 491行: IE绑定事件应该是attachEvent才对吧，写完没测试？
    + 536行：这样直接枚举参数列表？
    + 549行：addEnterEvent函数是希望绑定按回车键的事件，而不是mouseenter事件，没有理解题意？而且绑定事件为什么又直接调用了addEnterEvent，不是调用addEvent吗，这样会导致无穷递归调用addEnterEvent函数
    + 569行：on直接调用addEvent函数不是就行了吗，搞这么多干嘛
    + 整体：javascript基础部分很不错，其余部分个别函数的编程思想不错
    
 2. [lin-qf](https://github.com/lin-qf/lin-qf/tree/lin-qf/task0002)
    + 看前面感觉写得比我还糟糕
 3. 后面看了几个初级班和中级班的，大多数实现都差不多，所以没有详细记录了


自己还存在的问题：
- 遍历对象的时候要使用hasDontEnumerBug和propertyIsEnumerable（已解决：用了MDN提供的object.keys的pollyfill）
- 获取元素在窗口中的位置还有另外一种getBoundingClientRect的方法（已解决，直接调用就是）
- setCookie调用误差几个小时的bug，好像UTC的问题，相差几个小时(已解决，不用toUTCString()而用toString)
- $的改进，比如按照属性值匹配那个没有加tag（已解决），比如是否可以采用从右向左扫描(放弃)
- 封装性（按照功能封装成库）（废弃）


# API
Object.assign(target, ...sources)：可以把任意多个的source对象自身的可枚举属性拷贝给target对象（浅拷贝），然后返回target对象。
