define([
	'jquery',
	'underscore',
	'backbone',
	'models/sync/SyncModel',
	'views/popup/PopupView',
	'text!templates/ImportExport.html'
], function ($, _, Backbone, SyncModel, PopupView, ShareTemplate) {

	'use strict';

	var ImportExport = Backbone.View.extend({

		events: {
			'change #upload': 'upload'
		},

		render: function () {

			var download = SyncModel.exportData();
			download = JSON.stringify(download);
			download = escape(download);

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
		}
	});

	return ImportExport;

});		