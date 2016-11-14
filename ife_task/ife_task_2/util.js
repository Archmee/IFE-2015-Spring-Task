// --------------------
// Basic
// --------------------
var protoToString = Object.prototype.toString;
var DataType = {
	NUMBER: 	"[object Number]",
	STRING: 	"[object String]",
	BOOL: 		"[object Boolean]",
	ARRAY: 		"[object Array]",
	FUNCTION: 	"[object Function]",
	OBJECT: 	"[object Object]",
	DATE: 		"[object Date]",
	REGEXP: 	"[object RegExp]"
};
// 是否是数字
function isNumber(arg) {
	return protoToString.call(arg) === DataType.NUMBER;
}
// 是否是字符串
function isString(arg) {
	return protoToString.call(arg) === DataType.STRING;
}
// 是否是布尔值
function isBoolean(arg) {
	return protoToString.call(arg) === DataType.BOOL;
}
// 是否是数组
function isArray(arg) {
	// ES3：arr instanceof Array;
	// ES5：Array.isArray(arr)
	var isA = Array.isArray || function(a) {
		return protoToString.call(a) === DataType.ARRAY;
	};
	return isA(arg);
}
// 是否是函数
function isFunction(arg) {
	return protoToString.call(arg) === DataType.FUNCTION;
}
// 是否是对象
function isObject(arg) {
	return protoToString.call(arg) === DataType.OBJECT;
}
// 是否是时间对象
function isDate(arg) {
	return protoToString.call(arg) === DataType.DATE;
}
// 是否是正则
function isRegExp(arg) {
	return protoToString.call(arg) === DataType.REGEXP;
}

// 使用递归来实现一个深度克隆，可以复制一个目标对象，返回一个完整拷贝
// 被复制的对象类型会被限制为数字、字符串、布尔、日期、数组、Object对象。不会包含函数、正则对象等
function cloneObject(src) {
	var newValue;

   	if (isFunction(src) || isRegExp(src)) { //函数或正则
   		newValue = null;
    } else if (isArray(src)) { //数组
    	// newValue = Array.prototype.slice.call(src, 0); //不能复制扩展属性
    	newValue = [];
    	for (var item in src) { //用forin遍历数组是为了访问扩展的属性（不是通过索引，类似对象属性）
    		if (!src.hasOwnProperty(item)) { continue; } //防止继承属性
    		var res = arguments.callee(src[item]);
    		if (res != null) { // not null
    			// newValue.push(res); //直接顺序插入（可以将不规则索引重新排列，反正值保存下来就ok了）
    			newValue[item] = src[item] //还是用索引的方式（数组还是保持原样，有关联数组的地方还是关联的形式）
    		}
    	}
    } else if (isObject(src)) { //非函数正则数组的对象
    	newValue = {};
    	for (var item in src) {
    		if (!src.hasOwnProperty(item)) { continue; }
    		var res = arguments.callee(src[item]);
    		if (res != null) { // not null
    			newValue[item] = res;
    		}
    	}
    } else if (isDate(src)) { //日期
    	newValue = new Date(src);
    } else { //基本值
    	newValue = src;
    }

    return newValue;
}

//https://github.com/laozhang007/ife/blob/master/task/task0002/work/laozhang007/js/util.js
function cloneObject2(obj) {
    var s = JSON.stringify(obj);
    var o = JSON.parse(s);
    return o;
}

// Pollyfill: Array.indexOf
// MDN https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf
Array.prototype.indexOf = Array.prototype.indexOf || function(searchElement, fromIndex) {

	var k;
	if (this == null) {
		throw new TypeError('"this" is null or not defined');
	}
	var O = Object(this);

	var len = O.length >>> 0;
	if (len === 0) {
		return -1;
	}

	var n = +fromIndex || 0;
	if (Math.abs(n) === Infinity) {
		n = 0;
	}
	if (n >= len) {
		return -1;
	}

	k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);
	while (k < len) {
		if (k in O && O[k] === searchElement) {
			return k;
		}
		k++;
	}

	return -1;
};

// 对数组进行去重操作，只考虑数组中元素为数字或字符串，返回一个去重后的数组
function uniqArray(arr) {
	var newArr = [];

    for (var i = 0, l = arr.length; i < l; i++) {
    	//O(>2n)
		// if (newArr.indexOf(arr[i]) == -1) { // not found arr[i] in newArr
		// 	newArr.push(arr[i]);
		// }

    	// hash O(n) 但是不好的是，这样处理其他数据类型就麻烦了
    	if (isNumber(arr[i])) {
    		newArr[arr[i]] = arr[i];
    	} else if (isString(arr[i])) {
    		newArr['s_'+arr[i]] = arr[i]; //区别类型，例如hash 1 和 '1' 不能覆盖
    	}
    	
    }

    return newArr;
}

// 对字符串头尾进行空格字符的去除、包括全角半角空格、Tab等，返回一个字符串
// 尝试使用一行简洁的正则表达式完成该题目
function trim(str) {
	return str.replace(/^\s+|\s+$/g, '');
}

// 实现一个遍历数组的方法，针对数组中每一个元素执行fn函数，并将数组索引和元素作为参数传递
function each(arr, fn) { 
	if (!isFunction(fn)) {
		return false;
	}
	for (var i = 0, l = arr.length; i < l; i++) {
		fn.call(arr, i, arr[i]);
	}
}

// 获取一个对象里面第一层元素的数量，返回一个整数，ES5支持Object.keys获取对象属性
function getObjectLength(obj) {
	var count = 0;

	if (Object.keys) {
		count = Object.keys(obj).length;
	} else {
		for(var item in obj) {
			if (obj.hasOwnProperty(item)) {
				count++;
			}
		}
	}
	
	return count;
}

// From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
Object.keys = Object.keys || function(obj) {
	'use strict';
	var hasOwnProperty = Object.prototype.hasOwnProperty,
    	hasDontEnumBug = !({ toString: null }).propertyIsEnumerable('toString'),
	    dontEnums = [
	      'toString',
	      'toLocaleString',
	      'valueOf',
	      'hasOwnProperty',
	      'isPrototypeOf',
	      'propertyIsEnumerable',
	      'constructor'
	    ],
    	dontEnumsLength = dontEnums.length;

    if (typeof obj !== 'object' && (typeof obj !== 'function' || obj === null)) {
        throw new TypeError('Object.keys called on non-object');
    }

    var result = [], prop, i;

    for (prop in obj) {
        if (hasOwnProperty.call(obj, prop)) {
          result.push(prop);
        }
    }

    if (hasDontEnumBug) {
        for (i = 0; i < dontEnumsLength; i++) {
            if (hasOwnProperty.call(obj, dontEnums[i])) {
                result.push(dontEnums[i]);
            }
        }
    }

    return result;
};

// 判断是否为邮箱地址
function isEmail(emailStr) {
    var pattern = /^[\w-]+@[\w-]+(\.[a-zA-Z\d]+){1,2}$/i;//ignorecase
    return pattern.test(emailStr);
}

// 判断是否为手机号
function isMobilePhone(phone) {
	var pattern = /^(\+?86)?1\d{10}$/;
	return pattern.test(phone);
}

//--------------
// DOM
//--------------

// 判断siblingNode和element是否为同一个父元素下的同一级的元素，返回bool值
function isSiblingNode(element, siblingNode) {
    return element.parentNode === siblingNode.parentNode;
}

// 获取element相对于浏览器窗口的位置，返回一个对象{x, y}
function getPosition(element) { // x
    var pos = {x:0, y:0};
    var current = element;

    while (current.nodeName.toLowerCase() != 'html') {
    	// console.log(current);
    	// console.log(pos);

    	pos.x += current.offsetLeft;
    	pos.y += current.offsetTop;

    	current = current.parentNode; //offsetParent is also ok
    }

    pos.x -= document.body.scrollLeft || document.documentElement.scrollLeft;
    pos.y -= document.body.scrollTop || document.documentElement.scrollTop;

    return pos;
}

// 检查元素类名中是否包含传入的classStr
function hasClass(element, classStr) {
    //要么以字符串开头或结尾，要么字符串前后都有1或多个空格
    var re = new RegExp('(^|\\s+)'+classStr+'(\\s+|$)', 'g');
    return re.test(element.className); //返回正则匹配结果
}

// 为element增加一个样式名为addClass的新样式
// ps: HTML5 新增了classList属性，可以更加方便的添加删除class，但是这里考虑兼容性没有使用
function addClass(element, newClass) {
    if (!hasClass(element, newClass)) {
        element.className += ' ' + newClass;
    }
}

// 移除element.className中的oldClass
function removeClass(element, oldClass) {
	//要么以字符串开头或结尾，要么字符串前后都有1或多个空格
	var re = new RegExp('(^|\\s+)'+oldClass+'(\\s+|$)', 'g');
    element.className = element.className.replace(re, '$1'); //$1可以决定是替换为1个空格还是0个
}

// 遍历节点并调用匹配回调函数
function traversalNodes(element, isMatch) {
	if (!element) { return null; }
	var nodeList = [];

	// getElementsByTagName('*')的方法已经放弃，原因有：
	// 1 返回IE的注释节点，2 在遍历节点时要执行回调函数
	
	if (document.createNodeIterator) { //HTML5遍历方法，兼容IE9+
		
		var iterator = document.createNodeIterator(element, NodeFilter.SHOW_ELEMENT, null, false);
		var node = iterator.nextNode(); //node现在是传入的根节点

		while((node = iterator.nextNode()) != null) { //遍历子节点(两次调用nextNode已经不包括根节点)
			// if 如果有匹配函数
			//	  if 且匹配成功 则保存
			// else 如果没有传入匹配函数，则全部保存

			// 如果没有函数 或者 有函数且函数返回真就保存节点
			if (!isFunction(isMatch) || isMatch(node)) { 
				nodeList.push(node); 
			}
		}
	} else { //兼容IE8以及更低版本
		(function(node) { // 递归遍历节点(深度优先)
			node = node.children || node.childNodes; // children和childNodes还有一个很大的区别是IE7、8、9的document对象上都没有children对象但是有childNodes，所以这里这样做的好处是让支持children的浏览器用children，因为children只保存了元素节点，循环更少
			for (var i = 0, len = node.length; i < len; i++) {
				// if条件本来是想防止IE8及更低版本的注释节点（p299提到IE中的children属性包括注释节点）
				// 但后来看到IE8及更低版本将注释节点实现为了Element类型（p258），猜想nodeType也相同了，无解
				// 经过验证(IE7+)：nodeType===1可用来判定是否是元素节点，p249也提到过适用于所有浏览器
				// 再次验证(IE7+)：其实不用判断nodeType也是有效的，也就是说ie中的children属性并不包括注释节点
				// 但书上为什么这么说？？？
				if (node[i].nodeType === 1) { //确认是元素节点
					if (!isFunction(isMatch) || isMatch(node[i])) {
						nodeList.push(node[i]);
					}
					arguments.callee(node[i]); // 递归调用
				}
			}

		})(element);
	}

	return nodeList;
}


// 返回bool值，该节点的class是否包含classStr字符串中的所有类
function containClasses(element, classStr) {
	//任何一个为空，都不会是包含关系，可直接返回假
	if (!element.className || !classStr || !isString(classStr)) {
		return false;
	}

	var classArr = classStr.split(/\s+/); //把多个类名拆分逐个检查
	for (var i = 0, len = classArr.length; i < len; i++) {
		if (!hasClass(element, classArr[i])) {
			return false; //一旦找到不匹配的类名，就直接返回
		}
	}

	return true; //如果循环结束就说明全部匹配，是包含关系
}

// 获取在element节点中匹配classStr的节点并返回
function getByClass(element, classStr) {
	var classList = traversalNodes(element, function(node) {
		return containClasses(node, classStr);
	}); //遍历节点并执行回调
	
	return classList;
}

// 根据标签查找元素
function getByTag(element, tagName) {
	var tagList = traversalNodes(element, function(node) {
		return node.nodeName.toLowerCase() === tagName.toLowerCase(); //nodeName/tagName均可
	});

	return tagList;
}

// 根据id查找元素
function getById(element, id) {
	var idsList = traversalNodes(element, function(node) {
		return node.id === id;
	});

	return idsList;
}

// 通过属性获取元素
// value表示匹配属性的值，省略时只匹配属性名
function getByAttr(element, attr, value) {
	var eleList = traversalNodes(element, function(node) {
		return hasAttribute(node, attr, value); // 这里始终传入value参数，不管是否传入都在函数内部检测
	});

	return eleList;
}

// TODO：验证IE低版本中是否有很多属性节点，是否可以通过 attr in obj 的方式来判断
// 返回该元素是否有attr属性（以及value）
function hasAttribute(element, attr, value) {
	var attrs = element.attributes;
	for (var i = 0, len = attrs.length; i < len; i++) {
		if (!attrs[i].specified || attrs[i].nodeName !== attr) { //检测specified是为了兼容IE7-
			continue;
		}
		// else 属性名已经找到，接下来无论是否匹配 value 都直接返回而不再循环了
		// 如果传入了value参数，就检查value参数是否匹配
		// 如没有传入value，则直接返回true，因为attr已经找到
		return (isString(value) ? attrs[i].nodeValue === value : true);
	}

	return false;
}

// 获取属性节点的值
function getAttributeValue(element, attrName) {
	return element.attributes[attrName].nodeValue;
}


//根据选择器来获取元素，组合选择器只支持空格
function getBySelector(element, selector) {
	var res = null;

	if (/^[a-zA-Z]+[a-zA-Z\d]?$/.test(selector)) { //By TagName，\d是为了匹配h1-h6等带有数字的tag
		res = getByTag(element, selector);
		
	} else if (/^#[-\w]+/.test(selector)) { //By ID
		selector = selector.replace(/^#/, '');
		res = getById(element, selector);//element should always be document

	} else if (/^\.[-\w]+/.test(selector)) { //By Class
		selector = selector.replace(/^\./, '');
		res = getByClass(element, selector);

	} else if (/^\[[-\w]+\]$/.test(selector)) { //By attribute
		var attr = selector.replace(/^\[([-\w]+)\]$/, "$1"); //去掉前后[]符号
		res = getByAttr(element, attr);
		
	} else if(/^\[[-\w]+\=[-\w]+\]/.test(selector)) { //By attribute and value
		selector = selector.replace(/^\[([-\w]+\=[-\w]+)\]$/, "$1"); //去掉前后[]符号
		var pair = selector.split('='); // 分割成键值对的数组
		res = getByAttr(element, pair[0], pair[1]); //pair[0], pair[1]分别代表属性名和属性值

	}

	return res;
}

// 实现一个简单的Query
function $(selector) {
	var selectorArr = selector.split(/\s+/); //拆分组合选择器

	//递归的过程中找到答案，回溯返回
	var res = (function (node, currentIndex) {
		var matchList = getBySelector(node, selectorArr[currentIndex]); //从node的孩子节点匹配selector
		if (matchList == null || matchList.length < 1) { //如果没有返回值，直接返空
			return null;
		} // else 有返回值

		if (currentIndex === selectorArr.length-1) { //如果已经匹配到最后一个选择器
			return matchList[0];
		} // else 选择器还没匹配结束，继续递增

		currentIndex++; //每一级递归都有自己的currentIndex，保证了回溯过程
		for (var i = 0, len = matchList.length; i < len; i++) {
			var ret = arguments.callee(matchList[i], currentIndex); 
			if (ret != null) {
				return ret;
			}
		}

		return null; //循环结束都没有找到，那就是null了
	})(document, 0); //起点节点从document开始，selectorIndex从0开始

	return res; //返回
}

// -----------------
// Event
// -----------------

// 给一个element绑定一个针对event事件的响应，响应函数为listener
function addEvent(element, eventType, listener) {
    if (element.addEventListener) {
    	element.addEventListener(eventType, listener, false);
    } else if (element.attachEvent) {
    	element.attachEvent('on'+eventType, listener);
    } else {
    	element['on'+eventType] = listener;
    }
}

// 移除element对象对于event事件发生时执行listener的响应
function removeEvent(element, eventType, listener) {
    if (element.removeEventListener) {
    	element.removeEventListener(eventType, listener, false);
    } else if (element.detachEvent) {
    	element.detachEvent('on'+eventType, listener);
    } else {
    	element['on'+eventType] = null;
    }
}

// 实现对click事件的绑定
function addClickEvent(element, listener) {
    addEvent(element, 'click', listener);
}

// 实现对于按Enter键时的事件绑定
function addEnterEvent(element, listener) {
	addEvent(element, 'keyup', function(event) {
		event = event || window.event;
		event.keyCode = event.keyCode || event.which; //e.whice for firefox/opera
		if (event.keyCode === 13) { //enter键
			listener.call(element, event);
		}
	});
}

function delegateEvent(element, tag, eventName, listener) { //把tag换成selector会不会更好？
   addEvent(element, eventName, function(event) {
   		event = event || window.event;
   		event.target = event.target || event.srcElement;
   		if (event.target.nodeName.toLowerCase() === tag.toLowerCase()) {
   			listener.call(event.target, event);
   		}
   });
}

$.on = function(selector, event, listener) {
    addEvent($(selector), event, listener);
}

$.un = function(selector, event, listener) {
    removeEvent($(selector), event, listener);
}

$.click = function(selector, listener) {
    addClickEvent($(selector), listener);
}

$.enter = addEnterEvent;

$.delegate = function(selector, tag, event, listener) {
    delegateEvent($(selector), tag, event, listener);
}

// -----------------
// BOM
// -----------------
// 判断是否为IE浏览器，返回-1或者版本号
function isIE() {
	//如果不是opera且代理字符串能匹配正则表达式，则返回IE版本，否则返回-1
	if (!window.opera && /MSIE ([^;]+)/i.test(window.navigator.userAgent)) {
		return document.documentMode || +RegExp['$1'];
	}
	return -1;
}

// 设置cookie
function setCookie(cookieName, cookieValue, expiredays) {
    var expireMS = new Date(Date.now() + expiredays*24*60*60*1000);

    document.cookie = encodeURIComponent(cookieName) + '=' +
    				  encodeURIComponent(cookieValue) + 
    				  (!expiredays ? '' : '; expires=' + expireMS.toUTCString()); //toUTCString
// TODO: UTC并非当地时间
}

// 获取cookie值
function getCookie(cookieName) {
	cookieName = encodeURIComponent(cookieName) + '=';
	var cookieStart = document.cookie.indexOf(cookieName),
		cookieValue = null;

	if (cookieStart > -1) { //Found
		var cookieEnd = document.cookie.indexOf(';', cookieStart);
		if (cookieEnd == -1) { //if not found
			cookieEnd = document.cookie.length;
		}

		cookieValue = decodeURIComponent(document.cookie.substring(cookieStart+cookieName.length, cookieEnd));
	}

	return cookieValue;
}

function unsetCookie(cookieName) {
	setCookie(cookieName, '', new Date(0));
}

// ----------------
// Ajax
// ----------------

// options是一个对象，里面可以包括的参数为：
// type: post或者get，可以有一个默认值
// data: 发送的数据，为一个键值对象或者为一个用&连接的赋值字符串
// onsuccess: 成功时的调用函数
// onfail: 失败时的调用函数
function ajax(url, options) {
    var xhr = null;

    if (window.XMLHttpRequest) { //IE7+
    	xhr = new XMLHttpRequest();
    } else { //IE5,6
    	xhr = new ActiveXObject("Microsoft.XMLHTTP");
    }

    xhr.onreadystatechange = function() {
    	if (xhr.readyState == 4 ) {
    		if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304) {
    			options.onsuccess && options.onsuccess.call(options, xhr.responseText, xhr);
    		} else {
    			options.onfail && options.onfail.call(options, xhr);
    		}
    	}
    }

    var params = '';
    if (options.data) {
    	
    	if (typeof options.data === "string") {//split for encodeURIComponent
    		params = options.data.split('&');
    		options.data = {}; //如果是字符串可以分割并保存到新对象中
    		for (var i = 0, len = params.length; i < len; i++) {
    			var pair = params[i].split('=');
    			options.data[pair[0]] = pair[1];
    		}
    	}

    	var plist = [];
    	for (var item in options.data) {
    		plist.push( encodeURIComponent(item) + '=' + 
    					encodeURIComponent(options.data[item]) );
    	}
    	params = plist.join('&');
    }

    options.type = !options.type ? "GET" : options.type.toUpperCase();
    if (options.type === "GET") {
    	xhr.open("GET", url+'?'+params, true);
    	xhr.send(null);
    } else if (options.type === "POST") {
    	xhr.open("POST", url, true);
    	xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded; charset=UTF-8");
    	xhr.send(params);
    }
}