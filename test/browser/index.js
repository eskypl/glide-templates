define([
	'view!test/examples/table.tpl',
	'test/fixtures/colors'
], function (tableTpl, data) {

	var out = document.getElementById('output');

	function insert(text) {
		if (out) {
			var div = document.createElement('div');
			div.innerHTML = '<b>[' + this.moduleName + ']</b> ' + text;
			out.appendChild(div);
		}
	}

	function error(e) {
		insert('<i style="color:red;">' + e.message + '</i>');
		return '';
	}

	tableTpl(data, insert, error);

	return [insert, output];
});
