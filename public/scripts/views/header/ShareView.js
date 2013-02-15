define([
	'jquery',
	'underscore',
	'backbone',
	'models/sync/SyncModel',
	'views/popup/PopupView',
	'text!templates/Share.html'
], function ($, _, Backbone, SyncModel, PopupView, ShareTemplate) {

	'use strict';

	var ShareView = Backbone.View.extend({

		events: {
			'mousedown #sync': 'sync'
		},

		render: function () {
			// render the popup
			this.popup = new PopupView();
			this.el = this.popup.render(ShareTemplate);
			// override the Jquery extended el element
			this.$el = $(this.el);
			// rebind the events
			this.delegateEvents();
		},

		sync: function () {

			var location = window.location,
				host = location.host;

			var ws = new WebSocket('ws://' + host);
			ws.onopen = function (event) {
				ws.send(JSON.stringify({
					'method': 'sync',
					'payload': SyncModel.exportData()
				}));

				this.$el.find('.btn').addClass('loading');

				ws.onmessage = function (res) {
					var url = this.$el.find('#url');
					url.val('/dashboard/' + res.data);
					url.show();

					this.$el.find('.btn').text('Success!');

				}.bind(this);
			}.bind(this);
		}

	});

	return ShareView;

});