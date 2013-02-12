define([
	'jquery',
	'underscore',
	'backbone',
	'models/datasource/DataSourceManagerModel'
], function ($, _, Backbone, DataSourceManagerModel) {

	'use strict';

	var DataSourceUserModel = Backbone.Model.extend({


		createDataSource: function () {
			_.each(DataSourceManagerModel.get('datasources'), function (DataSource) {
				if (DataSource.prototype.defaults.name === this.get('name')) {
					this.datasource = new DataSource(this.toJSON());
				}
			}.bind(this));

			return this.datasource;
		},

		getDataSource: function () {
			return this.datasource === undefined ? this.createDataSource() : this.datasource;
		},

		/**
		 * Start the datasource
		 * 
		 * @return {[type]} [description]
		 */
		start: function () {

			if (this.datasource === undefined) {
				this.datasource = this.getDataSource();
			}

			this.datasource.play();
		},

		/**
		 * Stop the datasource
		 * 
		 * @return {[type]} [description]
		 */
		stop: function () {
			this.datasource.pause();
		}
	});

	return DataSourceUserModel;
});