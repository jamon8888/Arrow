require.config({

	shim: {
		'underscore': {
			exports: '_'
		},
		'backbone': {
			deps: [
				'underscore',
				'jquery'
			],
			exports: 'Backbone'
		},
		'datasift': {
			exports: 'DataSift'
		},
		'd3': {
			exports: 'd3'
		},
		'masonry': {
			deps: [
				'jquery'
			]
		}
	},

	paths: {
		jquery: 'libraries/jquery',
		underscore: 'libraries/underscore',
		backbone: 'libraries/backbone',
		localstorage: 'libraries/backbone-localstorage',
		templates: '../templates',
		datasift: 'libraries/ds',
		d3: 'libraries/d3'
	}
});

require([
	'app'
], function (App) {
	App.initialize();
});