define([
	'jquery',
	'underscore',
	'backbone',
	'views/sidebar/DashboardListItemView'
], function ($, _, Backbone, DashboardListItemView) {

	'use strict';

	/**
	 * The list of dashboards in the sidebar
	 */
	var DashboardListView = Backbone.View.extend({

		el: $('#dashboardlist'),

		/**
		 * Render the li
		 */
		render: function (collection) {
			this.collection = collection;
			this.addAllDashboards(this.collection);
			// watch for new dashboards to be added
			collection.on('add', this.addDashboard, this);
			collection.on('remove', this.removeDashboard, this);
		},

		/**
		 * Build the dashboard link
		 * 
		 * @param  {DashboardCollection} dashboards The collection of dashboards
		 */
		addDashboard: function (dashboard) {
			var dv = new DashboardListItemView({model: dashboard});
			this.$el.append(dv.render().el);
		},

		/**
		 * When the dashboard is loaded from storage, render all of them
		 * 
		 * @param {Backbone.Collection} dashboards Collection of dashboard
		 */
		addAllDashboards: function (dashboards) {
			this.$el.html('');
			dashboards.each(this.addDashboard, this);
		},

		removeDashboard: function () {
			this.addAllDashboards(this.collection);
		}
	});

	return DashboardListView;
});
