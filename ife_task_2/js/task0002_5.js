window.onload = init;

function init() {
	var dragging = null,
		diffX = diffY = 0,
		_isIE = isIE();

		addEvent(document, 'mousedown', function(e) { //代理事件
			e = e || window.event;
			var target = e.target || e.srcElement;
			if (target.nodeName !== 'LI') { return ; } //也可以用className来区分是否是目标
			
			dragging = target; //注意：这一个初始化目标很重要，在其他事件里也要使用
			var pos = getPosition(dragging); //计算dragging元素距离视口左上角的距离
			diffX = e.clientX - pos.x; //dragging.offsetLeft在 IE下不好使
			diffY = e.clientY - pos.y; //dragging.offsetTop也是

			// 注意，设置id只能放在求出diffX和diffY的下面，否则改了id后的绝对位置信息导致拖动出现问题
			dragging.id = 'dragging';
			// 下面是马上初始化绝对定位后的位置，不要等到在移动鼠标事件中才来操作
			// 否则会导致如果鼠标按下不拖动，那么元素在添加了id属性后，会跳到上次移动释放鼠标的位置
			// 因为如果观察dom element会发现，通过style属性更改是作为内联样式的，并且不会自动清除
			dragging.style.left = (e.clientX - diffX) + 'px';
			dragging.style.top  = (e.clientY - diffY) + 'px';

			// 鼠标已经按下，现在添加移动和释放的代理事件
			addEvent(document, 'mousemove', mousemoveHandler);
			addEvent(document, 'mouseup', mouseupHandler);

			// 阻止默认事件，取消默认拖动时选中文字
			// Chrome 只需要在mousemove事件里阻止就行了
			// Firefox 需要在mosedown和mousemove事件里都阻止
			// IE 则需要在mousedown里setCapture和mouseup时releaseCapture
			preventDefault(e); // Firefox 阻止文字选中
			if (_isIE > 0) { // IE 阻止文字选中
				dragging.style.cursor = 'move'; // 不知道IE为什么直接添加id时没有cursor样式
				dragging.setCapture(); // 将交掉都设置在dragging对象上，释放鼠标时也需要释放这个
			}
			
			
		});

		// 移动鼠标的事件代理处理函数
		var mousemoveHandler = function(e) {
			 // dragging为空 说明虽然鼠标在move但是还没发生点击，所以不处理
			if (!dragging) { return ; }
			
			e = e || window.event;
			var left = e.clientX - diffX,
				top  = e.clientY - diffY;

			// 防止拖出边界
			if (left < 0) {
				left = 0;
			} else if (left > document.documentElement.clientWidth - dragging.offsetWidth) {
				left = document.documentElement.clientWidth - dragging.offsetWidth;
			}
			if (top < 0) {
				top = 0;
			} else if (top > document.documentElement.clientHeight - dragging.offsetHeight) {
				top = document.documentElement.clientHeight - dragging.offsetHeight;
			}

			// 计算好安全的绝对位置
			dragging.style.left = left + 'px';
			dragging.style.top  = top + 'px';

			// Chrome只需要这个就能阻止文字选中
			preventDefault(e);
		};

		// 释放鼠标的事件代理处理函数
		var mouseupHandler = function(e) {
			if (!dragging) { return ; }
			
			e = e || window.event;
			whereToPlace(dragging, {x: e.clientX, y: e.clientY }); // 通过释放鼠标时的坐标找位置

			// IE鼠标释放时，也需要释放聚焦
			if(_isIE > 0) {
				dragging.style.cursor = 'default'; // for IEEEEEEEEEEE
				dragging.releaseCapture();
			}

			// 清空拖动元素id和拖动元素
			dragging.id = '';
			dragging = null;

			// 鼠标已经释放，移除事件
			removeEvent(document, 'mousemove', mousemoveHandler);
			removeEvent(document, 'mouseup', mouseupHandler);
		};
}

// 通过计算拖动元素到列表元素的距离来放置目标，反正放置规则自定
function whereToPlace(target, loc) {
	var oUl = document.getElementsByTagName('ul');

	for (var i = 0; i < oUl.length; i++) {
		// 如果target的位置在某个ul的宽高之内
		if ((loc.x > oUl[i].offsetLeft && loc.x < oUl[i].offsetLeft+oUl[i].offsetWidth) && 
			(loc.y > oUl[i].offsetTop  && loc.y < oUl[i].offsetTop+oUl[i].offsetHeight)) {
			// 如果在当前ul里面，则需要计算在哪个li的上下
			var child = oUl[i].children;
			for (var j = 0; j < child.length; j++) {
				if (loc.y < child[j].offsetTop) { //找到可以放置li的位置，插入并退出
					oUl[i].insertBefore(target, child[j]); 
					return ;
				}
			}

			oUl[i].appendChild(target); //没有放到li之间的位置，直接添加到列表末尾
		}//if
	}//for
}