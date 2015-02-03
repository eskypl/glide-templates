define(function () {
	'use strict';

	function Twig(_tagReplacementTable) {
		this.tagResolvers = [];
		this.deps = [];

		for (var i in this.tagDefinitions) {
			this.tagResolvers[i] = this.compileTag(i, _tagReplacementTable[i]);
		}
	}

	Twig.prototype = {

		compileTag: function (_tagType, _tagReplacement) {
			var regexp;
			var expression = this.tagDefinitions[_tagType];
			var search = expression;
			var replace = _tagReplacement;

			if (expression instanceof Array) {
				search = expression[0];
				replace = expression[1];
			}

			if (_tagType === 'expression' || _tagType === 'loopExpression') {
				regexp = '{{\\s*' + search + '\\s*}}';
			}
			else if (_tagType === 'comment') {
				regexp = '{#\\s*' + search + '\\s*#}';
			}
			else {
				regexp = '{%\\s*' + search + '\\s*%}';
			}

			return [
				new RegExp(regexp, 'g'),
				this.giveContext(replace)
			];
		},

		getResolvedDependencies: function () {
			return this.deps || [];
		},

		tagDefinitions: {
			conditional: 'if\\s+(.+?)',
			conditionalElse: 'else',
			conditionalElseIf: 'else\\s+(.+?)',
			conditionalEnd: 'endif',
			loop: ['for\\s+(\\$\\w+)\\s+in\\s+(.+?)', '";_this.e($2,function($1,i){_+="'],
			loopEnd: 'endfor',
			loopExpression: '@([a-z]+)',
			expression: '(\\$.+?)',
			include: 'include\\s+\'(.+?)\'(?:\\s+with\\s+(.+?))?',
			translate: 'i18n\\s+\'(.+?)\'(?:\\s+with\\s+(.+?))?',
			comment: '\\s+.+?\\s+',
			debug: 'debug\\s+(\\$.+?)',
			assign: 'set\\s+(\\$\\w+)\\=(.+?)'
		}

	};

	return Twig;
});
