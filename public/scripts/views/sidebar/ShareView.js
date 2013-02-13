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
			'change #upload': 'upload',
			'click #sync': 'sync'
		},

		exportData: function () {

		},

		render: function () {

			var download = SyncModel.exportData();
			download = escape(JSON.stringify(download));

			// encode into base64
			var base64 = 'data:application/octet-stream;base64,' + window.btoa(download);

			// render the popup
			this.popup = new PopupView();
			this.el = this.popup.render(ShareTemplate, {
				'url': base64
			});
			// override the Jquery extended el element
			this.$el = $(this.el);
			// rebind the events
			this.delegateEvents();
		},


		upload: function () {

			var file = $('#upload', this.$el).get(0).files[0],
				reader = new FileReader();

			reader.onload = function (d) {

				d = d.target.result.replace('data:;base64,', '');
				d = window.atob(d);
				d = unescape(d);
				d = JSON.parse(d);

				SyncModel.importData(d);
				

				this.popup.remove();
			}.bind(this);

			reader.readAsDataURL(file);
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
			}.bind(this);
		}

	});

	return ShareView;

});		