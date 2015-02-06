var fs = require('fs');
var amdclean = require('amdclean');

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

	function readCodeclimateTokenFile() {
		var filename = './codeclimate.txt';
		if (grunt.file.exists(filename)) {
			return grunt.file.read('codeclimate.txt', { encoding: 'utf8' }).trim();
		}
	}

	var CODECLIMATE_REPO_TOKEN = process.env.CODECLIMATE_REPO_TOKEN
		|| readCodeclimateTokenFile();

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
		karma: {
			all: {
				configFile: 'karma.conf.js'
			}
		},
		codeclimate: {
			options: {
				file: 'coverage/lcov.info',
				token: CODECLIMATE_REPO_TOKEN
			}
		}
	});

	[
		'grunt-contrib-clean',
		'grunt-contrib-copy',
		'grunt-contrib-requirejs',
		'grunt-contrib-jshint',
		'grunt-contrib-uglify',
		'grunt-karma',
		'grunt-codeclimate'
	].forEach(grunt.loadNpmTasks);

	grunt.registerTask('build', ['requirejs:optimizer', 'requirejs:builder', 'requirejs:loader']);
	grunt.registerTask('fixtures', ['requirejs:fixtures']);
	grunt.registerTask('dist', ['build', 'uglify']);
	grunt.registerTask('lint', ['jshint']);
	grunt.registerTask('test', ['clean:codeCoverage', 'karma']);
	grunt.registerTask('travis', ['karma', 'copy:lcovInfo', 'codeclimate']);
	grunt.registerTask('default', ['lint', 'test', 'dist']);
};
