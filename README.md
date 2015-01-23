# Templates for RequireJS

JavaScript templating plugin for RequireJS with subset of Smarty and Twig languages syntax.

## Instalation

`npm install glide-templates --save`

## Configuration

Minimal configuration for RequireJS is needed. Plugin name is hardcoded, so for now RequireJS `paths` config variable
has to include property `view` with given path to loader or optimizer script.

### Development (loader)

Following code should be used in development. It will load all requested templates on demand, and compile them on the
fly. Template function is returned.

```js
require.config({
  paths: {
    view: 'node_modules/glide-templates/dist/loader'
  }
});
```

### Build (optimizer)

Following code should be used together with `r.js` optimizer. During optimization process, compiler will be excluded
from build, and all templates will be stored as functions. If UglifyJS or Clouser Compiler will be used, templates size
will be reduced even more.

```js
require.config({
  paths: {
    view: 'node_modules/glide-templates/dist/optimizer'
    builder: 'node_modules/glide-templates/dist/builder'
  }
});
```

## Usage

Templates are loaded as every other resource with the use of RequireJS plugin. In return we get template function which
accepts two arguments: object with data and callback function. After rendering, callback function is called with two
arguments: error object and string with the output. If there is no error, then `null` is returned in first argument.

```js
define([
  'path/to/data',
  'view!path/to/template.tpl'
], function (data, tpl) {
  tpl(data, function (error, result) {
    if (error) {
      // do something with the error
    }
    // otherwise do something with the result
  });
});
```

### Example

```js
jQuery.fn.render = function (err, res) {
  if (err) {
    return this.html(err.message).css('color', 'red');
  }
  return this.html(res);
}
define([
  'jquery',
  'path/to/data',
  'view!path/to/template.tpl'
], function ($, data, tpl) {
  var $table = $('#my-table');
  tpl(data, $table.render);
});
```

## Template syntax

Plugin supports syntax of two templating languages: Smarty and Twig. This support is limited to the simpliest
operations like conditionals and loops. Apart from supported syntax languages, plugin may add its own tags
that matches currently used syntax style.

In each tag definition you can find following placeholders:

* `{expression}` - any valid JavaScript expression;
* `{$variable}` - variable name starting with `$` sign (supports fluent style);
* `{string}` - just string;

### Choosing syntax style

Which syntax compiler will be used depends on the template's extension:

* **tpl** - Smarty syntax
* **smarty** - Smarty syntax
* **twig** - Twig syntax

### Global scope (root)

Inside each template there is one root variable named `$tpl`. All data passed to the template is bind to this variable.

### Supported syntax tags

#### Variables

All variables inside templates begin with `$` symbol. There is one exception to this rule. Inside each loop some special
variables are created and they are prefixed with `@` sign. See loops documentation.

| Syntax | Definition          |
|--------|---------------------|
| Smarty | `{{$variable}}`     |
| Twig   | `{{ {$variable} }}` |

**Example**

```
{$tpl.item[0].getData('all')}
```

#### Conditions

| Syntax | Definition                                                          |
|--------|---------------------------------------------------------------------|
| Smarty | `{if {expression}}...[{else[ {expression}]}...]{/if}`               |
| Twig   | `{% if {expression} %}...[{% else[ {expression}] %}...]{% endif %}` |

**Example**

```
{if $tpl.flag === 'condition'}
  <p>...</p>
{else $tpl.flag === 'else'}
  <p>...</p>
{/if}
```

#### Loops

| Syntax | Definition                                             |
|--------|--------------------------------------------------------|
| Smarty | `{foreach {expression} as {$variable}}...{/foreach}`   |
| Twig   | `{% for {$variable} in {expression} %}...{% endfor %}` |

Inside each loop you have access to the loop-scoped variables prefixed with `@` sign:

* `@key` - key of current item (if you are iterating over an array then `@key === @index`);
* `@index` - index of current number, beginning from 0;
* `@number` - number of current iteration, beginning from 1;
* `@first` - `true` if this is first iteration in the loop, otherwise it's `false`;
* `@last` - `true` if this is last iteration in the loop, otherwise it's `false`;
* `@odd` - `true` if current iteration `@number` is odd, otherwise it's `false`;
* `@even` - `true` if current iteration `@number` is even, otherwise it's `false`;

**Example**

```
{foreach $data as $value}
  <p>Value at index {@index}: {$value}</p>
{/foreach}
```

#### Assigments

| Syntax | Definition                                    |
|--------|-----------------------------------------------|
| Smarty | `{assign var={$variable} value={expression}}` |
| Twig   | `{% set {$variable}={expression} %}`          |

**Example**

```
{assign var=$data value=[1, 2, 3]}
{foreach $data as $value}
  {assign var=$even value=@even}
{/foreach}
```

#### Includes

You can include templates in other templates. However there is limitation to the nesting level. For now you can includes
can be only one level deep. That means you cannot include a template which already includes other templates.

By default template without any arguments will use the same data object as the template which includes it. If some
variables are passed to the template they will overwrite default data object.

| Syntax | Definition                                                                    |
|--------|-------------------------------------------------------------------------------|
| Smarty | `{include template={string}[ key1={expression}[ keyN={expression}]]}`         |
| Twig   | `{% include '{string}'[ with { key1: {expression }[, keyN: {expression}]] %}` |

where `{string}` is valid path to the template (without plugin `view!` prefix and file extension).

**Example**

*main.tpl*

```
{include template=views/items-list items=$tpl.data}
```

*views/items-list.tpl*

```
{foreach $tpl.items as $item}
  ...
{/foreach}
```

#### Comments

Comments are removed during compilation.

| Syntax | Definition  |
|--------|-------------|
| Smarty | `{* ... *}` |
| Twig   | `{# ... #}` |

### Tags added by the plugin

#### Translations

Translation are done with the use of additional `lib/i18n` module. This module uses `i18n` global variable
to search for translations.

| Syntax | Definition                                                                 |
|--------|----------------------------------------------------------------------------|
| Smarty | `{i18n key={string}[ key1={expression}[ keyN={expression}]]}`              |
| Twig   | `{% i18n '{string}'[ with { key1: {expression }[, keyN: {expression}]] %}` |

where `{string}` is valid translation key.

#### Debuging

| Syntax | Definition                |
|--------|---------------------------|
| Smarty | `{debug var={$variable}}` |
| Twig   | `{% debug {$variable} %}` |


## TODO

* Plugin name is hardcoded, so for now RequireJS `paths` config variable has to include property `view` with given path to loader or optimizer script.

## Contributing

## License
