var $ = {}; //保存全局变量
window.onload = init;

// 初始化，添加事件处理函数
function init() {
	// TODO1：数据目前只是简单的模拟一下，可以考虑用json文件或ajax来做实时搜索（ajax要加锁）
	// TODO2：缓存结果
	$.data = ['jason', 'e', 'jack', 'eric', 'ai', 'UI', 'UE',  'ae', 'UX'];
	$.searchText = document.getElementById('search');
	$.searchList = document.getElementById('search-result');
	$.matchArr = [];
	$.index = -1;
	
	$.searchText.value = $.searchText.value; // 解决IE总是不清空文本框的行为，刷新页面后就focus到最后面
	$.searchText.focus();

	// ================== 输入相关 ====================

	// 其他浏览器监听input事件，ie监听propertychange事件
	// 但经过测试，不用侦听oncut和onpaste事件也能很好的工作
	// 唯一麻烦的是IE9的删除键不会触发下面2个事件，所以需要我们单独处理
	addEvent($.searchText, 'input', handleSearchInput); // >= ie9
	addEvent($.searchText, 'propertychange', handleSearchInput) // IE 8、7;

	// for ie=9：ie9在按删除键的时候不触发input或propertychange事件，没法及时更新数据
	// 注意：chrome会先触发keydown事件，再触发input事件，所以在keydown中取消默认行为即可
	// 		 IE7、8会先触发propertychange事件，再触发keydown事件，所以keydown中取消默认行为不管用
	// 		 IE 9 不用取消默认事件，它不会触发input或propertychange事件
	// 解决办法，回到原点，重点是这是IE9独有的问题，所以可以通过判断浏览器版本再监听事件
	var ieVer = parseFloat(isIE());
	if (ieVer >= 9 && ieVer < 10) {
		addEvent($.searchText, 'keydown', function(e) {
			e = e || window.event;
			var code = e.keyCode || e.which;
			if (code === 8) { // 处理ie9删除键不触发input事件
				preventDefault(e); // 阻止删除键默认事件再触发input或者propertychange事件(其实不会了)
				cancelBubble(e); //不允许冒泡到document上

				$.searchText.value = $.searchText.value.slice(0, -1); //不能删除只能手动删除一个字符了
				handleSearchInput(e);
			}
		});
	}
	
	// 当文本框有焦点的时候，有两种情况：
	// 1. 文本框为空，我们不需要处理任何东西
	// 2. 文本框不为空，说明曾经失去过焦点
	//    2.1 如果列表不为空，就可以直接显示出来（这一条有个问题，已废弃处理。原因是如果输入了ja，但是我用鼠标点击选中了匹配ja的所有项中的jac项然后隐藏了列表，那么下次focus的时候会将之前匹配ja的列表全部显示出来，而不是现在文本框中的jac，并且匹配了ja的项还带有样式，这样就和当前文本框中的并不算匹配项）
	// 	  2.2 如果列表为空，有可能就是像IE等浏览器刷新后文本框的值还在，但是ul已初始化为空
	addEvent($.searchText, 'focus', function(e) {
		if ($.searchText.value != '') {
			handleSearchInput(e);
		}
	});
	
	// ================== 选择相关 ==================

	// 处理当鼠标在li搜索结果列表上悬停时，要清除其他li的样式，激活当前li的样式
	addEvent($.searchList, 'mouseover', function(e) {
		e = e || window.event;
		var target = e.target || e.srcElement;

		if (target.nodeName === 'LI') {
			// 把上一个index的类清除，把更新后的index类激活
			toggleLiClass($.index, $.index = +target.id.slice(3)); // 更新index去掉id前缀'id-'
		}
	});

	// 处理选择列表项时的反应，注意这个click事件会冒泡到document上，我们利用这一点隐藏了列表
	addEvent($.searchList, 'click', sure);

	addEvent(document, 'keydown', function(e) {
		e = e || window.event;
		var code = e.keyCode || e.which;
		if (code !== 13 && code !== 38 && code !== 40) { //回车、上键、下键
			return ;
		}
		
		if ($.index < 0) {
			return ;
		}

		// 在下面我们希望
		// 回车键：确定选项，显示到文本框，隐藏列表
		// 上下键：选择选项，可以循环滚动，而且在文本框距离上次输入没有改变的情况下可以引导出原结果列表
		switch(code) {
			case 13: 
					sure();
					return;
			case 38: 
					var lastIndex = $.index--;
					if ($.index < 0) { $.index = $.searchList.children.length-1; }
					break;
			case 40:
					var lastIndex = $.index++;
					if ($.index > $.searchList.children.length-1) { $.index = 0; }
					break;
		} //switch
		toggleLiClass(lastIndex, $.index);
	});

	addEvent(document, 'click', function(e) {
		e = e || window.event;
		var target = e.target || e.srcElement;
		if (target != $.searchText) { //这里处理，如果点击的不是文本框，就可以隐藏列表
			hiddenSearchList();	
		}
	});
}

function handleSearchInput(e) {
	// 每次处理的时候要设置一些默认值
	$.index = -1;
	$.searchList.innerHTML = '';
	hiddenSearchList();

	if ($.searchText.value == '') { //每次按键检测是否为空或者删除完了
		return ;
	}

	var resList = '',
		re = new RegExp('^'+RegExpEscape(trim($.searchText.value)), 'i'),
		match = 0;

	// 寻找匹配项
	for (var i = 0, len = $.data.length; i < len; i++) {
		if (re.test($.data[i])) {
			// 这里做的是每次让列表中第1个元素默认处于高亮
			if (match === 0) {
				$.index = 0;
				resList += '<li class="active" id=id-'+ match +'>';
			} else {
				resList += '<li id=id-'+ match +'>';
			}
			
			// 将结果列表缓存起来，match++也发挥了自己的作用
			$.matchArr[match++] = $.data[i];
			//将匹配到的字符串加上b标签，用于应用高亮等样式，并连接列表项
			resList += RegExp["$`"] + '<b>' + RegExp["$&"] + '</b>' + RegExp["$'"] + '</li>';
		}
	}

	//本来高级浏览器不用判断的，因为如果resList为空的话，ul也不会有高度，但ie7有一个高度，所以强制检查结果列表长度是否为空（match == matchArr.length）
	if (match > 0) {
		$.searchList.innerHTML = resList;
		displaySearchList();
	}
}

// 确认选中项的操作
function sure() {
	$.searchText.value = $.matchArr[$.index];
	$.index = -1;
	hiddenSearchList();
}

function displaySearchList() {
	$.searchList.style.display = 'block';
}
function hiddenSearchList() {
	$.searchList.style.display = 'none';
}

// 同时设置更新index前后的类名
// 清除上一个index指向的li的类名
// 激活当前index的li类名
function toggleLiClass(lastIndex, currentIndex) {
	$.searchList.children[lastIndex].className = '';
	$.searchList.children[currentIndex].className = 'active';
}

// 阻止默认事件
function preventDefault(e) {
	if (e.preventDefault) {
		e.preventDefault();
	} else {
		e.returnValue = false;
	}
}

// 取消冒泡
function cancelBubble(e) {
	if (e.stopPropagation) {
		e.stopPropagation();
	} else {
		e.cancelBubble = true;
	}
}

// http://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript
function RegExpEscape(s) {
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};