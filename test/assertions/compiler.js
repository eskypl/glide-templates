var chai = require('chai');
var utils = require('chai/lib/chai/utils');
var compile = require('../../dist/builder').compile;

chai.Assertion.addProperty('smarty', function () {
	'use strict';
	utils.flag(this, 'syntax', 'smarty');
});

chai.Assertion.addProperty('twig', function () {
	'use strict';
	utils.flag(this, 'syntax', 'twig');
});

chai.Assertion.addProperty('compileWithoutErrors', function () {
	'use strict';

	var fn;
	var error;
	var template = utils.flag(this, 'object');
	var syntax = utils.flag(this, 'syntax');

	try {
		fn = compile(template, syntax);
		utils.flag(this, 'fn', fn);
	} catch (_error) {
		error = (''+_error).split("\n")[0];
	}

	var result = !error && typeof fn === 'function';

	this.assert(
		result,
		'expected #{this} to be compiled to #{exp}, but error has been thrown: #{act}',
		'expected #{this} to not be compiled',
		'function', // expected #{exp}
		error || this._obj // actual #{act}
	);
});

chai.Assertion.addProperty('compileWithoutLeftOvers', function () {
	'use strict';

	var template = utils.flag(this, 'fn');
	var syntax = utils.flag(this, 'syntax');
	var fnbody = template.toString();
	var ENGINES = {
		smarty: /{\/?(if|else|foreach|include|assign)\s.+?}/ig,
		twig: /{(%\s*(if|else|include|assign)\s.+?%|{.+?})}/ig
	};

	this.assert(
		fnbody.match(ENGINES[syntax]) === null && fnbody.indexOf('undefined') === -1,
		'expected #{act} to not contain any template markup',
		'expected #{act} to contain template markup'
	);

});

