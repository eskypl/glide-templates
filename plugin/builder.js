/**
 * Optimizer is used by loader to generate optimized templates.
 * It has one dependency which is not used by optimizer by it is
 * needed here to be included in the final build file.
 */
define(['plugin/lib/compiler'], function (compile) {
	'use strict';

	var buildMap = {};
	var matchModuleName = /^\w+!(.+?)\.\w+$/i;

	function extension(filePath) {
		var ext = filePath.match(/\.(\w+)$/i);
		if (ext && ext.length) {
			return ext[1].toLowerCase();
		}
		return ext;
	}

	function normalizeModuleName(_pluginName) {
		return function(moduleName) {
			var res = matchModuleName.exec(moduleName);
			return _pluginName + '!' + (res ? res[1] : moduleName);
		};
	}

	function moduleNameToCamelCase(_moduleName) {
		return _moduleName.replace(/[^a-z]./ig, function(match){
			return String(match).substr(1).toUpperCase();
		});
	}

	return {
		version: '1.0.0',
		compile: compile,
		load: function (_name, _req, _onLoad) {
			var fs = require.nodeRequire('fs');
			var file;

			try {
				file = fs.readFileSync(_req.toUrl(_name), 'utf8');
				//Remove BOM (Byte Mark Order) from utf8 files if it is there.
				if (file.indexOf('\uFEFF') === 0) {
					file = file.substring(1);
				}
			} catch (_error) {
				_onLoad.error(_error);
			}

			//var compile = require.nodeRequire(_req.toUrl('plugin/lib/compiler'));
			var fn = compile(file, extension(_name));

			buildMap[_name] = fn;

			if (!!fn.deps.length) {
				_req(fn.deps);
			}

			_onLoad();
		},
		write: function(_pluginName, _moduleName, _write) {
			var fn = buildMap[_moduleName];
			var normalizedName = _moduleName.replace(/\.\w+$/i, '');
			var functionName = moduleNameToCamelCase(_moduleName);

			var fnBody = fn.toString().replace('function anonymous','function ' + functionName);
			var fnDependencies = '';
			var fnIncludes = '';
			var normalizer;

			if (!!fn.deps.length) {
				normalizer = normalizeModuleName(_pluginName);
				fnDependencies = '["' + fn.deps.map(normalizer).join('","') + '"],';
				fnIncludes = functionName + '.includes=arguments;';
			}

			_write.asModule(normalizedName, 'define(' + fnDependencies + 'function(){' + fnBody + ';' + fnIncludes  + 'return ' + functionName + ';});');
		}
	};
});
