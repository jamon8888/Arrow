define([
	'jquery',
	'underscore',
	'backbone',
	'views/sidebar/DataSourceListItemView'
], function ($, _, Backbone, DataSourceListItemView) {

	'use strict';

	/**
	 * The list of dashboards in the sidebar
	 */
	var DataSourceListView = Backbone.View.extend({

		el: $('#datasourcelist'),

		/**
		 * Render the li
		 */
		render: function (collection) {
			this.addAllDataSources(collection);
			// watch for new dashboards to be added
			collection.on('add', this.addDataSource, this);
		},

		/**
		 * Build the datasource link
		 * 
		 * @param  {DataSourceCollection} dashboards The collection of datasources
		 */
		addDataSource: function (datasource) {
			var dv = new DataSourceListItemView({model: datasource});
			this.$el.append(dv.render().el);
		},

		/**
		 * When the datasource is loaded from storage, render all of them
		 * 
		 * @param {Backbone.Collection} DataSourceCollection
		 */
		addAllDataSources: function (datasources) {
			this.$el.html('');
			datasources.each(this.addDataSource, this);
		}
	});

	return DataSourceListView;
});
