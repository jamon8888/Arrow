define([
	'jquery',
	'underscore',
	'backbone',
	'collections/user/DataSourceUserCollection',
	'collections/dashboard/DashboardCollection',
	'views/sidebar/DataSourceListView',
	'views/sidebar/DashboardListView',
	'views/sidebar/CreateDataSourceView'
], function ($, _, Backbone, DataSourceUserCollection, DashboardCollection, DataSourceListView, DashboardListView, CreateDataSourceView) {

	'use strict';

	/**
	 * Create the sidebar
	 */
	var SidebarView = Backbone.View.extend({

		el: $('aside'),

		events: {
			'mousedown #addDataSource': 'addDataSource',
			'mousedown #createdashboard': 'showCreateDashboard',
			'keyup #newdashboard input': 'createDashboard'
		},

		render: function () {
			// loading spinner
			this.$el.addClass('loading');

			// fetch the datasource
			DataSourceUserCollection.fetch({
				success: _.bind(this.renderDataSources, this),
				error: function () {}
			});

			// fetch the dashboards
			DashboardCollection.fetch({
				success: _.bind(this.renderDashboards, this)
			});
		},

		renderDataSources: function (collection) {
			var dsv = new DataSourceListView();
			dsv.render(collection);
		},

		renderDashboards: function (collection) {
			var dlv = new DashboardListView();
			dlv.render(collection);
		},

		addDataSource: function () {
			var cdsv = new CreateDataSourceView();
			cdsv.render();
		},

		/**
		 * Create a new Dashboard
		 */
		showCreateDashboard: function () {
			$('#newdashboard').show();
			$('#newdashboard input').val('');
			$('#newdashboard input').focus();
		},

		/**
		 * When the user presses enter create a new Dashboard
		 */
		createDashboard: function (e) {
			if (e.keyCode === 13) {

				DashboardCollection.each(function (d) {
					d.hide();
				});

				var ds = DashboardCollection.create({
					'title': $('#newdashboard input').val(),
					'hidden': false
				});
				$('#newdashboard').hide();
			}
		}
	});

	return SidebarView;
});