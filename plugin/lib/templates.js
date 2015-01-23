define(['plugin/lib/i18n'], function (i18n) {
	'use strict';

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
});
