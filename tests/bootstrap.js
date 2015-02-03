var allTestFiles = [];
var TEST_REGEXP = /(spec|test)\.js$/i;

var pathToModule = function(path) {
  return path.replace(/^\/base\//, '').replace(/\.js$/, '');
};

Object.keys(window.__karma__.files).forEach(function(file) {
  if (TEST_REGEXP.test(file)) {
    // Normalize paths to RequireJS module names.
    allTestFiles.push(pathToModule(file));
  }
});

Object.prototype.extendWith = function (object) {
  for (var i in object) {
    this[i] = object[i];
  }
  return this;
};

var i18n = {
  test: {
    Showing_table_type: 'Table type: {{type}} {$2}.',
    Showing_table_type_old: 'Table type: {$1} {$2}.',
    Showing_table_type_old_ext: 'Table type: {1} {2}.',
    Showing_table_type_new: 'Table type: {{type}} {{info}}.',
    Showing_table_type_new_ext: 'Table type: {{$type}} {{$info}}.'
  }
};

requirejs.config({
  // Karma serves files under /base, which is the basePath from your config file
  baseUrl: '/base',
  map: {
    '*': {
      view: 'plugin/loader'
    },
    'tests/optimizerSpec': {
      view: 'plugin/optimizer'
    },
    'tests/fixtures/table': {
      view: 'plugin/optimizer'
    },
    'tests/fixtures/include': {
      view: 'plugin/optimizer'
    },
    'tests/fixtures/deep-include': {
      view: 'plugin/optimizer'
    }
  },

  // dynamically load all test files
  deps: allTestFiles,

  // we have to kickoff jasmine, as it is asynchronous
  callback: window.__karma__.start
});
