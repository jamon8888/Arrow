define([
	'jquery',
	'underscore',
	'backbone',
	'views/sidebar/DashboardListView',
	'views/popup/PopupView',
	'views/sidebar/DataSourceView',
	'views/sidebar/ShareView',
	'collections/dashboard/DashboardCollection',
	'models/datasource/DataSourceManagerModel',
	'models/user/DataSourceUserModel'
], function ($, _, Backbone, DashboardListView, PopupView, DataSourceView, ShareView, DashboardCollection, DataSourceManagerModel, DataSourceUserModel) {

	'use strict';

	/**
	 * Create the sidebar
	 */
	var SidebarView = Backbone.View.extend({

		el: $('aside'),

		events: {
			'click #createdashboard': 'showDialog',
			'click #preferences': 'openDataSources',
			'click #share': 'share',
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
		},

		share: function () {
			var sv = new ShareView();
			sv.render();
		}
	});

	return SidebarView;
});