define([
	'jquery',
	'underscore',
	'backbone',
	'collections/dashboard/DashboardCollection',
	'collections/visualization/VisualizationCollection',
	'models/sync/SyncModel',
	'views/sidebar/SidebarView',
	'views/content/ContentView',
	'views/header/HeaderView'
], function($, _, Backbone, DashboardCollection, VisualizationCollection, SyncModel, SidebarView, ContentView, HeaderView) {
	
	'use strict';

	var initialize = function () {

		var location = window.location,
			path = location.pathname,
			host = location.host;

		path = path.split('/');

		/**
		 * Load up all the views
		 * @return {[type]} [description]
		 */
		var start = function () {
			DashboardCollection.fetch({
				success: function (collection) {

					// fetch all the visualisations
					VisualizationCollection.fetch({
						success: function (visualisations) {
							var cv = new ContentView();
							cv.render(collection);
						}
					});

					var sv = new SidebarView(),
						hv = new HeaderView();

					sv.render(collection); 
					hv.render();
				},
				error: function () {
					console.log('No dashboards to load up');
				}
			});
		};

		// are we loading up a pre existing dashboard
		if (path && _.indexOf(path, 'dashboard') !== -1) {
			var ws = new WebSocket('ws://' + host);
			ws.onopen = function () {
				ws.send(JSON.stringify({'key': path[2]}));
				ws.onmessage = function (data) {
					SyncModel.importData(data);
					start();
				};
			};		
		} else {
			start();
		}
	};

	return {
		initialize: initialize
	};
});
