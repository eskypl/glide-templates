define(function () {
	'use strict';

	var doc = typeof document === 'object' ? document : false;
	var jsonPathSep = '.';
	var debugMode = doc && doc.cookie.indexOf('translationDebugMode=debug;') !== -1;
	var variableHolder = /{\$?(\w+)}|{{\$?(\w+)}}/g;
	var memory = {};
	var translations = typeof i18n === 'object' ? i18n : {};

	function deepExplore(_path, _data) {
		var key = _path.shift();
		if (_path.length && typeof _data[key] !== 'string') {
			return deepExplore(_path, _data[key]);
		} else {
			return _data[key];
		}
	}

	function explore(_key, _data) {
		var path;
		var res;

		// Check if translation is in memory
		if (memory[_key]) {
			return memory[_key];
		}

		// Otherwise check translation object
		path = _key.split(jsonPathSep);
		res = deepExplore(path, _data);
		// and save result to the memory if result is valid
		if (res) {
			memory[_key] = res;
		}
		return res;
	}

	return {
		translate: function (_key, _data) {

			var text = explore(_key, translations);

			if (!text || debugMode) {
				return '__{' + _key + '}__';
			}

			/**
			   * Use String.search as it seems to be the fastest way to check RegExp.
			   * On Chrome RegExp.test is faster but it brakes unit tests (for some
			   * reason function gives false results on PhantomJS - need to investigate).
			   * TODO: Investigate problem with RegExp.test in PhantomJS unit tests.
			   */
			if (_data && text.search(variableHolder)) {
				/**
				 * Replace callback will get 3 arguments depending on used placeholder.
				 * For old placeholders with indexes (ex.: {$1}) index will be returned.
				 * For twig compatible placeholders (ex.: {{currency}}) holder will be returned.
				 * @type {*|string|void}
				 */
				text = text.replace(variableHolder, function (_match, _index, _holder) {
					return _index ? _data[_index] || _match : _data[_holder] || _match;
				});
			}

			return text;
		}
	};
});
