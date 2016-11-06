
initEvent();

function $(id) {
	return document.getElementById(id);
}

function renderResult(result) {
	$("result").innerHTML = result;
}

function addEventHandler() {
	var res = $("number1").value + $("number2").value;
	renderResult(res);
}

function initEvent() {
	$("addbtn").addEventListener("click", addEventHandler, false);
}