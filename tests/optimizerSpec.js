/* jshint -W024, -W030 */
define([
	'view!tests/fixtures/table',
	'view!tests/fixtures/deep-include',
	'tests/fixtures/colors'
], function (tpl, deep, data) {
	'use strict';

	describe('AMD optimizer plugin', function () {

		describe('when requesting template', function () {

			it('should load compiled template function', function () {
				expect(tpl).to.be.a('function');
			});

			it('should succesfuly render loaded template function when called with data', function (_done) {
				tpl(data, function (_error, _result) {
					expect(_error).to.be.null;
					expect(_result).to.be.a('string');
					_done();
				});
			});

			it('should succesfuly render loaded template function when called with data (summary)', function (_done) {
				tpl(data.extendWith({showTable: 'summary'}), function (_error, _result) {
					expect(_error).to.be.null;
					expect(_result).to.be.a('string');
					_done();
				});
			});

			it('should succesfuly render loaded template function when called with data (full)', function (_done) {
				tpl(data.extendWith({showTable: 'full'}), function (_error, _result) {
					expect(_error).to.be.null;
					expect(_result).to.be.a('string');
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
});
