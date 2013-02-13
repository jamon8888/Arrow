define([
	'jquery',
	'underscore',
	'backbone',
	'collections/dashboard/DashboardCollection',
	'models/sync/SyncModel',
	'views/sidebar/SidebarView',
	'views/content/ContentView'
], function($, _, Backbone, DashboardCollection, SyncModel, SidebarView, ContentView) {
	
	'use strict';

	var initialize = function () {

		var load = function () {
			DashboardCollection.fetch({
				success: function (collection) {

					var sv = new SidebarView(),
						cv = new ContentView();

					sv.render(collection); 
					cv.render(collection);
				},
				error: function () {
					console.log('No dashboards to load up');
				}
			});
		};

		var location = window.location,
			path = location.pathname,
			host = location.host;

		path = path.split('/');
		if (path && _.indexOf(path, 'dashboard') !== -1) {

			var ws = new WebSocket('ws://' + host);
			ws.onopen = function () {
				ws.send(JSON.stringify({
					'key': path[2]
				}));
				ws.onmessage = function (data) {
					data = JSON.parse(data.data);
					SyncModel.importData(data);
					load();
				};
			};			
		} else {
			load();
		}
	};

	return {
		initialize: initialize
	};
});
