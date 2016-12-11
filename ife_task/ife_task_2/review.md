
在完成任务ife2015任务二中遇到的问题和解决方案：
**ps**：很多和 [ife review](https://github.com/baidu-ife/ife/blob/master/2015_spring/task/task0002/review/IFE-review.md) 重复的地方不再列出

## util.js
- 低版本浏览器没有Array.indexOf方法，使用了[MDN的indexOf Polyfill](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf)
- 低版本浏览器没有Object.keys方法，也使用了[MDN的keys Polyfill](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys)
- 遍历对象的时候要使用hasDontEnumerBug和propertyIsEnumerable（已解决：用了MDN提供的object.keys的pollyfill）
  疑：不是用hasOwnProperty方法可以解决吗???
- 获取元素在窗口中的位置除了用offsetParent遍历的方法外还有getBoundingClientRect的方法（已解决，直接调用）
- setCookie调用差8个小时，好像UTC的问题(已解决，不用toUTCString()而用toString，在没找到好的解决方案前暂时这样)
- $方法的改进，比如按照属性值匹配那个没有加tag（已解决），比如是否可以采用更优的从右向左扫描(放弃)


## task0003
### 轮播图小点li在在父元素ul中水平居中方法
1. 父元素text-align:center,子元素要为inline或inline-block
2. 父元素不用设置，子元素要为block类型，子元素设置margin:0 auto; display:table;
3. 通过定位，父元素设置相对定位:
    - 子元素定宽，然后绝对定位，left和right都为0，margin:0 auto;
    - 子元素定宽，然后绝对定位，{left:50%; margin-left:-50%;} 问题是通常不确定子元素的宽度
    - 子元素绝对定位，{left:50%; transform:translateX(-50%);}（ie9不兼容）
    - 父和子之间需要一层包裹wrap，wrap要设置为绝对定位并left:50%; 然后子元素相对定位, 然后left:-50%（注意是负值）（未验证！！！）
4. 父元素用flex显示，个人还没学过，暂不详解，但兼容性不好
    - 父元素display:flex，然后justify-content: center;
    - 父元素display:flex，子元素margin:0 auto;
5. 使用以上方法需要定宽的，可以在js运行时获取子元素宽度，然后就好办了

### 轮播图上下一张按钮的垂直居中
绝对定位且是inline-block的a元素要实现在父元素中垂直居中，父元素中vertical-align不起作用，因为vertical-align是对inline元素，line-height设在a上是a的行高，结果是a中的元素垂直居中，而line-height设置在父元素上的话，a由于是绝对定位，所以会出现了a中的文字垂直居中了，而a还在绝对定位的初始位置，这并不是想要的效果。
针对绝对定位且定宽高的元素垂直居中，网上找到的解决方案是：
```css
a { top: 0;bottom: 0;
margin: auto 0;}
```

**小结：**
通过上两个居中案例得出，如果一个固定宽高绝对定位的block元素要在父元素中水平居中对齐或者垂直居中对齐，可用top和bottom为0(垂直)，left和bottom为0(水平)，或4个方向都为0(水平垂直居中)，并同时使用`margin:auto`可实现，当然，如果如果该元素不是绝对定位且定宽高的block元素的话，可使用其他方案（上述中block也包括inline-block）


### 背景透明，文字不透明的解决方案
[来自该文章链接#10楼评论](http://www.cnblogs.com/PeunZhang/p/4089894.html)
> 兼容IE，栗如：
非IE：`background:rgba(0,0,0,0.5);`
IE：`filter:progid:DXImageTransform.Microsoft.gradient(startColorstr=#7f000000,endColorstr=#7f000000);`
rgba和IE下filter数值的转换：
rgba透明值 => IE filter值
0.1 => 19
0.2 => 33
0.3 => 4C
0.4 => 66
0.5 => 7F
0.6 => 99
0.7 => B2
0.8 => C8
0.9 => E5
转换公式：alpha*255再转换成16进制即可

**注意1**：使用filter的时候background要使用IE不支持的方式，比如rgba，否则话会导致background生效而filter无效
**注意2**：最好和下面提到的兼容样式方法结合起来使用

### IE6/7的链接虚线外框
[css去掉a标签点击后的虚线框](http://www.cnblogs.com/something/archive/2013/05/21/3090428.html)
```css
a { blr:expression(this.onFocus=this.blur());}
```

当然css表达式不是一种好的方案，但如果和下面提到的兼容样式结合起来就会好很多，至少可以将通用css和兼容特定浏览器的css分开来

### 兼容样式
[CSS hack方案整理](http://www.cnblogs.com/PeunZhang/archive/2012/04/09/2437563.html)
```css
/* 支持IE6、7 */
@media screen\9 { /*兼容ie67的css*/ }
/* 支持IE8 */
@media \0screen\ {/*兼容ie8的css*/}
/* 支持IE6、7、8 */
@media  \0screen\,screen\9{/*兼容ie678的css*/}
```


## task0004
- 监听text/search等文本框的输入时除了要监听input事件还要在ie8及低版本浏览器中监听propertychange事件
- 唯独ie9在按删除键时不会触发input或propertychange事件，所以我们直接针对ie9检测keydown事件的keyCode是否是删除键做处理

## task0005
- 拖动时的文字选中问题，其他浏览器在拖动过程中阻止默认事件即可，而IE拖动时的文字选中，要用setCapture/releaseCapture
- ie7的offset值和其他浏览器不一样，所以用getBoundingClientRect函数获取