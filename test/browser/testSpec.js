/* global insert */
/* jshint -W024, -W030 */
describe('AMD loader plugin', function () {
	'use strict';

	describe('when requesting template', function () {

		var tpl;
		var inc;
		var deep;
		var data;

		beforeEach(function (_done) {
			require([
				'view!test/examples/table.tpl',
				'view!test/examples/include.tpl',
				'view!test/examples/deep-include.tpl',
				'test/fixtures/colors'
			], function () {
				tpl = arguments[0];
				inc = arguments[1];
				deep = arguments[2];
				data = arguments[3];

				_done();
			});
		});

		it('should load compiled template function', function () {
			expect(tpl).to.be.a('function');
		});

		it('should succesfuly render loaded template function when called with data', function (_done) {
			tpl(data, function (_error, _result) {
				expect(_error).to.be.null;
				expect(_result).to.be.a('string');

				insert.call(tpl, _result, data);
				_done();
			});
		});

		it('should succesfuly render loaded template function when called with data (summary)', function (_done) {
			tpl(data.extendWith({showTable: 'summary'}), function (_error, _result) {
				expect(_error).to.be.null;
				expect(_result).to.be.a('string');

				insert.call(tpl, _result, data);
				_done();
			});
		});

		it('should succesfuly render loaded template function when called with data (full)', function (_done) {
			tpl(data.extendWith({showTable: 'full'}), function (_error, _result) {
				expect(_error).to.be.null;
				expect(_result).to.be.a('string');

				insert.call(tpl, _result, data);
				_done();
			});
		});

		it('should fail when rendering deeply included templates', function (_done) {
			deep(data, function (_error, _result) {
				expect(_error).to.be.an.instanceof(Error);
				expect(_result).to.be.undefined;
				_done();
			});
		});



	});
});
