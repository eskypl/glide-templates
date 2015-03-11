// Karma configuration
// Generated on Thu Jan 29 2015 15:25:15 GMT+0100 (Środkowoeuropejski czas stand.)

module.exports = function(config) {
	config.set({

		// base path that will be used to resolve all patterns (eg. files, exclude)
		basePath: '.',


		// frameworks to use
		// available frameworks: https://npmjs.org/browse/keyword/karma-adapter
		frameworks: ['mocha', 'requirejs', 'chai'],


		// list of files / patterns to load in the browser
		files: [
			'tests/bootstrap.js',
			'tests/fixtures/templates.js',
			'node_modules/chai/chai.js',
			{pattern: 'plugin/**/*.js', included: false},
			{pattern: 'tests/{assertions,fixtures}/*', included: false},
			{pattern: 'tests/**/*Spec.js', included: false}
		],


		// list of files to exclude
		exclude: [
		],


		// preprocess matching files before serving them to the browser
		// available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
		preprocessors: {},


		// test results reporter to use
		// possible values: 'dots', 'progress'
		// available reporters: https://npmjs.org/browse/keyword/karma-reporter
		reporters: ['dots'],

		// web server port
		port: 9876,


		// enable / disable colors in the output (reporters and logs)
		colors: true,


		// level of logging
		// possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
		logLevel: config.LOG_INFO,


		// enable / disable watching file and executing tests whenever any file changes
		autoWatch: false,

		// start these browsers
		// available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
		browsers: ['PhantomJS'],

		// Continuous Integration mode
		// if true, Karma captures browsers, runs the tests and exits
		singleRun: true,

		// Timeout for capturing a browser (in ms). Default: 60000
		captureTimeout: 90000,

		// How long does Karma wait for a browser to reconnect (in ms). Default: 2000
		browserDisconnectTimeout: 3000,

		// The number of disconnections tolerated. Default: 0
		browserDisconnectTolerance: 0,

		// How long will Karma wait for a message from a browser before disconnecting from it (in ms). Default: 10000
		browserNoActivityTimeout: 30000
	});
};
