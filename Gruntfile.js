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
		mochaTest: {
			node: {
				src: ['.grunt/test/node/*Spec.js'],
				options: {
					reporter: 'html-cov',
					captureFile: '.grunt/coverage-node.html',
					quiet: true
				}
			}
		},
		//mocha: {
		//	options: {
		//		reporter: 'HTMLCov',
		//		run: true
		//	},
		//	browser: {
		//		src: ['.grunt/test/browser/*.html'],
		//		dest: '.grunt/coverage-browser.html'
		//	}
		//},
		clean: {
			test: ['.grunt'],
			dist: ['dist']
		},
		copy: {
			testFiles: {
				src: ['test/**', 'dist/*.js', '!dist/*.min.js'],
				dest: '.grunt/'
			}
		},
		blanket: {
			buildFiles: {
				files: {
					'.grunt/dist/': ['dist']
				}
			}
		},
		requirejs: {
			//bench: {
			//	options: {
			//		baseUrl: './',
			//		paths: {
			//			legacy: 'bench/legacy',
			//			jquery: 'empty:'
			//		},
			//		name: 'bench/legacy/view',
			//		out: '.grunt/legacy.js',
			//		optimize: 'none'
			//	}
			//},
			test: {
				options: {
					baseUrl: './',
					paths: {
						view: 'dist/optimizer',
						builder: 'dist/builder'
					},
					include: ['view!test/examples/table.tpl', 'view!test/examples/deep-include.tpl', 'test/fixtures/colors'],
					exclude: ['dist/optimizer', 'dist/builder'],
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
		},
		karma: {
			all: {
				configFile: 'karma.conf.js'
			}
		},
		codeclimate: {
			options: {
				file: '<%= destDir %>/coverage.lcov',
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
		'grunt-mocha-test',
		'grunt-blanket',
		'grunt-codeclimate'
	].forEach(grunt.loadNpmTasks);

	grunt.registerTask('build', ['requirejs:optimizer', 'requirejs:builder', 'requirejs:loader']);
	grunt.registerTask('dist', ['build', 'uglify']);
	grunt.registerTask('lint', ['jshint']);
	//grunt.registerTask('test', ['requirejs:test', 'mochaTest']);
	grunt.registerTask('test', ['clean', 'build', 'requirejs:test', 'copy', 'karma']);
	grunt.registerTask('default', ['lint', 'test']);
};
