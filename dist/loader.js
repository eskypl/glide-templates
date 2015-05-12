(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  }
}(this, function () {
var pluginSyntaxSmarty, pluginSyntaxTwig, pluginSyntaxMain, pluginLibCompiler, pluginLibI18n, pluginLibTemplates, pluginLoader;
pluginSyntaxSmarty = function () {
  
  function Smarty(_tagReplacementTable) {
    this.tagResolvers = {};
    this.deps = [];
    for (var i in this.tagDefinitions) {
      if (this.tagDefinitions.hasOwnProperty(i)) {
        this.tagResolvers[i] = this.compileTag(i, _tagReplacementTable[i]);
      }
    }
  }
  Smarty.prototype = {
    compileTag: function (_tagType, _tagReplacement) {
      return [
        new RegExp('{' + this.tagDefinitions[_tagType] + '}', 'g'),
        this.giveContext(_tagReplacement)
      ];
    },
    getResolvedDependencies: function () {
      return this.deps || [];
    },
    tagDefinitions: {
      conditional: 'if\\s+(.+?)',
      conditionalElse: 'else',
      conditionalElseIf: 'else\\s+(.+?)',
      conditionalEnd: '\\/if',
      loop: 'foreach\\s+(.+?)\\s+as\\s+(\\$\\w+)',
      loopEnd: '\\/foreach',
      loopExpression: '@([a-z]+)',
      expression: '(\\$.+?)',
      include: 'include\\s+template=(.+?)\\s*(\\s*[a-z]+[a-z0-9]*=.+?)?',
      translate: 'i18n\\s+key=(.+?)\\s*(\\s*[a-zA-Z0-9]+=.+?)?',
      comment: '\\*\\s+.+?\\s+\\*',
      debug: 'debug\\s+var=(\\$.+?)',
      assign: 'assign\\s+var=(\\$\\w+)\\s+value=(.+?)'
    }
  };
  return Smarty;
}();
pluginSyntaxTwig = function () {
  
  function Twig(_tagReplacementTable) {
    this.tagResolvers = [];
    this.deps = [];
    for (var i in this.tagDefinitions) {
      if (this.tagDefinitions.hasOwnProperty(i)) {
        this.tagResolvers[i] = this.compileTag(i, _tagReplacementTable[i]);
      }
    }
  }
  Twig.prototype = {
    compileTag: function (_tagType, _tagReplacement) {
      var regexp;
      var expression = this.tagDefinitions[_tagType];
      var search = expression;
      var replace = _tagReplacement;
      if (expression instanceof Array) {
        search = expression[0];
        replace = expression[1];
      }
      if (_tagType === 'expression' || _tagType === 'loopExpression') {
        regexp = '{{\\s*' + search + '\\s*}}';
      } else if (_tagType === 'comment') {
        regexp = '{#\\s*' + search + '\\s*#}';
      } else {
        regexp = '{%\\s*' + search + '\\s*%}';
      }
      return [
        new RegExp(regexp, 'g'),
        this.giveContext(replace)
      ];
    },
    getResolvedDependencies: function () {
      return this.deps || [];
    },
    tagDefinitions: {
      conditional: 'if\\s+(.+?)',
      conditionalElse: 'else',
      conditionalElseIf: 'else\\s+(.+?)',
      conditionalEnd: 'endif',
      loop: [
        'for\\s+(\\$\\w+)\\s+in\\s+(.+?)',
        '";_this.e($2,function($1,i){_+="'
      ],
      loopEnd: 'endfor',
      loopExpression: '@([a-z]+)',
      expression: '(\\$.+?)',
      include: 'include\\s+\'(.+?)\'(?:\\s+with\\s+(.+?))?',
      translate: 'i18n\\s+\'(.+?)\'(?:\\s+with\\s+(.+?))?',
      comment: '\\s+.+?\\s+',
      debug: 'debug\\s+(\\$.+?)',
      assign: 'set\\s+(\\$\\w+)\\=(.+?)'
    }
  };
  return Twig;
}();
pluginSyntaxMain = function (Smarty, Twig) {
  
  var registry = {
    smarty: Smarty,
    twig: Twig
  };
  var space = /\s+(?=[a-z0-9]\w*=(?:[\$@']))/i;
  var jsonObjectSimplePattern = /^\{(\s*[a-z0-9]+:\s*[^,]+)(,\s*[a-z0-9]+:\s*[^,]+)*\s*\}$/i;
  function variablesToJSON(_variables) {
    if (true === jsonObjectSimplePattern.test(_variables)) {
      return loopExpression(_variables);
    }
    var data = [];
    var vars = _variables.split(space);
    var pair;
    for (var i = 0, j = vars.length; i < j; i++) {
      pair = vars[i].split('=');
      if (!pair || pair.length !== 2) {
        throw new SyntaxError('Cannot parse tag arguments: ' + vars[i] + ' from ' + _variables);
      }
      if (pair[1].indexOf('@') === 0) {
        pair[1] = 'i.' + pair[1].substr(1);
      } else if (pair[1].indexOf('$') !== 0) {
        pair[1] = '"' + pair[1] + '"';
      }
      data.push('"' + pair[0] + '":' + pair[1]);
    }
    return '{' + data.join(',') + '}';
  }
  function loopExpression(_expression) {
    if (_expression) {
      return _expression.replace('@', 'i.');
    }
  }
  var tagReplacementTable = {
    conditional: function (_string, _expression) {
      return '";if(' + loopExpression(_expression) + '){_+="';
    },
    conditionalElse: '";}else{_+="',
    conditionalElseIf: function (_string, _expression) {
      return '";}else if(' + loopExpression(_expression) + '){_+="';
    },
    conditionalEnd: '";}_+="',
    loop: '";_this.e($1,function($2,i){_+="',
    loopEnd: '";});_+="',
    loopExpression: '"+i.$1+"',
    expression: '"+$1+"',
    include: function (_string, _templateName, _variables) {
      var data = '';
      if (_variables) {
        data = variablesToJSON(_variables);
      }
      // TODO: Template should be configurable: view! and .tpl should not be hardcoded.
      // // https://github.com/eskypl/glide-templates/issues/6
      this.deps.push('view!' + _templateName + '.tpl');
      return '"+_this.f(' + (this.deps.length - 1) + ',' + (data ? data : '$tpl') + ')+"';
    },
    translate: function (_string, _key, _variables) {
      var data = '';
      if (_variables) {
        data = ',' + variablesToJSON(_variables);
      }
      return '"+_this.t("' + _key + '"' + data + ')+"';
    },
    comment: '',
    debug: function (_string, _expression) {
      return '";console.log(' + loopExpression(_expression) + ');_+="';
    },
    assign: function (_string, _variableName, _expression) {
      return '";var ' + _variableName + '=' + loopExpression(_expression) + ';_+="';
    }
  };
  var syntaxHelpers = {
    /**
     * Helper method to set new context to specified function. Context is set
     * to object instance on which this method exists.
     * @param fn {Function} Function which should work in different context
     * @returns {*}
     */
    giveContext: function (fn) {
      if (typeof fn !== 'function') {
        return fn;
      }
      var ctx = this;
      var Noop = function () {
      };
      var bind = function () {
        return fn.apply(fn instanceof Noop && ctx ? fn : ctx, Array.prototype.slice.call(arguments));
      };
      Noop.prototype = fn.prototype;
      bind.prototype = new Noop();
      return bind;
    }
  };
  // Extend prototype of each syntax engine with common helper methods.
  for (var syntaxName in registry) {
    for (var helperName in syntaxHelpers) {
      registry[syntaxName].prototype[helperName] = syntaxHelpers[helperName];
    }
  }
  return function SyntaxFactory(_syntaxName) {
    if (!_syntaxName) {
      throw 'Missing template syntax name';
    }
    var syntaxName = _syntaxName.toLowerCase();
    if (!registry[syntaxName]) {
      throw 'Unsupported templating syntax style';
    }
    return new registry[syntaxName](tagReplacementTable);
  };
}(pluginSyntaxSmarty, pluginSyntaxTwig);
pluginLibCompiler = function (SyntaxFactory) {
  
  var whitespace = /^\s*|\r|\n|\t|\s*$/g;
  var quotes = /"/g;
  var amp = /&amp;/g;
  var syntax = [
    'smarty',
    'twig'
  ];
  var styles = {
    tpl: 0,
    smarty: 0,
    twig: 1
  };
  function sanitize(_template) {
    if (typeof _template === 'string' && _template.length) {
      return _template.replace(whitespace, '').replace(quotes, '\\$&').replace(amp, '&');
    }
    return _template;
  }
  function optimize(_fnBody) {
    return _fnBody.replace(/_\+="";/g, '').replace(/=""\+/g, '=').replace(/\+"";/g, ';');
  }
  function parse(_options) {
    var fn;
    var fnBody = sanitize(_options.template);
    var syntaxStyle = syntax[styles[_options.syntax]];
    var syntaxCompiler = new SyntaxFactory(syntaxStyle);
    var syntaxResolver = syntaxCompiler.tagResolvers;
    for (var i in syntaxResolver) {
      if (syntaxResolver.hasOwnProperty(i)) {
        fnBody = fnBody.replace(syntaxResolver[i][0], syntaxResolver[i][1]);
      }
    }
    fnBody = optimize('var _this=this,_="";_+="' + fnBody + '";return _;');
    try {
      /* jshint -W054 */
      fn = new Function('$tpl', fnBody);
      /* jshint +W054 */
      fn.deps = syntaxCompiler.getResolvedDependencies();
      return fn;
    } catch (_error) {
      if (_error instanceof SyntaxError) {
        _error.message += ' in "' + fnBody + '"';
      }
      throw 'Template compilation error: ' + _error.stack || _error.message;
    }
  }
  return parse;
}(pluginSyntaxMain);
pluginLibI18n = function () {
  
  var doc = typeof document === 'object' ? document : false;
  var jsonPathSep = '.';
  var debugMode = doc && doc.cookie.indexOf('translationDebugMode=debug;') !== -1;
  var variableHolder = /{\$?(\w+)}|{{\$?(\w+)}}/g;
  var memory = {};
  var translations = typeof i18n !== 'undefined' ? i18n : {};
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
    if (!this || !(this instanceof Template)) {
      throw new Error('Template not initialized with new');
    }
    /**
     * List of dependencies. Dependencies are resolved during render phase.
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
  Template.translator = i18n;
  Template.prototype = {
    /**
     * Returns information about object in a loop. During iteration
     * key, index and total number of items is given.
     * @param _key {string|number}
     * @param _index {string|number}
     * @param _total {number}
     * @returns {{key: *, index: *, total: *, number: *, last: boolean, first: boolean, even: boolean, odd: boolean}}
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
     * @param _data {object}
     * @param _callback {function}
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
     * @param _object {object}
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
     * Helper function to fetch additional template. Used by {include} statement.
     * @param _moduleIndex {number}
     * @param _data {object}
     * @returns {string} Template rendered with provided data
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
pluginLoader = function (compile, Template) {
  
  function extension(filePath) {
    var ext = filePath.match(/\.(\w+)$/i);
    if (ext && ext.length) {
      return ext[1].toLowerCase();
    }
    return ext;
  }
  function load(_moduleName, _text, _req, _onLoad) {
    var templateFn = compile({
      name: _moduleName,
      template: _text,
      syntax: extension(_moduleName)
    });
    templateFn.includes = [];
    if (templateFn.deps && !!templateFn.deps.length) {
      _req(templateFn.deps, function () {
        for (var i = 0, j = templateFn.deps.length; i < j; i++) {
          templateFn.includes.push(arguments[i]);
        }
        _onLoad(new Template(templateFn, _moduleName));
      });
    } else {
      _onLoad(new Template(templateFn, _moduleName));
    }
  }
  return {
    version: '1.0.0',
    translate: Template.translator.translate,
    load: function (_moduleName, _req, _onLoad) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', _req.toUrl(_moduleName), true);
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          var status = xhr.status || 0;
          if (status > 399 && status < 600) {
            return _onLoad.error(new Error(_moduleName + ' HTTP status: ' + status));
          }
          try {
            load(_moduleName, xhr.responseText, _req, _onLoad);
          } catch (_error) {
            _onLoad.error(_error);
          }
        }
      };
      xhr.send(null);
    }
  };
}(pluginLibCompiler, pluginLibTemplates);
return pluginLoader;
}));
