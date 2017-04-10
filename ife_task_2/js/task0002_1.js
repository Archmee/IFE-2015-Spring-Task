window.onload = function() {
	var oBtn = document.getElementById('got');
	var text = document.getElementById('lover');
	var warning = document.getElementById('warning');

	addEvent(oBtn, 'click', function(event) {
		var e = event || window.event;

		var textArr = text.value.split(/[\n 　,，、;；]/);
		var outArr = [];
		for (var i = 0, len = textArr.length; i < len; i++) {
			var tmp = trim(textArr[i]);
			if (tmp != '' && outArr.indexOf(tmp) == -1) {//不为空且不重复
				outArr.push(tmp);
			}
		}

		try { //检查输入长度
			if (outArr.length < 1 || outArr.length > 10) {
				throw new Error('输入兴趣不能为0个也不能超过10个');
			}
			warning.innerHTML = '';
		} catch(e) {
			warning.innerHTML = e.message;
			return false;
		}			

		var output = document.getElementById('fieldset');
		if (output == null) {
			output = createField('个人兴趣爱好展示');
			document.body.appendChild(output);
		}
		
		// 清空已存在的
		var tmp = output.children[0]; //保留标题
		output.innerHTML = ''; //清空
		output.appendChild(tmp); //恢复标题
		tmp = null;

		output.appendChild(createChecklist(outArr));

		// text.value = '';
	});//event
}

function createField(title) {
	var fieldset = document.createElement('fieldset');
	fieldset.id = 'fieldset';
	
	var legend = document.createElement('legend');
	legend.innerHTML = title;

	fieldset.appendChild(legend);

	return fieldset;
}

function createChecklist(outArr) {
	var fragment = document.createDocumentFragment();

	for (var i = 0, len = outArr.length; i < len; i++) {
		var checkbox = document.createElement('input');
		checkbox.type = 'checkbox';
		checkbox.id = 'id-'+i;
		checkbox.checked = 'true';

		var label = document.createElement('label');
		label.htmlFor = 'id-'+i;
		label.innerHTML = outArr[i];

		fragment.appendChild(checkbox);
		fragment.appendChild(label);
		fragment.appendChild(document.createElement('br'));
	}

	return fragment;
}