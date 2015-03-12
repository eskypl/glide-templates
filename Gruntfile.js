var fs = require('fs');
var amdclean = require('amdclean');

var customLaunchers = {
	'SL_Chrome_win7': {
		base: 'SauceLabs',
		browserName: 'chrome',
		platform: 'windows 7'
	},
	'SL_Firefox_win7': {
		base: 'SauceLabs',
		browserName: 'firefox',
		platform: 'windows 7'
	},
	// TODO: Chai.js is only IE9+. Switch to expect.js?
	//'SL_IE_8_win7': {
	//	base: 'SauceLabs',
	//	browserName: 'internet explorer',
	//	version: '8'
	//}
	'SL_IE_9_win7': {
		base: 'SauceLabs',
		browserName: 'internet explorer',
		version: '9'
	},
	'SL_IE_10_win7': {
		base: 'SauceLabs',
		browserName: 'internet explorer',
		version: '10'
	},
	'SL_IE_11_win7': {
		base: 'SauceLabs',
		browserName: 'internet explorer',
		version: '11'
	}
};

var karmaConfig = {
	options: {
		configFile: 'karma.conf.js'
	},
	test: {
		reporters: ['mocha']
	},
	coverage: {
		preprocessors: {
			'plugin/**/*.js': ['coverage']
		},
		reporters: ['coverage'],
		coverageReporter: {
			type: 'lcov',
			dir: 'coverage'
		}
	}
};

var SAUCE_CONCURRENCY_LIMIT = 3;
var customLaunchersIds = Object.keys(customLaunchers);
var sauceLabsSets = [];
var sauceLabsKarmaTargets = [];
var env = process.env;

while(customLaunchersIds.length) {
	sauceLabsSets.push(customLaunchersIds.splice(0, SAUCE_CONCURRENCY_LIMIT).reduce(function(acc, key){
		acc[key] = customLaunchers[key];
		return acc;
	}, {}));
}

if (env.TRAVIS && env.TRAVIS_PULL_REQUEST === 'false') {

	sauceLabsSets.forEach(function (launchersSet, i) {
		var setKey = 'sauceLabsSet' + i;

		sauceLabsKarmaTargets.push('karma:' + setKey);
		karmaConfig[setKey] = {
			reporters: ['saucelabs'],
			sauceLabs: {
				testName: 'glide-templates',
				startConnect: false,
				recordScreenshots: false
				//connectOptions: {
				//	username: process.env.SAUCE_USERNAME,
				//	accessKey: process.env.SAUCE_ACCESS_KEY,
				//	tunnelIdentifier: process.env.TRAVIS_JOB_NUMBER
				//}
			},
			customLaunchers: launchersSet,
			browsers: Object.keys(launchersSet)
		}

		if (env.TRAVIS) {
			karmaConfig[setKey].sauceLabs.testName = env.TRAVIS_REPO_SLUG;
			karmaConfig[setKey].sauceLabs.tunnelIdentifier = env.TRAVIS_JOB_NUMBER;
			karmaConfig[setKey].sauceLabs.tags = [
				env.TRAVIS_BRANCH,
				env.TRAVIS_JOB_NUMBER,
				env.TRAVIS_NODE_VERSION
			];
		}
	});

}

function amdCleanFactory(config) {
	return function (data) {
		fs.writeFileSync(data.path, amdclean.clean({
			filePath: data.path,
			removeUseStricts: false,
			removeAllRequires: false,
			prefixMode: 'camelCase',
			wrap: {
				start: '(function (root, factory) {'
				+ '\u000A  if (typeof define === \'function\' && define.amd) {'
				+ '\u000A    define(factory);'
				+ '\u000A  } else if (typeof exports === \'object\') {'
				+ '\u000A    module.exports = factory();'
				+ '\u000A  }'
				+ '\u000A}(this, function () {\u000A',
				end: '\u000Areturn ' + config.returnModule + ';'
				+ '\u000A}));\u000A'
			}
		}));
	};
}

module.exports = function (grunt) {

	grunt.initConfig({
		clean: {
			codeCoverage: 'coverage/**'
		},
		copy: {
			lcovInfo: {
				flatten: true,
				expand: true,
				cwd: 'coverage',
				src: '**/lcov.info',
				dest: 'coverage/'
			}
		},
		requirejs: {
			fixtures: {
				options: {
					baseUrl: '.',
					paths: {
						view: 'plugin/optimizer',
						builder: 'plugin/builder'
					},
					include: ['view!tests/fixtures/table.tpl', 'view!tests/fixtures/deep-include.tpl'],
					exclude: ['plugin/optimizer', 'plugin/builder'],
					out: 'tests/fixtures/templates.js',
					optimize: 'none'
				}
			},
			optimizer: {
				options: {
					baseUrl: '.',
					name: 'plugin/optimizer',
					out: 'dist/optimizer.js',
					optimize: 'none',
					onModuleBundleComplete: amdCleanFactory({
						returnModule: 'pluginOptimizer'
					})
				}
			},
			builder: {
				options: {
					baseUrl: '.',
					name: 'plugin/builder',
					out: 'dist/builder.js',
					optimize: 'none',
					onModuleBundleComplete: amdCleanFactory({
						returnModule: 'pluginBuilder'
					})
				}
			},
			loader: {
				options: {
					baseUrl: '.',
					name: 'plugin/loader',
					out: 'dist/loader.js',
					optimize: 'none',
					onModuleBundleComplete: amdCleanFactory({
						returnModule: 'pluginLoader'
					})
				}
			}
		},
		uglify: {
			dist: {
				expand: true,
				src: 'dist/*.js',
				ext: '.min.js'
			}
		},
		jshint: {
			all: ['plugin/**/*.js', 'test/**/*Spec.js']
		},
		karma: karmaConfig
	});

	[
		'grunt-contrib-clean',
		'grunt-contrib-copy',
		'grunt-contrib-requirejs',
		'grunt-contrib-jshint',
		'grunt-contrib-uglify',
		'grunt-karma'
	].forEach(grunt.loadNpmTasks);

	grunt.registerTask('build', ['requirejs:optimizer', 'requirejs:builder', 'requirejs:loader']);
	grunt.registerTask('fixtures', ['requirejs:fixtures']);
	grunt.registerTask('dist', ['build', 'uglify']);
	grunt.registerTask('lint', ['jshint']);
	grunt.registerTask('test', ['karma:test']);
	grunt.registerTask('travis', sauceLabsKarmaTargets.concat(['karma:coverage', 'copy:lcovInfo']));
	grunt.registerTask('default', ['lint', 'test', 'dist']);
};
