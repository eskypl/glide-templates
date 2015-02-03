/**
 * Loader to be used with the build process.
 * It points to the builder which will do optimization,
 * however in final build this file will be included.
 */
define(['plugin/lib/templates'], function (Template) {
	'use strict';

	var fileExtension = /\.\w+$/i;

	return {
		version: '1.0.0',
		pluginBuilder: 'builder',
		translate: Template.translator.translate,
		normalize: function(_name) {
			return _name.replace(fileExtension, '');
		},
		load: function (_name, _req, _onload) {
			_req([_name], function (tpl) {
				_onload(new Template(tpl, _name));
			});
		}
	};
});
