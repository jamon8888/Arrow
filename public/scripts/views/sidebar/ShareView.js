define([
	'jquery',
	'underscore',
	'backbone',
	'collections/dashboard/DashboardCollection',
	'collections/user/DataSourceUserCollection',
	'views/popup/PopupView',
	'text!templates/Share.html'
], function ($, _, Backbone, DashboardCollection, DataSourceUserCollection, PopupView, ShareTemplate) {

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
			/*for (var model in datasources) {
				if (datasources[model].datasources !== undefined) { 
					for (var ds in datasources[model].datasources) {
						for (var key in datasources[model].datasources[ds]) {
							if (key !== 'name' && key !== 'niceName' && key !== 'id') {
								delete(datasources[model].datasources[ds][key]);
							}
						}
					}
				}
			}*/

			var download = {};
			// get everything in our localstorage
			Object.keys(localStorage).forEach(function (key) {
				download[key] = localStorage.getItem(key);
			});

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

				// data
				var data = JSON.parse(localStorage.getItem('data')) || {};
				d.data = JSON.parse(d.data);
				for (var id in d.data) {
					if (d.data.hasOwnProperty(id)) {
						if (data[id] === undefined) {
							data[id] = d.data[id];
						} else {
							// attempt to extend it
							_.extend(data[id], d.data[id]);
						}
					}
				}
				localStorage.setItem('data', JSON.stringify(data));

				// datasources
				var datasources = d.DataSourceCollection.split(',');
				_.each(datasources, function (ds) {
					var item = JSON.parse(d['DataSourceCollection-' + ds]);
					if (!DataSourceUserCollection.get(item.id)) {
						DataSourceUserCollection.create(item);
					} else {
						console.log('Datasource already exists');
					}
				});

				// dashboards
				var dashboards = d.DashboardCollection.split(',');
				_.each(dashboards, function (dashboard) {
					var item = JSON.parse(d['DashboardCollection-' + dashboard]);
					if (!DashboardCollection.get(item.id)) { 
						DashboardCollection.create(item);
					} else {
						console.log('Dashboard already exists');
					}
				});

				this.popup.remove();
			}.bind(this);

			reader.readAsDataURL(file);
		}

	});

	return ShareView;

});		