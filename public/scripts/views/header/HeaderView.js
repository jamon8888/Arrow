define([
	'jquery',
	'underscore',
	'backbone',
	'vent',
	'views/header/ImportExportView',
	'views/header/ShareView'
], function ($, _, Backbone, vent, ImportExportView, ShareView) {

	var HeaderView = Backbone.View.extend({

		el: $('header'),

		events: {
			'mousedown #share': 'share'
		},

		share: function () {
			var sv = new ShareView();
			sv.render();
		}

	});

	return HeaderView;
});