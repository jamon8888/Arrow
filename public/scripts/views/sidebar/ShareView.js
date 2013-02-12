define([
	'jquery',
	'underscore',
	'backbone',
	'collections/dashboard/DashboardCollection',
	'views/popup/PopupView',
	'text!templates/Share.html'
], function ($, _, Backbone, DashboardCollection, PopupView, ShareTemplate) {

	'use strict';

	var ShareView = Backbone.View.extend({

		events: {
			'change #upload': 'upload'
		},

		render: function () {

			var data = JSON.parse(localStorage.getItem('data')),
				dashboards = localStorage.getItem('DashboardCollection'),
				datasources = localStorage.getItem('DataSourceUserModel');

			// we need to strip the sensitive parameters our of the datasources
			for (var model in datasources) {
				if (datasources[model].datasources !== undefined) { 
					for (var ds in datasources[model].datasources) {
						for (var key in datasources[model].datasources[ds]) {
							if (key !== 'name' && key !== 'niceName' && key !== 'id') {
								delete(datasources[model].datasources[ds][key]);
							}
						}
					}
				}
			}



			var download = {};
			// get everything in our localstorage
			Object.keys(localStorage).forEach(function (key) {
				download[key] = localStorage.get(key);
			});

				
			var download = {
				'data': data,
				'dashboards': dashboards,
				'datasources': datasources
			};

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

				// add all the datasources
				var data = JSON.parse(localStorage.getItem('data')) || {},
					dashboards = JSON.parse(localStorage.getItem('DashboardCollection')) || {},
					datasources = JSON.parse(localStorage.getItem('DataSourceUserModel')) || {};


				console.log(DashboardCollection);

				DashboardCollection.update(d.dashboards);

				return;

				_.extend(data, d.data);
				_.extend(dashboards, d.dashboards);
				_.extend(datasources, d.datasources);


				localStorage.setItem('data', JSON.stringify(data));
				localStorage.setItem('DashboardCollection', JSON.stringify(dashboards));
				localStorage.setItem('DataSourceUserModel', JSON.stringify(datasources));

				DashboardCollection.fetch();

			};
			reader.readAsDataURL(file);
		}

	});

	return ShareView;

});		