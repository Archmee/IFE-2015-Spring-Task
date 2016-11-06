这些已解决问题或记录，只是自己在遇到时随手记下来的，并且贴出了解决办法，并没有把每个问题的表现形式截图下来，问题和解决方式的描述也还有待调整，我争取看看有时间的时候完善补充一下。

1. 当a嵌入一个img时，a元素的高度和img不一样？（ 转自：http://www.zhangxinxu.com/wordpress/2015/08/css-deep-understand-vertical-align-and-line-height）

    这是 line-height 和 vertical-align 造成的，被称为幽灵空白节点，解决方案有以下几种：
    - 让 vertical-align 失效：`img { display: block; }`
    - vertical-align 默认为 baseline，更改为其他即可：`img { vertical-align:middle; }`
    - 直接修改 line-height 值：`a { line-height: 5px; }`
    - 修改 font-size：`a { font-size: 0; }`

2. 做banner的背景时找到一个新的css 3属性
    `background-size: 100% 100%;`，这样就可以控制背景图片的大小适应整个盒子

3. 关于背景透明，文字不透明，解决方案 
    - 两个DIV放在一个位置，文字DIV放上面，需要透明的DIV放下面
    - 使用css属性opacity（文字背景都透明）或者rgba（背景透明文字不透明），参考：http://www.cnblogs.com/PeunZhang/p/4089894.html

4. font-family应该优先指定英文字体，然后再指定中文字体。同时声明中文字体的字体名称（英文）和显示名称（中文）

5. 关于li元素之间的间隔，是inline-block导致的，之前遇到过这个问题，也在博客中提过，是用`display:table-cell;`解决的，但是我发现它和最上面的问题一有点类似，采用`vertical-align:middle;`也解决了问题，仔细检查发现虽然间隔小了很多但还是有一点间隔。所以还是采用`font-size:0;`的方式解决了，其实浮动应该可以。
    在写表单的时候，若多个表单元素放在一行的话，也会出现间隔，用 letter-spacing 可以解决

6. 了解word-wrap和word-break
一下内容来自这篇博客：www.cnblogs.com/2050/archive/2012/08/10/2632256.html。

    `word-wrap:break-word;` 对长串英文不起作用，其实这是非常错误的，`word-wrap:break-word;`照样能把一个长串英文或数字拆成多行。事实上，`word-wrap:break-word;`与`word-break:break-all;`共同点是都能把长单词强行断句，不同点是`word-wrap:break-word;`会首先起一个新行来放置长单词，新的行还是放不下这个长单词则会对长单词进行强制断句；而`word-break:break-all;`则不会把长单词放在一个新行里，当这一行放不下的时候就直接强制断句了

7. 页面底部采用text-align来居中，版权信息可以正常显示，但是github logo总是不居中，检查它的左边刚好在居中位置，所以采用了`margin-left: -50%;` 将图片向左边缩进了自身宽度的边距

8. 屏幕宽度小于980px就隐藏头部github图标
    ```css
    @media screen and (max-width: 980px) {
        #github-icon {
            display: none;
        }
    }
    ```

9. 之前主页的封面图是用背景来实现的，但是实际图片宽高大于盒子宽高，所以图片显示不完整，在网上找到解决方法是可以用background-size来缩放背景大小，我分别指定宽高为100%，就能适应盒子 大小了。
本来以为没问题了，但是今天在缩放窗口的时候发现，图片宽度会随着浏览器窗口调整导致挤压变形严重，在MDN看到一篇介绍background-size的文章，提到还有**contain**和**cover**属性可用，contain是按照原图宽高比例进行缩放，只要宽度发生变化，图片高度也会动态调整，这不是我期望的效果，而cover属性就能够填充整个盒子的宽高，并不会随着浏览器缩放调整大小，所以完美解决了这个问题

10. 底部图标居中并底部对齐的问题，对copyright使用text-align:center可以居中，但是不能定位到底部，除非精确计算图标到版权文字的距离，但是不提倡这种硬编码方式。

    刚开始的时候我直接对a元素绝对定位，并且对齐了底部，当然还要对copyright这个div设置相对定位，结果发现它居中的位置是图标的左边位置，所以对img采用了margin-left:-50%使其居中，刚开始看没问题，但是发现和ie不兼容，因为text-align:center根本没有对a+img元素生效，所以图标在浏览器窗口最左边并且使用了img的负边距，所以图标只有右边一半可见。而且这种实现就是，a元素应该在的位置是可点击的，采用负边距后，导致a元素变成了原来宽度加上img的偏移位置，这样可点击的区域也变大了，所以这种方式不是很好。
    然后我给a元素外面嵌套了一层div.icon，对其使用绝对定位和50%的left，a元素就都到中间偏右一点的位置去了，当然还是以img撑开的a元素的左边进行定位的，所以要对之前在img上使用的负边距使用到a上，不过这次不使用margin了，而是对a进行相对定位以及-50%的left，perfect！！！

11. 让整个块区域都是可点击区域，只需要把a样式设置为内联块，并且指定宽高就行（padding也可以）

12. 禁用链接 可对相关a元素使用 pointer-events: none; 但是IE9不兼容，可以添加disabled属性，对IE9有效

13. outline 设置a元素或者input元素等在聚焦时候的默认边框

14. 注意在设置text input和submit input的大小时的区别，因为text input大小和其他盒子模型一样，真正宽高=设置的宽高+padding+margin+border，而submit input就不一样了，他的宽高=你设置的宽高+margin=可见区域+padding+border+margin。
用另一种方式来说就是，你设置的text input的宽高并不包括内边距和边框，而submit input的宽高则包括内边距和边框，注意我们讨论的区别都不包括margin，因为margin在其两者上表现上是相同的。
type="button"和type="submit"效果一样， type="text" 和type="password"效果一样
解决方式有两种：
    - 第一种 是单独设置宽高，使其达到理想的盒子模型
    - 第二种 是使用css3属性box-sizing: content-box;设置盒子的大小控制方式，content-box就是可以让该盒子和其他盒子一样，指定的宽高不包括padding、border、margin等，而border-box就是默认的表现，padding、border都在指定的宽高内进行

15. 请看问题#14，在左右两个input元素高度一致时，左右不能对齐，就是不在同一条水平线上
已解决，办法是设置vertical-align为一个除了baseline外的值即可，可能还是跟inline-block元素的表现有关

16. 默认字间距为2像素（只是目测了Chrome ^,^）

17. 在写project.html页面时，在a元素中嵌入div，用作在鼠标经过图片时，弹出隐藏的文字框，显示文字部分有背景，在完全使用css的情况下，div和a元素盒子一样大小，需要显示的文字要底部对齐，用 `a div:hover`来实现选择元素，在正常时，将文字和用text-indent隐藏，而hover时，添加背景和显示文字，并且用渐变方式实现背景(可以指定位置)，但是ie不兼容，文字和渐变背景都没有，然后我给盒子加了一个非渐变的默认背景，但是这样就是hover时整个盒子都有背景了，虽然不理想，但是不想为兼容性浪费太多时间，背景就先这样。
    然后我又先后使用了`font-size:0;`到`font-size:1em;`，以及`opacity:1;`到`opacity:0;`达到隐藏显示文字的目的，但是ie仍不兼容，除了opacity能够在鼠标hover到文字上时可以达到效果，但是如果鼠标在div的非文字区域，就还是识别不到hover。
    经过google，找到和我之前不一样的设置hover的方式，`a:hover div` 选中元素，注意它是把hover添加到了a上，所以现在ie和其他浏览器都兼容了，甚至可以指定盒子不用完全和a一样大了，而指定自己想要的高度即可，这样我也可以不使用渐变背景来达到文字区域的背景了，ie也ok

17. 在project.html页面的瀑布流布局那里，a元素嵌入img和一个div，a和img都是inline-block的框，但是a元素始终没有img高，始终会少1px左右，虽然网上的方案都是像问题#1一样解决的，但是这里，只有问题1的第一种方法`img{ display:block ;}` 才有效果，暂时不知道什么原因



- 日历并不是链接，没有可点击的事件，不需要使用a标签

不过都是些小问题，马上就可以调整好了。接下来会看下css和html代码规范，看还有没需要修改的或者语义不正确的地方。
