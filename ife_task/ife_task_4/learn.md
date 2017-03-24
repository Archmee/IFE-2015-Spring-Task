[移动WEB开发入门](https://junmer.github.io/mobile-dev-get-started/#/)

em - 是相对父元素的字体大小单位
rem - 是相对根元素的字体大小单位

固定大小 - px
多屏适配，统一修改 - rem

<meta name="viewport"
      content="width=device-width,
               height=device-height,
               inital-scale=1.0,
               maximum-scale=1.0,
               user-scalable=no;"
               />

橫屏/竖屏
window.addEventListener('orientationchange', function() {
   // rerender something
});
<style media="all and (orientation:portrait)" type="text/css">
    /* 竖屏 */
</style>

<style media="all and (orientation:landscape)" type="text/css">
    /* 横屏 */
</style>

兼容Flex：
.page-wrap {
  display: -webkit-box;      /* OLD - iOS 6-, Safari 3.1-6 */
  display: -moz-box;         /* OLD - Firefox 19- (buggy but mostly works) */
  display: -ms-flexbox;      /* TWEENER - IE 10 */
  display: -webkit-flex;     /* NEW - Chrome */
  display: flex;             /* NEW, Spec - Opera 12.1, Firefox 20+ */
 }

打开数字键盘
<input type="tel">

隐藏地址栏
setTimeout(function(){ window.scrollTo(0, 1); }, 0);

在iPhone,iPad,iTouch的safari上可以使用添加到主屏按钮将网站添加到主屏幕上
<link rel="apple-touch-icon" href="apple-touch-icon-iphone.png" />
<link rel="apple-touch-icon" sizes="72x72" href="apple-touch-icon-ipad.png" />
<link rel="apple-touch-icon" sizes="114x114" href="apple-touch-icon-iphone4.png" />

<!-- tools -->

click 有 300± ms 延迟 服用 [fastclick](https://github.com/ftlabs/fastclick) 后, 可以解决 click 的延迟, 还可以防止 穿透(跨页面穿透除外), 嘿嘿嘿

区域滚动 overflow:auto 不靠谱
- iscroll
- saber-scroll

hammerjs. A javascript library for multi-touch gestures

食指点击目标尺寸是44 x 44像素，拇指是72 x72像素 finger friendly design

-WEBKIT-TAP-HIGHLIGHT-COLOR: RGBA(255,255,255,0)
可以屏蔽点击元素时出现的阴影, 常用于有事件代理的父元素

font icon
矢量图标, 自由变化大小, 颜色; 妈妈再也不用担心我的切图

base64
减少一个请求, 首屏图片无延迟; 图片没法gzip，而css可以

lazyload
有流量就会放肆，没流量就会克制


<!-- CSS3 -->

合理使用渐变/圆角/阴影
别太多, 低端机 hold 不住

代替js动画
性能好, 兼容好, why not?

translate3d
开启GPU硬件加速, 提升动画渲染性能

LOCALSTORAGE：每个域的最大长度为5MB

<!-- 避免事项 -->

iframe
卡 cry, viewport 失效, iOS 宽高失效, fixed定位错误

fixed + input
什么仇什么怨
移动商桥 ios/android 分版本 hack

<!-- 调试 -->

安卓chrome远程调试
chrome://inspect/#devices

weinre
npm安装：npm install -g weinre
启动weinre：weinre --boundHost -all- --httpPort 8081


[移动前端不得不了解的HTML5 head 头标签（2016最新版）](http://www.css88.com/archives/6410)

<!-- Head标签 -->

基本标签：
<meta charset="utf-8">
<meta http-equiv="x-ua-compatible" content="ie=edge">
<!--移动端的页面这个可以忽略，具体可以查看本文Internet Explorer浏览器部分-->
<meta name="viewport" content="width=device-width, initial-scale=1">
<!--具体可以查看本文 为移动设备添加 viewport 部分-->
<!-- 以上 3 个 meta 标签 *必须* 放在 head 的最前面；其他任何的 head 内容必须在这些标签的 *后面* -->

DOCTYPE：
<!DOCTYPE html> <!-- 使用 HTML5 doctype，不区分大小写 -->

charset：
<meta charset="utf-8">
html5 之前网页中会这样写：
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">

lang属性：
简体中文：<html lang="zh-cmn-Hans">
繁体中文：<html lang="zh-cmn-Hant">


meta标签分类：
meta标签根据属性的不同，可分为两大部分：http-equiv 和 name 属性。
- http-equiv：相当于http的文件头作用，它可以向浏览器传回一些有用的信息，以帮助浏览器正确地显示网页内容。
- name属性：主要用于描述网页，与之对应的属性值为content，content中的内容主要是便于浏览器，搜索引擎等机器人识别，等等。

推荐使用的meta标签:

<!-- 设置文档的字符编码 -->
<meta charset="utf-8">
<meta http-equiv="x-ua-compatible" content="ie=edge">
<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
<!-- 以上 3 个 meta 标签 *必须* 放在 head 的最前面；其他任何的 head 内容必须在这些标签的 *后面* -->
 
<!-- 允许控制资源的过度加载 -->
<meta http-equiv="Content-Security-Policy" content="default-src 'self'">
<!-- 尽早地放置在文档中 -->
<!-- 仅应用于该标签下的内容 -->
 
<!-- Web 应用的名称（仅当网站被用作为一个应用时才使用）-->
<meta name="application-name" content="应用名称">
 
<!-- 针对页面的简短描述（限制 150 字符）-->
<!-- 在*某些*情况下，该描述是被用作搜索结果展示片段的一部分 -->
<meta name="description" content="一个页面描述">
 
<!-- 控制搜索引擎的抓取和索引行为 -->
<meta name="robots" content="index,follow,noodp"><!-- 所有的搜索引擎 -->
<meta name="googlebot" content="index,follow"><!-- 仅对 Google 有效 -->
 
<!-- 告诉 Google 不显示网站链接的搜索框 -->
<meta name="google" content="nositelinkssearchbox">
 
<!-- 告诉 Google 不提供此页面的翻译 -->
<meta name="google" content="notranslate">
 
<!-- 验证 Google 搜索控制台的所有权 -->
<meta name="google-site-verification" content="verification_token">
 
<!-- 用来命名软件或用于构建网页（如 - WordPress、Dreamweaver）-->
<meta name="generator" content="program">
 
<!-- 关于你的网站主题的简短描述 -->
<meta name="subject" content="你的网站主题">
 
<!-- 非常简短（少于 10 个字）的描述。主要用于学术论文。-->
<meta name="abstract" content="">
 
<!-- 完整的域名或网址 -->
<meta name="url" content="https://example.com/">
 
<meta name="directory" content="submission">
 
<!-- 基于网站内容给出一般的年龄分级 -->
<meta name="rating" content="General">
 
<!-- 允许控制 referrer 信息如何传递 -->
<meta name="referrer" content="never">
 
<!-- 禁用自动检测和格式化可能的电话号码 -->
<meta name="format-detection" content="telephone=no">
 
<!-- 通过设置为 “off” 完全退出 DNS 预取 -->
<meta http-equiv="x-dns-prefetch-control" content="off">
 
<!-- 在客户端存储 cookie，web 浏览器的客户端识别 -->
<meta http-equiv="set-cookie" content="name=value; expires=date; path=url">
 
<!-- 指定要显示在一个特定框架中的页面 -->
<meta http-equiv="Window-Target" content="_value">
 
<!-- 地理标签 -->
<meta name="ICBM" content="latitude, longitude">
<meta name="geo.position" content="latitude;longitude">
<!-- 国家代码 (ISO 3166-1): 强制性, 州代码 (ISO 3166-2): 可选; 如 content="US" / content="US-NY" -->
<meta name="geo.region" content="country[-state]">
<!-- 如 content="New York City" -->
<meta name="geo.placename" content="city/town">


SEO 优化部分：

页面标题<title>标签(head 头部必须)
<title>your title</title>

页面关键词 keywords
<meta name="keywords" content="your keywords">

页面描述内容 description
<meta name="description" content="your description">

定义网页作者 author
<meta name="author" content="author,email address">

定义网页搜索引擎索引方式，robotterms 是一组使用英文逗号「,」分割的值，通常有如下几种取值：none，noindex，nofollow，all，index和follow。
<meta name="robots" content="index,follow">


favicon 图标
IE 11, Chrome, Firefox, Safari, Opera支持设置：
<link rel="icon" href="path/to/favicon-16.png" sizes="16x16" type="image/png">
<link rel="icon" href="path/to/favicon-32.png" sizes="32x32" type="image/png">
<link rel="icon" href="path/to/favicon-48.png" sizes="48x48" type="image/png">
<link rel="icon" href="path/to/favicon-62.png" sizes="62x62" type="image/png">
<link rel="icon" href="path/to/favicon-192.png" sizes="192x192" type="image/png">


viewport 可以让布局在移动浏览器上显示的更好。 通常会写
<meta name="viewport" content="width=device-width, initial-scale=1.0">
width=device-width 会导致 iPhone 5 添加到主屏后以 WebApp 全屏模式打开页面时出现黑边(http://bigc.at/ios-webapp-viewport-meta.orz)

content 参数：
width viewport 宽度(数值/device-width)
height viewport 高度(数值/device-height)
initial-scale 初始缩放比例
maximum-scale 最大缩放比例
minimum-scale 最小缩放比例
user-scalable 是否允许用户缩放(yes/no)


[MobileWeb 适配总结](www.meow.re/original/2015/04/27/screen-adaptation-in-mobileweb/)
1. 固定高度，宽度自适应
2. flex
3. 使用rem来


[浅谈移动前端的最佳实践](http://www.cnblogs.com/yexiaochai/p/4219523.html)

单页or多页：
spa也就是我们常常说的web应用程序webapp，被认为是业内的发展趋势，主要有两个优点：
- 用户体验好
- 可以更好的降低服务器压力
但是单页有几个致命的缺点：
- SEO支持不好，往往需要单独写程序处理SEO问题
- webapp本身的内存管理难，Javascript、Css非常容易互相影响

Jquery VS Zepto 
主要对比在使用场景：jQuery体积大，兼容性好，Zepto体积小，兼容性不够，适用于移动端

MVC框架选择
总结一句：不建议直接将业务库框架直接取来使用，更不建议使用过重的业务框架，最好是能明白框架想要解决的问题，与自己项目的实际需求，自己造轮子知根知底。

框架建议
第三方库（基础库）：
requireJS+Zepto+阉割版underscore（将其中不太用到的方法去掉，主要使用模板引擎一块）+ Fastclick
MVC库/UI库：
建议自己写，不要太臃肿，可以抄袭，可以借鉴，不要完全拿来就用
这样出来的一套框架比较轻量级，知根知底，不会出现改不动的情况，最后提一句：不经过调研，没有实际场景在框架中玩模式，玩高级理念死得快，不要为技术而技术。

网站是如何变慢的？
- 尺寸——慢的根源
所以，尺寸变大的主要原因是因为冗余代码的产生，如何消除冗余代码是一个重点，也是一个难点。

- 版本轮替——哪些能删的痛点
业务团队不要依赖于框架的任何dom结构与css样式，特别不要将UI组件中的dom结构与样式单独抠出来使用，否则就准备肥皂吧

- CSS冗余的解决方案

网络请求
请求是前端优化的生命，优化到最后，优化到极致，都会在请求数、请求量上做文章，常用并且实用的手段有：
- CSS Sprites：CSS Sprites可以有效的减低请求数，偶尔还可以降低请求量，但是随着发展，可能会有以下问题：
	+ 新增难
	+ 删除难
	+ 调整难
	+ 响应式

- 快的假象
  1. lazyload
	我们常说的延迟加载是图片延迟加载，其实非图片也可延迟加载，看实际需求即可。
    - 为img标签src设置统一的图片链接，而将真实链接地址装在自定义属性中。
	- 所以开始时候图片是不会加载的，我们将满足条件的图片的src重置为自定义属性便可实现延迟加载功能
  2. fake页面
  一个静态HTML页面，装载首屏的基本内容，让首页快速显示，然后js加载结束后会马上重新渲染整个页面，这个样子，用户就可以很快的看到页面响应，给用户一个快的错觉
  3. 预加载
  这里的预加载是在浏览器空闲的时候加载后续页面所需资源，是一种浪费用户流量的行为，属于以空间换时间的做法，实施难度也比较高。预加载的前提是不影响主程序的情况下偷偷的加载，也就是在浏览器空闲的时候加载，但是浏览器空闲似乎变得不可控制

- 合并脚本js文件
	1. 为什么要降低请求数？
	每次http请求都会带上一些额外信息，会导致其它开销，比如域名解析、开启连接、发送请求等操作，上述spirit也因此产生。
	2. 浏览器并发数
	chrome在请求资源下会有所限制，移动端的限制普遍在6个左右，这个时候在并发数被占满时，你的ajax便会被搁置，这在webapp中情况更加常见，所以网络限制的情况下请求数控制是必要的，而且可以降低服务器端的压力。
- 离线存储
	工作中实际使用的离线缓存有localstorage与Application cache，这两个皆是好东西，一个常用于ajax请求缓存，一个常用于静态资源缓存，这里简单说下我的一些理解。

移动革命——Hybrid
- 拒绝native UI
- 交互模型 http://images.cnitblog.com/blog/294743/201501/201903092504221.png
- Hybrid的调试
- 多webview

不恰当的需求
- 唤醒app
- 回退关闭弹出层
- 全站IScroll化