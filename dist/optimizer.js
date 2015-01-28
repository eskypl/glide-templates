(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  }
}(this, function () {
  
var pluginLibI18n, pluginLibTemplates, pluginOptimizer;
pluginLibI18n = function () {
  
  var doc = typeof document === 'object' ? document : false;
  var jsonPathSep = '.';
  var debugMode = doc && doc.cookie.indexOf('translationDebugMode=debug;') !== -1;
  var variableHolder = /{\$?(\w+)}|{{\$?(\w+)}}/g;
  var memory = {};
  var translations = typeof i18n === 'object' ? i18n : {};
  function deepExplore(_path, _data) {
    var key = _path.shift();
    if (_path.length && typeof _data[key] !== 'string') {
      return deepExplore(_path, _data[key]);
    } else {
      return _data[key];
    }
  }
  function explore(_key, _data) {
    var path;
    var res;
    // Check if translation is in memory
    if (memory[_key]) {
      return memory[_key];
    }
    // Otherwise check translation object
    path = _key.split(jsonPathSep);
    res = deepExplore(path, _data);
    // and save result to the memory if result is valid
    if (res) {
      memory[_key] = res;
    }
    return res;
  }
  return {
    translate: function (_key, _data) {
      var text = explore(_key, translations);
      if (!text || debugMode) {
        return '__{' + _key + '}__';
      }
      /**
      * Use String.search as it seems to be the fastest way to check RegExp.
      * On Chrome RegExp.test is faster but it brakes unit tests (for some
      * reason function gives false results on PhantomJS - need to investigate).
      * TODO: Investigate problem with RegExp.test in PhantomJS unit tests.
      */
      if (_data && text.search(variableHolder)) {
        /**
         * Replace callback will get 3 arguments depending on used placeholder.
         * For old placeholders with indexes (ex.: {$1}) index will be returned.
         * For twig compatible placeholders (ex.: {{currency}}) holder will be returned.
         * @type {*|string|void}
         */
        text = text.replace(variableHolder, function (_match, _index, _holder) {
          return _index ? _data[_index] || _match : _data[_holder] || _match;
        });
      }
      return text;
    }
  };
}();
pluginLibTemplates = function (i18n) {
  
  function Template(_fn, _name) {
    var ctx;
    var tpl;
    /**
     * List of dependencies. Dependencies are resolved during
     * render phase.
     * @type {Object}
     */
    this.deps = _fn.deps || [];
    this.includes = _fn.includes || [];
    ctx = this;
    tpl = function template(_data, _cb) {
      try {
        _cb(null, _fn.call(ctx, _data));
      } catch (_error) {
        _error.message += ' in template "' + _name + '": ' + _fn.toString();
        _cb(_error);
      }
    };
    /**
     * Name of the module in which template was defined.
     */
    tpl.moduleName = _name;
    tpl.fn = _fn;
    return tpl;
  }
  Template.prototype = {
    /**
     * Returns information about object in a loop. During iteration
     * key, index and total number of items is given.
     * @param key
     * @param index
     * @param total
     * @returns {{key: *, index: *, total: *, number: *, last: boolean, first: boolean}}
     */
    i: function info(_key, _index, _total) {
      var number = _index + 1;
      var even = number % 2 === 0;
      return {
        key: _key,
        index: _index,
        total: _total,
        number: number,
        last: number === _total,
        first: _index === 0,
        even: even,
        odd: !even
      };
    },
    /**
     * Iterates over objects inside templates.
     * @param data
     * @param callback
     */
    e: function each(_data, _callback) {
      var total;
      var key;
      var index = 0;
      if (!_data) {
        return;
      }
      if (_data instanceof Array) {
        for (index = 0, total = _data.length; index < total; index++) {
          _callback(_data[index], this.i(index, index, total));
        }
      } else {
        total = this.c(_data);
        for (key in _data) {
          if (_data.hasOwnProperty(key)) {
            _callback(_data[key], this.i(key, index++, total));
          }
        }
      }
    },
    /**
     * Calculates total number of items in the given object.
     * @param object
     * @returns {number}
     */
    c: function count(_object) {
      var counter = 0;
      if (!_object) {
        return 0;
      }
      for (var key in _object) {
        if (_object.hasOwnProperty(key)) {
          counter++;
        }
      }
      return counter;
    },
    /**
     * Helper function to fetch additional template. Used by
     * {include} statement.
     * @param moduleName
     * @param data
     * @returns {String}
     */
    f: function fetch(_moduleIndex, _data) {
      var fn = this.includes[_moduleIndex].fn;
      if (typeof fn === 'function' && (!fn.includes || !fn.includes.length)) {
        return fn.call(this, _data);
      } else {
        throw new Error('Cannot include template (' + this.deps[_moduleIndex] + ') which has dependencies');
      }
    },
    t: i18n.translate
  };
  return Template;
}(pluginLibI18n);
pluginOptimizer = function (Template) {
  
  var fileExtension = /\.\w+$/i;
  return {
    version: '1.0.0',
    pluginBuilder: 'builder',
    normalize: function (_name) {
      return _name.replace(fileExtension, '');
    },
    load: function (_name, _req, _onload) {
      _req([_name], function (tpl) {
        _onload(new Template(tpl, _name));
      });
    }
  };
}(pluginLibTemplates);
return pluginOptimizer;
}));
