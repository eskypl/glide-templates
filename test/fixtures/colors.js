(function (root, factory) {
	if (typeof define === 'function' && define.amd) {
		define([], factory);
	} else if (typeof exports === 'object') {
		module.exports = factory();
	}
}(this, function () {
	return {
		showTable: false,
		data: {
			red: ['#f00', 'rgb(255, 0, 0)'],
			blue: ['#00f', 'rgb(0, 0, 255)'],
			green: ['#0f0', 'rgb(0, 255, 0)'],
			black: ['#000', 'rgb(0 ,0 ,0)'],
			white: ['#fff', 'rgb(255 ,255 ,255)'],
			cyan: ['#0ff', 'rgb(0, 255, 255)']
		},
		size: function () {
			return Object.keys(this.data).length;
		}
	};
}));
