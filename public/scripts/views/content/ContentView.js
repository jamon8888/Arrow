define([
	'jquery',
	'underscore',
	'backbone',
	'vent',
	'collections/dashboard/DashboardCollection',
	'collections/user/DataSourceUserCollection',
	'views/content/DashboardView'
], function ($, _, Backbone, vent, DashboardCollection, DataSourceUserCollection, DashboardView) {

	var ContentView = Backbone.View.extend({

		el: $('content'),

		initialize: function () {
			this.dashboards = {};
		},

		render: function (collection) {
			// watch for new dashboards to be added
			collection.on('add', this.addDashboard, this);
			collection.on('remove', this.removeDashboard, this);

			// load in all the datasources, if we don't already have them
			if (DataSourceUserCollection.length === 0) {
				DataSourceUserCollection.fetch({
					success: function () {
						this.addAllDashboards(DashboardCollection);
					}.bind(this)
				});
			} else {
				this.addAllDashboards(DashboardCollection);
			}
		},

		/**
		 * Build the dashboard link
		 * 
		 * @param  {DashboardCollection} dashboards The collection of dashboards
		 */
		addDashboard: function (dashboard) {
			var dv = new DashboardView({model:dashboard});
			this.$el.append(dv.render().el);
			this.dashboards[dashboard.cid] = dv;
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

		/**
		 * Remove the dashboard from the view, and the model
		 * 
		 * @param  {[type]} dashboard [description]
		 * @return {[type]}           [description]
		 */
		removeDashboard: function (dashboard) {
			var instance = this.dashboards[dashboard.cid];
			instance.remove();
			delete(instance);
		}
	});

	return ContentView;
});