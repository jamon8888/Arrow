define([
	'jquery',
	'underscore',
	'backbone',
	'vent',
	'collections/user/DataSourceUserCollection'
], function ($, _, Backbone, vent, DataSourceUserCollection) {

	'use strict';

	var VisualizationModel = Backbone.Model.extend({

		// where are we getting this data from
		datasource: false,

		defaults: {
			title: '',
			datasource: false,
			dashboard: false
		},

		/**
		 * Generic Loop function because we will be looping a lot
		 * 
		 * @param  {[type]} obj  [description]
		 * @param  {[type]} func [description]
		 * @return {[type]}      [description]
		 */
		loop: function (obj, func) {
			for (var key in obj) {
				if (obj.hasOwnProperty(key)) {
					func(key, obj[key]);
				}
			}
		},

		getDataSource: function () {
			return DataSourceUserCollection.get(this.get('datasource')).getDataSource();
		},

		findex: function (key) {
			var keys = key.split('.');
			return {
				'key': keys.splice(0, keys.length - 1).join('.') || keys[0],
				'item': keys[0],
				'original': key
			};
		},

		prefix: function () {
			return this.get('datasource');
		},

		set: function (attributes, options) {
			// we need to update our instance
			if (this.instance) {
				this.instance.set(attributes, options);
			}
			Backbone.Model.prototype.set.call(this, attributes, options);
		},

		setInstance: function (instance) {
			if (!this.instance) {
				this.instance = instance;
			}
		},

		getInstance: function () {
			return this.instance;
		},

		/**
		 * Turn the default dataset arrow provides into the data we need
		 * 
		 * @param  {[type]} data [description]
		 */
		process: function (data, x, y) {

			// what are we looking for
			var cData = [];

			var xIndex = false,
				yIndex = false;

			if (typeof(x) === 'string') {
				xIndex = [this.findex(x)];
			} else {
				xIndex = _.map(x, this.findex);
			}

			if (typeof(y) === 'string') {
				yIndex = [this.findex(y)];
			} else {
				yIndex = _.map(y, this.findex);
			}


			// loop through to find the correct data
			_.each(data, function (item) {
				var tmpData = {x: {}, y: {}};

				// loop the properties in the bucket
				
				for (var key in item.keys) {

					/**
					 * Pull out the value from the array
					 */
					var check = function (index) {
						// if we are looking at time
						if (index.key === 'Time') {
							return new Date(item.timestamp);
						}
						// if we are looking at anything else, pluck it out
						if (index.key === key) {
							for (var section in item.keys[key]) {
								if (index.item === section) {
									return item.keys[key][section];
								}
							}
						}
					};

					if (tmpData.x.length !== xIndex.length) {
						_.each(xIndex, function(item) {
							var val = check(item);
							if (val) { tmpData.x[item.original] = val; }
						});
					}

					if (tmpData.y.length !== yIndex.length) {
						_.each(yIndex, function(item) {
							var val = check(item);
							if (val) { tmpData.y[item.original] = val; }
						});
					}
				}

				// push the data into our array
				cData.push(tmpData);

			}.bind(this));

			return cData;
		}
	});

	return VisualizationModel;
});