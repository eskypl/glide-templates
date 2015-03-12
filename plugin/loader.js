/**
 * This loader should be used in browser env (development).
 * It returns compiled templates.
 */
define(['plugin/lib/compiler', 'plugin/lib/templates'], function (compile, Template) {
	'use strict';

	function extension(filePath) {
		var ext = filePath.match(/\.(\w+)$/i);
		if (ext && ext.length) {
			return ext[1].toLowerCase();
		}
		return ext;
	}

	function load(_moduleName, _text, _req, _onLoad) {
		var templateFn = compile({
			name: _moduleName,
			template: _text,
			syntax: extension(_moduleName)
		});
		templateFn.includes = [];
		if (templateFn.deps && !!templateFn.deps.length) {
			_req(templateFn.deps, function () {
				for (var i = 0, j = templateFn.deps.length; i < j; i++) {
					templateFn.includes.push(arguments[i]);
				}
				_onLoad(new Template(templateFn, _moduleName));
			});
		}
		else {
			_onLoad(new Template(templateFn, _moduleName));
		}
	}

	return {
		version: '1.0.0',
		translate: Template.translator.translate,
		load: function (_moduleName, _req, _onLoad) {
			var xhr = new XMLHttpRequest();
			xhr.open('GET', _req.toUrl(_moduleName), true);
			xhr.onreadystatechange = function () {
				if (xhr.readyState === 4) {
					var status = xhr.status || 0;
					if (status > 399 && status < 600) {
						return _onLoad.error(new Error(_moduleName + ' HTTP status: ' + status));
					}
					try {
						load(_moduleName, xhr.responseText, _req, _onLoad);
					}
					catch (_error) {
						_onLoad.error(_error);
					}
				}
			};
			xhr.send(null);
		}
	};
});
