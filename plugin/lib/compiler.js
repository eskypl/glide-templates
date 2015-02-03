define(['plugin/syntax/main'], function (SyntaxFactory) {
	'use strict';

	var whitespace = /^\s*|\r|\n|\t|\s*$/g;
	var quotes = /"/g;
	var amp = /&amp;/g;

	var syntax = ['smarty', 'twig'];
	var styles = {
		tpl: 0,
		smarty: 0,
		twig: 1
	};

	function sanitize(_template) {
		if (typeof _template === 'string' && _template.length) {
			return _template.replace(whitespace, '').replace(quotes, '\\$&').replace(amp, '&');
		}
		return _template;
	}

	function optimize(_fnBody) {
		return _fnBody.replace(/_\+="";/g, '').replace(/=""\+/g, '=').replace(/\+"";/g, ';');
	}

	function parse(_template, _style) {

		var fn;
		var fnBody = sanitize(_template);
		var syntaxStyle = syntax[styles[_style]];
		var syntaxCompiler = new SyntaxFactory(syntaxStyle);
		var syntaxResolver = syntaxCompiler.tagResolvers;

		for (var i in syntaxResolver) {
			if (syntaxResolver.hasOwnProperty(i)) {
				fnBody = fnBody.replace(syntaxResolver[i][0], syntaxResolver[i][1]);
			}
		}

		fnBody = optimize('var _this=this,_="";_+="' + fnBody + '";return _;');

		try {
			/* jshint -W054 */
			fn = new Function('$tpl', fnBody);
			/* jshint +W054 */
			fn.deps = syntaxCompiler.getResolvedDependencies();

			return fn;

		} catch (_error) {

			if (_error instanceof SyntaxError) {
				_error.message += ' in "' + fnBody + '"';
			}

			throw 'Template compilation error: ' + _error.stack || _error.message;
		}

	}

	return parse;
});
