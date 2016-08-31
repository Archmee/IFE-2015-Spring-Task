window.onload = function () {
	var oImgList = document.getElementById('img-list');
	var oLi = oImgList.getElementsByTagName('li');
	var currentLi=0;
	var timer;
	var delayop;
	var delaynext;

	oLi[0].childNodes[0].style.display = 'block';
	delaynext = setTimeout(moveNext, 3000);

	var oDiv = document.getElementById('scroller');
	var newList = document.createElement('ul');
	newList.id = 'point-list';
	oDiv.appendChild(newList);
	for (var i = 0; i < oLi.length; i++) {
		var newLi = document.createElement('li');
		var newA = document.createElement('a');
		newA.href = 'javascript:';
		// newA.onmouseover = new function() {
		// 	var tmp=i;
		// 	return function() {
		// 		// console.log(currentLi+','+tmp);
		// 		// 如果只是hover的话，不影响正在轮播的图片位置
		// 		moveTo(currentLi, tmp);
		// 	}
		// }
		// newA.onmouseout = function() {
		// 	this.className = '';
		// }
		newA.onclick = new function() {
			var tmp=i;
			return function() {
				// 如果是点击操作的话，还是要紧接着变化currentLi，它已经变成点击的那个点的位置
				moveTo(currentLi, currentLi=tmp); 
			}
		}
		newLi.appendChild(newA);
		newList.appendChild(newLi);
	}
	newList.childNodes[currentLi].childNodes[0].className = 'active';

	var lastOne = document.getElementById('last');
	var nextOne = document.getElementById('next');

	lastOne.onclick = function() {
		// clearInterval(timer);
		clearTimeout(delayop);
		delayop = setTimeout(moveLast, 250);
	}
	nextOne.onclick = function() {
		// clearInterval(timer);
		clearTimeout(delayop);
		delayop = setTimeout(moveNext, 250);
	}

	//--------公共函数-----------

	// 移动到上一张
	function moveLast() {
		var toLi = (currentLi-1) < 0 ? oLi.length+currentLi-1 : currentLi-1;
		moveTo(currentLi,  currentLi = toLi);
	}
	// 移动到下一张
	function moveNext() {
		var toLi = (currentLi+1)%oLi.length;
		moveTo(currentLi,  currentLi = toLi);
	}
	// 移动当前位置到下一个位置，也就是切换图片
	function moveTo(curPos, toPos) {
		if (curPos == toPos) { 
			return; 
		}
		clearTimeout(delaynext);
		delaynext = setTimeout(moveNext, 3000);

		// 消失的图片
		newList.childNodes[curPos].childNodes[0].className = '';
		oLi[curPos].childNodes[0].style.display = 'none';
		// 下一张该显示的图片
		newList.childNodes[toPos].childNodes[0].className = 'active';
		oLi[toPos].childNodes[0].style.display = 'block';

		fadein(oLi[toPos].childNodes[0]);
	}

	// 图片淡入效果
	function fadein(obj) {
		clearInterval(timer);
		obj.style.opacity = 0.4;
		timer = setInterval(function(){
			if (obj.style.opacity < 1) {
				obj.style.opacity = obj.style.opacity/1.0+0.1;
			} else {
				clearInterval(timer);
				return;
			}
		}, 60);
		
	}
	// 图片淡出效果，考虑到时间影响太久，就注释掉了，而且感觉如果同时设置淡入淡出，多个setInterval会相互影响
	// function fadeout(obj) {
	// 	obj.style.opacity = 1;
	// 	timer = setInterval(function(){
			
	// 		if (obj.style.opacity > 0.5) {
	// 			obj.style.opacity -= 0.1;
	// 		} else {
	// 			obj.style.display = 'none';
	// 			clearInterval(timer);
	// 			return;
	// 		}
	// 	}, 50);
		
	// }
}