define([
	'jquery',
	'underscore',
	'backbone',
	'models/datasource/DataSourceManagerModel'
], function ($, _, Backbone, DataSourceManagerModel) {

	'use strict';

	var DataSourceUserModel = Backbone.Model.extend({

		running: false,

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
		 * @param Object error		What happens if we get an error
		 * @param Object success	What happens on success
		 */
		start: function (error, success) {
			if (this.datasource === undefined) {
				this.datasource = this.getDataSource();
			}
			this.datasource.start(error, success);
			this.running = true;
		},

		/**
		 * Stop the datasource
		 *
		 * @param Object error		What happens if we get an error
		 * @param Object success	What happens on success
		 */
		stop: function (error, success) {
			this.datasource.stop(error, success);
			this.running = false;
		},

		/**
		 * Get whether the current datasource is running
		 * 
		 * @return {String} running | paused
		 */
		getActivityStatus: function () {
			return this.running ? 'running' : 'paused';
		}
	});

	return DataSourceUserModel;
});