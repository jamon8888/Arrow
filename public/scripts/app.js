define([
	'jquery',
	'underscore',
	'backbone',
	'collections/dashboard/DashboardCollection',
	'views/sidebar/SidebarView',
	'views/content/ContentView'
], function($, _, Backbone, DashboardCollection, SidebarView, ContentView) {
	
	'use strict';

	var initialize = function () {
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

	return {
		initialize: initialize
	};
});
