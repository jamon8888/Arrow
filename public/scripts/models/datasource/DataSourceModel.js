define([
	'jquery',
	'underscore',
	'backbone',
	'vent',
	'models/datasource/StoreModel'
], function ($, _, Backbone, vent, StoreModel) {

	'use strict';

	var DataSourceModel = Backbone.Model.extend({

		// is this ds running
		running: false,

		/**
		 * When we edit our datasource and we want to restart it, we need to refresh all the attributes
		 * 
		 * @param  {[type]} attributes [description]
		 */
		refreshAttributes: function (attributes) {
			throw 'Your DataSource doesnt support refreshing of attributes';
		},

		/**
		 * Store the key into the bucket
		 *
		 * @param	{String}	prefix	The prefix to store the data under
		 * @param	{String}	key		The unquie key
		 * @param	{int}		value	The number to increment the counter by
		 * @param	{time}		time	The time that this key/value happen, will be converted into a JS Date object
		 */
		store: function (prefix, key, value, time) {
			StoreModel.store(prefix, key, value, time);
		},

		/**
		 * Take the data and find all the keys, then narrow them down to our search criteria
		 * 
		 * @param  {[type]} search [description]
		 * @return {[type]}        [description]
		 */
		findKey: function (prefix, search) {
			return StoreModel.findKey(prefix, search);
		},

		/**
		 * This method should be available on all datasources, in certain situations with non-live datasources
		 * will be pointless, in that case it should just return true
		 */
		stop: function () {
			throw 'Your DataSource doesn\'t have a pause method';
		},

		/**
		 * This method should be available on all datasources, in certain situations with non-live datasources
		 * will be pointless, in that case it should just return true
		 */
		start: function () {
			throw 'Your DataSource doesn\'t have a play method';
		},

		/**
		 * Retrieve all the data out of the store
		 * 
		 * @return {[type]} [description]
		 */
		getData: function () {
			return StoreModel.getData();
		}
	});

	return DataSourceModel;
});