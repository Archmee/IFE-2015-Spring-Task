window.onload = init;

function init() {
	var btn = document.getElementById('gotit'),
		timeText = document.getElementById('ttgo'),
		showTitle = document.getElementById('show-title'),
		showTime = document.getElementById('show-time'),
		timer = null;

	addEvent(btn, 'click', function() {
		var timeValue = timeText.value;
		if (!/\d{4}-\d{2}-\d{2}/.test(timeValue)) {//格式不符
			return false;
		}
		
		var timeArr = timeValue.split('-'),
			now = (new Date()).getTime(),
			inputDate = (new Date(timeArr.join('/'))).getTime(),
			diff = parseInt((inputDate - now)/1000); //ms to s
		
		showTitle.innerHTML = '距离'+timeArr[0]+'年'+timeArr[1]+'天'+timeArr[2]+'日还有：';
		showDiffTime(showTime, diff);
	});
}

function showDiffTime(element, diff) {
	var tmp = diff, d, h, m, s;
	var begin = Date.now(); //用于计算定时器的误差：开始

	if (diff <= 0) {
		return false;
	}
	
	clearTimeout(element.timer);
	
	// 计算日时分秒
	d 	= parseInt(tmp/(60*60*24));
	tmp = tmp%(60*60*24);
	h 	= parseInt(tmp/(60*60));
	tmp = tmp % (60*60);
	m 	= parseInt(tmp / 60);
	s 	= parseInt(tmp % 60);

	element.innerHTML = d+'天'+h+'小时'+m+'分'+s+'秒';
	
	element.timer = setTimeout(function() {
		// 用于计算定时器的误差：结束
		// 只需要用diff减去 定时器开始到定时器结束的时间间隔的值就ok了，不用diff-1，这样还计算了误差在内
		diff -= (Date.now() - begin)/1000;
		showDiffTime(element, diff);
	}, 1000);
}