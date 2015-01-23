mocha.setup('bdd');

Object.prototype.extendWith =  function (object) {
	for (var i in object) {
		this[i] = object[i];
	}
	return this;
};


var expect = chai.expect;
var debugDiv = document.getElementById('debug');
var i18n = {
	test: {
		Showing_table_type: 'Table type: {{type}} {$2}.',
		Showing_table_type_old: 'Table type: {$1} {$2}.',
		Showing_table_type_old_ext: 'Table type: {1} {2}.',
		Showing_table_type_new: 'Table type: {{type}} {{info}}.',
		Showing_table_type_new_ext: 'Table type: {{$type}} {{$info}}.'
	}
}

function insert(text, data) {
	if (debugDiv) {
		var div = document.createElement('div');
		div.innerHTML = '<b class="module">' + this.moduleName + '</b> ' + text + '<pre>' + JSON.stringify(data, null, 2) +  '</pre>';
		debugDiv.appendChild(div);
	}
}

function error(e) {
	insert('<i style="color: red;">' + e.message + '</i>');
	return '';
}

