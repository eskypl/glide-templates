(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  }
}(this, function () {
var pluginSyntaxSmarty, pluginSyntaxTwig, pluginSyntaxMain, pluginLibCompiler, pluginBuilder;
pluginSyntaxSmarty = function () {
  
  function Smarty(_tagReplacementTable) {
    this.tagResolvers = {};
    this.deps = [];
    for (var i in this.tagDefinisions) {
      this.tagResolvers[i] = this.compileTag(i, _tagReplacementTable[i]);
    }
  }
  Smarty.prototype = {
    compileTag: function (_tagType, _tagReplacement) {
      return [
        new RegExp('{' + this.tagDefinisions[_tagType] + '}', 'g'),
        this.giveContext(_tagReplacement)
      ];
    },
    getResolvedDependencies: function () {
      return this.deps || [];
    },
    tagDefinisions: {
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
    for (var i in this.tagDefinisions) {
      this.tagResolvers[i] = this.compileTag(i, _tagReplacementTable[i]);
    }
  }
  Twig.prototype = {
    compileTag: function (_tagType, _tagReplacement) {
      var regexp;
      var expression = this.tagDefinisions[_tagType];
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
    tagDefinisions: {
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
  var space = /\s+/;
  var jsonObjectSimplePattern = /^{(\s*[a-z][a-z0-9]*:\s*@?[\w\$\.\[\]\(\)]+\s*)(,\s*[a-z][a-z0-9]*:\s*@?[\w\$\.\[\]\(\)]+\s*)*}$/i;
  function variablesToJSON(_variables) {
    if (true === jsonObjectSimplePattern.test(_variables)) {
      return loopExpression(_variables);
    }
    var data = [];
    var vars = _variables.split(space);
    var pair;
    for (var i = 0, j = vars.length; i < j; i++) {
      pair = vars[i].split('=');
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
      this.deps.push('view!' + _templateName + '.tpl');
      return '"+_this.f(' + (this.deps.length - 1) + ',' + (data ? data : '$tpl') + ')+"';  //return '';
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
      throw 'Unsupported templateing syntax style';
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
  function optimize(_fnbody) {
    return _fnbody.replace(/_\+="";/g, '').replace(/=""\+/g, '=').replace(/\+"";/g, ';');
  }
  function parse(_template, _style) {
    var fn;
    var fnbody = sanitize(_template);
    var syntaxStyle = syntax[styles[_style]];
    var syntaxCompiler = new SyntaxFactory(syntaxStyle);
    var syntaxResolver = syntaxCompiler.tagResolvers;
    for (var i in syntaxResolver) {
      fnbody = fnbody.replace(syntaxResolver[i][0], syntaxResolver[i][1]);
    }
    fnbody = optimize('var _this=this,_="";_+="' + fnbody + '";return _;');
    try {
      /* jshint -W054 */
      fn = new Function('$tpl', fnbody);
      /* jshint +W054 */
      fn.deps = syntaxCompiler.getResolvedDependencies();
      return fn;
    } catch (_error) {
      if (_error instanceof SyntaxError) {
        _error.message += ' in "' + fnbody + '"';
      }
      throw 'Template compilation error: ' + _error.stack || _error.message;
    }
  }
  return parse;
}(pluginSyntaxMain);
pluginBuilder = function (compile) {
  
  var buildMap = {};
  var matchModuleName = /^\w+!(.+?)\.\w+$/i;
  function extension(filePath) {
    var ext = filePath.match(/\.(\w+)$/i);
    if (ext && ext.length) {
      return ext[1].toLowerCase();
    }
    return ext;
  }
  function normalizeModuleName(_pluginName) {
    return function (moduleName) {
      var res = matchModuleName.exec(moduleName);
      return _pluginName + '!' + (res ? res[1] : name);
    };
  }
  function moduleNameToCamelCase(_moduleName) {
    return _moduleName.replace(/[^a-z]./gi, function (match) {
      return String(match).substr(1).toUpperCase();
    });
  }
  return {
    version: '1.0.0',
    compile: compile,
    load: function (_name, _req, _onload) {
      var fs = require.nodeRequire('fs');
      var file;
      try {
        file = fs.readFileSync(_req.toUrl(_name), 'utf8');
        //Remove BOM (Byte Mark Order) from utf8 files if it is there.
        if (file.indexOf('\uFEFF') === 0) {
          file = file.substring(1);
        }
      } catch (_error) {
        _onload.error(_error);
      }
      //var compile = require.nodeRequire(_req.toUrl('plugin/lib/compiler'));
      var fn = compile(file, extension(_name));
      buildMap[_name] = fn;
      if (!!fn.deps.length) {
        _req(fn.deps);
      }
      _onload();
    },
    write: function (_pluginName, _moduleName, _write) {
      var fn = buildMap[_moduleName];
      var normalizedName = _moduleName.replace(/\.\w+$/i, '');
      var functionName = moduleNameToCamelCase(_moduleName);
      var fnbody = fn.toString().replace('function anonymous', 'function ' + functionName);
      var fndeps = '';
      var fnincl = '';
      var normalizer;
      if (!!fn.deps.length) {
        normalizer = normalizeModuleName(_pluginName);
        fndeps = '["' + fn.deps.map(normalizer).join('","') + '"],';
        fnincl = functionName + '.includes=arguments;';
      }
      _write.asModule(normalizedName, 'define(' + fndeps + 'function(){' + fnbody + ';' + fnincl + 'return ' + functionName + ';});');
    }
  };
}(pluginLibCompiler);
return pluginBuilder;
}));
