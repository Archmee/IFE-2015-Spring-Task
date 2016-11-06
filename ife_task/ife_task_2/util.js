// --------------------
// Basic
// --------------------

function isArray(arr) {
	return arr instanceof Array; //ES3
	// return Array.isArray(arr); //ES5
}

function isFunction(fn) {
	return typeof fn === "function";
}

// 使用递归来实现一个深度克隆，可以复制一个目标对象，返回一个完整拷贝
// 被复制的对象类型会被限制为数字、字符串、布尔、日期、数组、Object对象。不会包含函数、正则对象等
function cloneObject(src) {
	var obj = {};
    for(var item in src) {
    	
    	var type = typeof src[item];
    	switch(type) {
    		case "number":
    		case "string":
    		case "boolean":
    			obj[item] = src[item];
    			break;
    		case  "object":
	    		if (src[item] instanceof Date) {//date
	    			obj[item] = new Date(src[item].toString());
				}  else if ( src[item] instanceof Object && !(src[item] instanceof RegExp) ) { //Object include Array but not RegExp
					// console.log(src[item]);
					obj[item] = cloneObject(src[item]);
				}
				break;
    		default: //maybe function
    			console.log(type);
    	}
    }
   
    return obj;
}

// 对数组进行去重操作，只考虑数组中元素为数字或字符串，返回一个去重后的数组
function uniqArray(arr) {
	var newArr = [];
    for (var i = 0; i < arr.length; i++) {
    	//O(>2n)
    	if (typeof arr[i] === "number" || typeof arr[i] === "string") {
    		if (newArr.indexOf(arr[i]) > -1) { // found arr[i] in newArr
    			continue;
    		} else {
    			// console.log(arr[j]);
    			newArr.push(arr[i]);
    		}
    	} else {//不是数字或字符，直接插入数组
    		newArr.push(arr[i]);
    	}

    	// hash O(n) 但是不好的是，这样处理其他数据类型就麻烦了
    	// if (typeof arr[i] === "number" || typeof arr[i] === "string") {
    	// 	newArr[arr[i]] = arr[i];
    	// }
    }

    return newArr;
}

// 对字符串头尾进行空格字符的去除、包括全角半角空格、Tab等，返回一个字符串
// 尝试使用一行简洁的正则表达式完成该题目
function trim(str) {
	return str.replace(/^\s*|\s*$/g, '');
}

// 实现一个遍历数组的方法，针对数组中每一个元素执行fn函数，并将数组索引和元素作为参数传递
function each(arr, fn) {
	if (typeof fn === "function") {
		for (var i = 0, len=arr.length; i < len; i++) {
			fn(arr[i]);//i
		}
	}
}

// 获取一个对象里面第一层元素的数量，返回一个整数，ES5支持Object.keys获取对象属性
function getObjectLength(obj) {
	var count = 0;
	for(var item in obj) {
		count++;
	}
	return count;
}

// 判断是否为邮箱地址
function isEmail(emailStr) {
    var pattern = /[\w-]+@[\w-]+(\.[a-zA-Z]+){1,2}[a-zA-Z]$/;
    return pattern.test(emailStr);
}

// 判断是否为手机号
function isMobilePhone(phone) {
	var pattern = /^(\+?86)?1[0-9]{10}$/;
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
function getPosition(element) {
    var pos = {};
    pos.x = element.offsetLeft - (document.body.scrollLeft || document.documentElement.scrollLeft);
    pos.y = element.offsetTop - (document.body.scrollTop || document.documentElement.scrollTop);
    return pos;
}

// 为element增加一个样式名为newClassName的新样式
// ps: HTML5 新增了classList属性，可以更加方便的添加删除class，但是这里考虑兼容性没有使用
function addClass(element, newClassName) {
	// 这虽然不算好的方式，但是效率高，即使添加了重复的类，也不影响效果
	// 更合理的方法是把原字符串分割成数组，删掉和要添加的重复的class

	removeClass(element, newClassName); //更新：先删除已有类名，这样就不会重复了
    if (element.className) {
    	element.className += ' ';
    }
    element.className += newClassName; //没有任何类时className=""
}

// 移除element中的样式oldClassName
function removeClass(element, oldClassName) {
	
	var tempClass = element.className;
	var oldClassNameArr = oldClassName.split(/\s+/);
	
	for (var i = 0, len = oldClassNameArr.length; i < len; i++) {
		//要么以字符串开头或结尾，要么字符串前后都有1或多个空格
		// var re = new RegExp('(^'+oldClassName+')|(\\s+'+oldClassName+'\\s+)|('+oldClassName+'$)', 'g');
		var re = new RegExp('(^|\\s+)+'+oldClassNameArr[i]+'(\\s+|$)+', 'g');
		
	    tempClass = tempClass.replace(re, ' ');
	}

	element.className = tempClass;//将删除后的类名一次性赋值，防止多次渲染
	return tempClass; //并且返回删除后的className
}

// 获取在element节点中匹配classNameStr的节点并返回
function getByClass(element, classNameStr) {
	var classList = [];
	// 如果支持最新的通过类名获取元素的方法，直接取得结果（IE9+）
	if (typeof element.getElementsByClassName === "function") {
		classList = element.getElementsByClassName(classNameStr);
	} else { //更低版本
		classList = traversalNodes(element, function(node) {
			return containClasses(node, classNameStr);
		}); //遍历节点并执行回调
	}

	return classList;
}


// 返回bool值，该节点的class是否包含classes字符串中的所有类
function containClasses(element, classes) {
	var classStr = element.className;
	//任何一个为空，都不会是包含关系，可直接返回假
	if (!classStr || !classes
		|| typeof classStr !== "string"
		|| typeof classes !== "string") {
		return false;
	}

	var allMatch = true; //默认全部匹配
	var classesArr = classes.split(/\s+/); //把多个类名拆分

	for (var i = 0, len = classesArr.length; i < len; i++) {
		if (!hasClass(element, classesArr[i])) {
			allMatch = false;
			break; //找到不匹配的一个，就可以退出循环了
		}
	}

	return allMatch;
}

// 检查元素类名中是否包含传入的classStr
function hasClass(element, classStr) {
	var eleClass = element.className;

	//要么以字符串开头或结尾，要么字符串前后都有1或多个空格
	var re = new RegExp('(^|\\s+)+'+classStr+'(\\s+|$)+', 'g');

	return re.test(eleClass); //返回匹配的bool值，test方法本身也是返回布尔值
}

function traversalNodes(element, isMatchFunc) {
	var nodeList = [];

	//if语句执行原生的语法的方法已经放弃，原因有：1 是IE的注释节点，2 是我在遍历节点是要执行传进来的回调函数
	/*if (typeof element.getElementsByTagName === "function") {
		var temp = element.getElementsByTagName('*'); //返回的是一个HTMLCollection的对象，IE返回值可能包括注释节点，所以或许这不是一个好的方法（P258）
		temp = Array.prototype.slice.call(temp, 0);   //转化为数组
		//nodeList.concat(element, temp); //最开始想把本元素拼接起来：后来发现不需要，因为一般在一个元素上执行查询都是针对子元素，而不包括本元素
		nodeList = temp;
	} */
	/* 下面是检查是否支持最新的遍历方法
	** PS：其实如果浏览器createNodeIterator的话，也几乎都支持getElementsByTagName了，所以下面的语句几乎不会执行
	*/
	// ---上面的已废弃----
	
	if (typeof document.createNodeIterator === "function") { //HTML5遍历方法，兼容IE9+
		
		var iterator = document.createNodeIterator(element, NodeFilter.SHOW_ELEMENT, null, false);
		var node = iterator.nextNode(); //node现在是传入的根节点

		while(node !== null) {
			
			if(node != element) {  //不包括根节点，其实更简洁的方法是在循环外调用两次nextNode()，但是担心万一没有下一个节点会抛出异常
				if (typeof isMatchFunc === "function") { //如果有匹配函数
					if (isMatchFunc(node)) { //且匹配成功，则保存
						nodeList.push(node);
					}
				} else { //如果没有传入匹配函数，则全部保存
					nodeList.push(node);
				}
			};

			node = iterator.nextNode();//遍历下一个元素，不一定是兄弟元素
		}
		// alert('createNodeIterator');
	} else { //兼容IE8以及更低版本
		
		(function(node) { // 递归遍历节点（深度优先）
			
			if(node != element) {  //不包括根节点
				if (typeof isMatchFunc === "function") { //如果有匹配函数
					if (isMatchFunc(node)) { //且匹配成功，则保存
						nodeList.push(node);
					}
				} else { //如果没有传入匹配函数，则全部保存
					nodeList.push(node);
				}
			};

			node = node.children; //Element Node
			for (var i = 0, len = node.length; i < len; i++) {
				// if条件本来是想防止IE8及更低版本的注释节点（p299提到IE中的children属性包括注释节点）
				// 但后来看到IE8及更低版本将注释节点实现为了Element类型（p258），猜想nodeType也相同了，无解
				// 经过验证(IE7+)：nodeType===1可用来判定是否是元素节点，p249也提到过适用于所有浏览器
				// 再次验证(IE7+)：其实不用判断nodeType也是有效的，也就是说ie中的children属性并不包括注释节点，但书上为什么这么说？？？
				// TODO:有待确认???
				if (node[i].nodeType === 1) { 
					arguments.callee(node[i]); //递归调用
				}
			}
		})(element);
		// alert('myIterator');
	}

	return nodeList;
}

// 判断参数是否是一个节点
function isNode(element) {
	return typeof element.nodeType === "number";
}


// 根据标签查找元素
function getByTag(element, tagName) {
	var tagList = traversalNodes(element, function(node) {
		return node['nodeName'].toLowerCase() === tagName.toLowerCase(); //nodeName/tagName均可
	});

	return tagList;
}

// 根据id查找元素
function getById(element, id) {
	var idsList = traversalNodes(element, function(node) {
		return node['id'] === id;
	});

	return idsList;
}

// 通过属性获取元素
// value表示匹配属性的值，省略时只匹配属性名
function getByAttr(element, attr, value) {
	
	var eleList = traversalNodes(element, function(node) {
		// 这里始终传入value参数，不管函数是否传入，在函数内部检测即可
		return hasAttribute(node, attr, value); 
	});

	return eleList;
}

// TODO：验证IE低版本中是否有很多属性节点，是否可以通过 attr in obj 的方式来判断
// 返回该元素是否有attr属性（以及value）
function hasAttribute(element, attr, value) {
	var attrs = element.attributes;
	for (var i = 0, len = attrs.length; i < len; i++) {
		if (attrs[i].specified && attrs[i].nodeName === attr) { //检测specified是为了兼容IE7-
			if (typeof value === "string" && value != "") { //如果传入了value参数，则检测，若没有传入，则其值为undefined，转到else语句
				if (attrs[i].nodeValue === value) { //如果value值也匹配了则返回真，否则继续循环
					return true;
				}
				
			} else { //若没有第3个参数则表示只检测是否有该属性，现在已经检测到了，返回真
				return true;
			}
		}
	}

	return false;
}

// 获取属性节点的值
function getAttributeValue(element, attrIndex) {
	return element.attributes[attrIndex].nodeValue;
}


//根据选择器来获取元素，组合选择器只支持空格
function getBySelector(element, selector) {
	var res = null;

	if (/^[a-zA-Z]+[a-zA-Z\d]?$/.test(selector)) { //By TagName，\d是为了匹配h1-h6等带有数字的tag
		res = getByTag(element, selector);
		
	} else if (/^#[-\w]+/.test(selector)) { //By ID
		selector = selector.replace(/^#/, '');
		res = getById(element, selector);

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
	var tempNodeList = [document.documentElement]; //根节点开始
	var currSelIndex = 0;

	// 值得注意的是对节点的递归调用并没有回溯过程，在递归的过程中找到答案，立即终止递归过程
	var res = (function(nodeList, selectorIndex) {
		for (var i = 0, len = nodeList.length; i < len && nodeList[i].children.length > 0; i++) {
			//如果有孩子节点才会进入循环，因为getBySelector也是只计算孩子的
			var tempList = getBySelector(nodeList[i], selectorArr[selectorIndex]);
			
			if (tempList == null || tempList.length < 1) { //如果没有找到匹配selectorIndex的子节点
				continue; //则继续循环
			}

			if (selectorIndex === selectorArr.length-1) { //已经匹配到最后一个选择器，且有结果
				return tempList[0]; //tempList不为null，第1个就是匹配成功的项
			}

			selectorIndex++;
			
			var ret = arguments.callee(tempList, selectorIndex); //递归调用本函数
			if (ret != null) { //如果接到任何结果返回，就立即返回
				return ret;
			}
		}

		return null; //循环结束都没有找到，那就是null了
	})(tempNodeList, currSelIndex); //立即执行函数

	// clog(res);
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
		if (event.keyCode === 13) { //enter键
			listener.call(element, event);
		}
	});
}

function delegateEvent(element, tag, eventName, listener) {
   addEvent(element, eventName, function(event) {
   		var e = event || window.event,
   			target = e.target || e.srcElement;
   		if (target.nodeName.toLowerCase() === tag) {
   			listener.call(target, e);
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
	return !window.opera && /MSIE ([^;]+)/.test(window.navigator.userAgent);
}

// 设置cookie
function setCookie(cookieName, cookieValue, expiredays) {
    var date = new Date(),
    	expires = date.getDate()+expiredays;
    date.setDate(expires);

    document.cookie = encodeURIComponent(cookieName) + '=' +
    				  encodeURIComponent(cookieValue) + 
    				  (expiredays == null ? '' : '; expires=' + date.toGMTString());		  
}

// 获取cookie值
function getCookie(cookieName) {
	cookieName = encodeURIComponent(cookieName) + '=';
	var cookieStart = document.cookie.indexOf(cookieName),
		cookieValue = null;

	if (cookieStart > -1) { //Found
		var cookieEnd = document.cookie.indexOf(';', cookieStart);
		if (cookieEnd == -1) { //not found
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
    		if (((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304) && options.onsuccess) {
    			options.onsuccess.call(null, xhr.responseText, xhr);
    		} else if (options.onfail) {
    			options.onfail.call(null, xhr);
    		}
    	}
    }

    var params = '';
    if (options.data) {
    	
    	if (typeof options.data === "string") {//split for encodeURIComponent
    		options.data = {};

    		params = options.data.split('&');
    		for (var i = 0, len = params.length; i < len; i++) {
    			var tmp = params[i].split('=');
    			options.data[tmp[0]] = tmp[1];
    		}
    	}

    	var plist = [];
    	for (var item in options.data) {
    		plist.push( encodeURIComponent(item) + '=' + 
    					encodeURIComponent(options.data[item]) );
    	}
    	params = plist.join('&');
    }

    if (!options.type) {
    	options.type = "GET";
    }
    options.type = options.type.toUpperCase();

    if (options.type === "GET") {
    	xhr.open("GET", url+'?'+params, true);
    	xhr.send(null);
    } else if (options.type === "POST") {
    	xhr.open("POST", url, true);
    	xhr.send(params);
    }
}