define([
	'plugin/syntax/smarty',
	'plugin/syntax/twig'
], function (Smarty, Twig) {
	'use strict';

	var registry = {
		smarty: Smarty,
		twig: Twig
	};

	var space = /\s+/;
	var jsonObjectSimplePattern = /^{(\s*[a-z][a-z0-9]*:\s*@?[\w\$\.\[\]\(\)]+\s*)(,\s*[a-z][a-z0-9]*:\s*@?[\w\$\.\[\]\(\)]+\s*)*}$/i;

	function variablesToJSON(_variables) {

		if (true === jsonObjectSimplePattern.test(_variables)) {
			return loopExpression(_variables);
		}

		var data = [];
		var vars = _variables.split(space);
		var pair;

		for (var i = 0, j = vars.length; i < j; i++) {
			pair = vars[i].split('=');
			if (pair[1].indexOf('@') === 0) {
				pair[1] = 'i.' + pair[1].substr(1);
			}
			else if (pair[1].indexOf('$') !== 0) {
				pair[1] = '"' + pair[1] + '"';
			}
			data.push('"' + pair[0] + '":' + pair[1]);
		}

		return '{' + data.join(',') + '}';
	}

	function loopExpression(_expression) {
		if (_expression) {
			return _expression.replace('@', 'i.');
		}
	}

	var tagReplacementTable = {
		conditional: function (_string, _expression) {
			return '";if(' + loopExpression(_expression) + '){_+="';
		},
		conditionalElse: '";}else{_+="',
		conditionalElseIf: function (_string, _expression) {
			return '";}else if(' + loopExpression(_expression) + '){_+="';
		},
		conditionalEnd: '";}_+="',
		loop: '";_this.e($1,function($2,i){_+="',
		loopEnd: '";});_+="',
		loopExpression: '"+i.$1+"',
		expression: '"+$1+"',
		include: function (_string, _templateName, _variables) {
			var data = '';
			if (_variables) {
				data = variablesToJSON(_variables);
			}

			// TODO: Template should be configurable: view! and .tpl should not be hardcoded.
			// // https://github.com/eskypl/glide-templates/issues/6
			this.deps.push('view!' + _templateName + '.tpl');
			return '"+_this.f(' + (this.deps.length - 1) + ',' + (data ? data : '$tpl') + ')+"';
		},
		translate: function (_string, _key, _variables) {
			var data = '';
			if (_variables) {
				data = ',' + variablesToJSON(_variables);
			}
			return '"+_this.t("' + _key + '"' + data + ')+"';
		},
		comment: '',
		debug: function (_string, _expression) {
			return '";console.log(' + loopExpression(_expression) + ');_+="';
		},
		assign: function (_string, _variableName, _expression) {
			return '";var ' + _variableName + '=' + loopExpression(_expression) + ';_+="';
		}
	};

	var syntaxHelpers = {
		/**
		 * Helper method to set new context to specified function. Context is set
		 * to object instance on which this method exists.
		 * @param fn {Function} Function which should work in different context
		 * @returns {*}
		 */
		giveContext: function (fn) {
			if (typeof fn !== 'function') {
				return fn;
			}

			var ctx = this;
			var Noop = function() {};
			var bind = function() {
				return fn.apply(fn instanceof Noop && ctx ? fn : ctx, Array.prototype.slice.call(arguments));
			};

			Noop.prototype = fn.prototype;
			bind.prototype = new Noop();

			return bind;
		}
	};

	// Extend prototype of each syntax engine with common helper methods.
	for (var syntaxName in registry) {
		for (var helperName in syntaxHelpers) {
			registry[syntaxName].prototype[helperName] = syntaxHelpers[helperName];
		}
	}

	return function SyntaxFactory(_syntaxName) {
		if (!_syntaxName) {
			throw 'Missing template syntax name';
		}

		var syntaxName = _syntaxName.toLowerCase();

		if (!registry[syntaxName]) {
			throw 'Unsupported templating syntax style';
		}

		return new registry[syntaxName](tagReplacementTable);
	};
});
