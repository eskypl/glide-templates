/* jshint mocha: true, -W030 */

var assertions = require('../assertions/compiler');
var fixtures = require('../fixtures/compiler');
var chai = require('chai');
var expect = chai.expect;

describe('Template compiler', function () {
	'use strict';

	describe('when Smarty style has been used', function () {
		describe('with invalid template', function () {
			fixtures.smarty.invalid.forEach(function (template) {
				it(template + ' should thrown a compile error', function () {
					expect(template).smarty.to.not.compileWithoutErrors;
				});
			});
		});
		describe('with valid template', function () {
			fixtures.smarty.valid.forEach(function (template) {
				it(template + ' should compile without errors and any template markup leftovers', function () {
					expect(template).smarty.to.compileWithoutErrors.and.compileWithoutLeftOvers;
				});
			});
		});
	});

	describe('when Twig style has been used', function () {
		describe('with invalid template', function () {
			fixtures.twig.invalid.forEach(function (template) {
				it(template + ' should thrown a compile error', function () {
					expect(template).twig.to.not.compileWithoutErrors;
				});
			});
		});
		describe('with valid template', function () {
			fixtures.twig.valid.forEach(function (template) {
				it(template + ' should compile without errors and any template markup leftovers', function () {
					expect(template).twig.to.compileWithoutErrors.and.compileWithoutLeftOvers;
				});
			});
		});
	});

});
