define([
	'jquery',
	'underscore',
	'backbone',
	'models/datasource/DataSourceModel',
	'models/datasource/DataSiftDataSourceModel',
	'models/datasource/GraphiteDataSourceModel'
], function ($, _, Backbone, DataSourceModel, DataSiftDataSourceModel, GraphiteDataSourceModel) {

	'use strict';

	var DataSourceManagerModel = Backbone.Model.extend({

		defaults: {
			datasources: []
		},

		initialize: function () {
			var datasources = this.get('datasources');
			
			// datasift model
			datasources.push(DataSiftDataSourceModel);
			// another model
			// datasources.push(blah);


			this.set('datasources', datasources);
		},

		/**
		 * Return the DataSource model from a name
		 * 
		 * @param  {[type]} name [description]
		 * @return {[type]}      [description]
		 */
		findDataSource: function (name) {
			var ds = this.get('datasources'),
				d = false;

			_.each(ds, function (datasource) {
				if (datasource.prototype.defaults.name === name) {
					d = datasource;
				}
			});

			return d;
		}
	});

	return new DataSourceManagerModel();

});