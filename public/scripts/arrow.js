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
		'chosen': {
			deps: [
				'jquery'
			],
			exports: 'chosen'
		},
		'cloud': {
			deps: [
				'd3'
			],
			exports: 'cloud'
		}
	},

	paths: {
		jquery: 'libraries/jquery',
		jqueryui: 'libraries/jquery-ui',
		underscore: 'libraries/underscore',
		backbone: 'libraries/backbone',
		localstorage: 'libraries/backbone-localstorage',
		templates: '../templates',
		datasift: 'libraries/ds',
		d3: 'libraries/d3',
		cloud: 'libraries/d3.layout.cloud',
		chosen: 'libraries/chosen/chosen.jquery'
	}
});

require([
	'app'
], function (App) {
	App.initialize();
});