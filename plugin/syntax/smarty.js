define(function () {
	'use strict';

	function Smarty(_tagReplacementTable) {
		this.tagResolvers = {};
		this.deps = [];

		for (var i in this.tagDefinisions) {
			this.tagResolvers[i] = this.compileTag(i, _tagReplacementTable[i]);
		}
	}

	Smarty.prototype = {

		compileTag: function(_tagType, _tagReplacement) {
			return [
				new RegExp('{' + this.tagDefinisions[_tagType] + '}', 'g'),
				this.giveContext(_tagReplacement)
			];
		},

		getResolvedDependencies: function () {
			return this.deps || [];
		},

		tagDefinisions: {
			conditional: 'if\\s+(.+?)',
			conditionalElse: 'else',
			conditionalElseIf: 'else\\s+(.+?)',
			conditionalEnd: '\\/if',
			loop: 'foreach\\s+(.+?)\\s+as\\s+(\\$\\w+)',
			loopEnd: '\\/foreach',
			loopExpression: '@([a-z]+)',
			expression: '(\\$.+?)',
			include: 'include\\s+template=(.+?)\\s*(\\s*[a-z]+[a-z0-9]*=.+?)?',
			translate: 'i18n\\s+key=(.+?)\\s*(\\s*[a-zA-Z0-9]+=.+?)?',
			comment: '\\*\\s+.+?\\s+\\*',
			debug: 'debug\\s+var=(\\$.+?)',
			assign: 'assign\\s+var=(\\$\\w+)\\s+value=(.+?)'
		}

	};

	return Smarty;
});
