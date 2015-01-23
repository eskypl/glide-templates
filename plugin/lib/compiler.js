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

	function optimize(_fnbody) {
		return _fnbody.replace(/_\+="";/g, '').replace(/=""\+/g, '=').replace(/\+"";/g, ';');
	}

	function parse(_template, _style) {

		var fn;
		var fnbody = sanitize(_template);
		var syntaxStyle = syntax[styles[_style]];
		var syntaxCompiler = new SyntaxFactory(syntaxStyle);
		var syntaxResolver = syntaxCompiler.tagResolvers;

		for (var i in syntaxResolver) {
			fnbody = fnbody.replace(syntaxResolver[i][0], syntaxResolver[i][1]);
		}

		fnbody = optimize('var _this=this,_="";_+="' + fnbody + '";return _;');

		try {
			/* jshint -W054 */
			fn = new Function('$tpl', fnbody);
			/* jshint +W054 */
			fn.deps = syntaxCompiler.getResolvedDependencies();

			return fn;

		} catch (_error) {

			if (_error instanceof SyntaxError) {
				_error.message += ' in "' + fnbody + '"';
			}

			throw 'Template compilation error: ' + _error.stack || _error.message;
		}

	}

	return parse;
});
