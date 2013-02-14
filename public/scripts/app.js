define([
	'jquery',
	'underscore',
	'backbone',
	'collections/dashboard/DashboardCollection',
	'models/sync/SyncModel',
	'views/sidebar/SidebarView',
	'views/content/ContentView',
	'views/header/HeaderView'
], function($, _, Backbone, DashboardCollection, SyncModel, SidebarView, ContentView, HeaderView) {
	
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

					var sv = new SidebarView(),
						cv = new ContentView(),
						hv = new HeaderView();

					sv.render(collection); 
					cv.render(collection);
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
					data = JSON.parse(data.data);
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
