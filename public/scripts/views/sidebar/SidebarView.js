define([
	'jquery',
	'underscore',
	'backbone',
	'views/sidebar/DashboardListView',
	'views/popup/PopupView',
	'views/sidebar/DataSourceView',
	'collections/dashboard/DashboardCollection',
	'models/datasource/DataSourceManagerModel',
	'models/user/DataSourceUserModel'
], function ($, _, Backbone, DashboardListView, PopupView, DataSourceView, DashboardCollection, DataSourceManagerModel, DataSourceUserModel) {

	'use strict';

	/**
	 * Create the sidebar
	 */
	var SidebarView = Backbone.View.extend({

		el: $('aside'),

		events: {
			'click #createdashboard': 'showDialog',
			'mousedown #preferences': 'openDataSources',
			'keyup #newdashboard input': 'createDashboard'
		},

		/**
		 * Render the properties into the sidebar
		 */
		render: function (collection) {
			var dlv = new DashboardListView();
			dlv.render(collection);
		},

		/**
		 * Create a new Dashboard
		 *
		 * This will open up a dialog box
		 */
		showDialog: function () {
			$('#newdashboard').show();
			$('#newdashboard input').val('');
			$('#newdashboard input').focus();
		},

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
		},

		openDataSources: function () {
			var dv = new DataSourceView({model: DataSourceManagerModel});
			dv.render();
		}
	});

	return SidebarView;
});