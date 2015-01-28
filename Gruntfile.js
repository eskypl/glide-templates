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

	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-requirejs');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-mocha');
	grunt.loadNpmTasks('grunt-mocha-test');

	grunt.initConfig({
		mochaTest: {
			node: {
				src: ['test/node/*Spec.js']
			}
		},
		mocha: {
			options: {
				reporter: 'Spec',
				logErrors: true,
				log: true,
				run: true
			},
			browser: {
				src: ['test/browser/*.html']
			}
		},
		clean: {
			test: ['.grunt'],
			dist: ['dist']
		},
		requirejs: {
			bench: {
				options: {
					baseUrl: './',
					paths: {
						legacy: 'bench/legacy',
						jquery: 'empty:'
					},
					name: 'bench/legacy/view',
					out: '.grunt/legacy.js',
					optimize: 'none'
				}
			},
			test: {
				options: {
					baseUrl: './',
					paths: {
						view: 'dist/optimizer',
						builder: 'dist/builder'
					},
					include: ['view!test/examples/table.tpl', 'view!test/examples/deep-include.tpl', 'test/fixtures/colors'],
					out: '.grunt/build.js',
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
		}
	});

	grunt.registerTask('build', ['clean:dist', 'requirejs:optimizer', 'requirejs:builder', 'requirejs:loader', 'uglify']);
	grunt.registerTask('lint', ['jshint']);
	grunt.registerTask('test', ['requirejs:test', 'mochaTest', 'mocha', 'clean:test']);

	grunt.registerTask('default', ['lint', 'test']);
};
