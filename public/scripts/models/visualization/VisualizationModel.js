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
			datasource: false
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
			this.loop(data, function (timestamp, obj) {
				var tmpData = {x: {}, y: {}};

				// loop the properties in the bucket
				this.loop(obj, function (key1, value1) {

					var check = function (index) {
						if (index.key === 'Time') {
							return new Date(parseInt(timestamp, 10));
						}

						if (index.key === key1) {
							for (var item in value1) {
								if (value1.hasOwnProperty(item) && index.item === item) {
									return value1[item];
								}
							}	
						}
					};

					if (tmpData.x.length !== xIndex.length) {
						_.each(xIndex, function(item) {
							var val = check(item);
							if (val) tmpData.x[item.original] = val;
						});
					}

					if (tmpData.y.length !== yIndex.length) {
						_.each(yIndex, function(item) {
							var val = check(item);
							if (val) tmpData.y[item.original] = val;
						});
					}
				}.bind(this));

				// push the data into our array
				cData.push(tmpData);
			}.bind(this));

			return cData;
		}
	});

	return VisualizationModel;
});