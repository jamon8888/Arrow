define([
	'jquery',
	'underscore',
	'backbone',
	'vent'
], function ($, _, Backbone, vent) {

	'use strict';

	var DataSourceModel = Backbone.Model.extend({

		// datastore
		data: {},
		// blacklist of keys
		blacklist: [],
		// size of the blacklist buffer
		bufferSize: 50,
		// how large is the bucket (milliseconds)
		bucketSize: 10000,
		// current bucket
		bucket: {},
		// an array of all the keys
		keys: {},
		// is this ds running
		running: false,

		initialize: function () {
			var data = localStorage.getItem('data');
			if (data) {
				this.data = JSON.parse(data);
			}
		},

		/**
		 * We store a string as a count of the number of times it's appeared in a bucket
		 * 
		 * @param  {Object} bucket
		 * @param  {String} value
		 */
		storeString: function (bucket, value) {
			if (bucket[value] === undefined) {
				bucket[value] = 0;
			}
			bucket[value]++;
		},

		/**
		 * We only store culmative counts for numbers
		 * 
		 * @param  {[type]} bucket [description]
		 * @param  {[type]} value  [description]
		 */
		storeNumber: function (bucket, value) {

			// if our bucket is empty, apply our default values
			if (_.isEmpty(bucket)) {
				_.extend(bucket, { 'sum': 0, 'count': 0 });
			}

			bucket.count++;
			bucket.sum += value;
			bucket.average = bucket.sum / bucket.count;

			// min
			if (bucket.min > value || !bucket.min) {
				bucket.min = value;
			}
			// max
			if (bucket.max < value || !bucket.max) {
				bucket.max = value;
			}
		},

		/**
		 * Convert the array into it's base elements and store them
		 * 
		 * @param  {[type]} bucket [description]
		 * @param  {[type]} value  [description]
		 */
		storeArray: function (bucket, value) {
			_.each(value, function (item) {
				if (_.isString(item)) {
					this.storeString(bucket, item);
				} else if (_.isNumber(item)) {
					this.storeNumber(bucket, item);
				}
			}.bind(this));
		},

		/**
		 * Store a latlng
		 * 
		 * @param  {[type]} bucket [description]
		 * @param  {[type]} value  [description]
		 * @return {[type]}        [description]
		 */
		storeLatLong: function (bucket, value) {

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

			// work out the bucket we are in
			var current = Date.now(),
				bucket = Math.round(current / this.bucketSize) * this.bucketSize,
				data = this.data;

			if (this.bucket[prefix] !== bucket) {
				vent.trigger('arrow:data:' + prefix, this.data[prefix]);

				console.log('triggering: arrow:data:' + prefix);

				this.save();
				this.bucket[prefix] = bucket;
			}

			if (time) {
				var d = new Date(time);
				bucket = d.getTime();
			}

			if (data[prefix] === undefined) {
				data[prefix] = {};
				this.keys[prefix] = [];
			}

			// create the bucket
			if (data[prefix][bucket] === undefined) {
				data[prefix][bucket] = {}; 
			}

			if (data[prefix][bucket][key] === undefined) {
				data[prefix][bucket][key] = {};
			}

			// if the buffer grows to big, add to the blacklist
			if (_.keys(data[prefix][bucket][key]).length > this.bufferSize) {
				// this is currently across all prefixes
				this.blacklist.push(key);
			} 

			// if the key is in the black list, shift an item off
			if (_.indexOf(this.blacklist, key) !== -1) {
				return;
			}

			// store the value
			if (_.isString(value)) {
				this.storeString(data[prefix][bucket][key], value);
			} else if (_.isNumber(value)) {
				this.storeNumber(data[prefix][bucket][key], value);
			} else if (_.isArray(value)) {
				this.storeArray(data[prefix][bucket][key], value);
			} else if (value === null) {
				// 
			}
		},

		/**
		 * Take the data and find all the keys, then narrow them down to our search criteria
		 * 
		 * @param  {[type]} search [description]
		 * @return {[type]}        [description]
		 */
		findKey: function (prefix, search) {


			if (this.keys[prefix] === undefined || this.keys[prefix].length === 0) {
				// populate the keys object
				
				this.keys[prefix] = [];

				for (var bucket in this.data[prefix]) {
					if (this.data[prefix].hasOwnProperty(bucket)) {
						for (var key in this.data[prefix][bucket]) {
							if (this.data[prefix][bucket].hasOwnProperty(key)) {
								_.keys(this.data[prefix][bucket][key]).forEach(function (k) {
									this.keys[prefix].push(key + '.' + k);
								}.bind(this));
							}
						}
					}
				}
				this.keys[prefix] = _.uniq(this.keys[prefix]);

				this.keys[prefix].unshift('Time');
				this.keys[prefix].unshift('Total');
			}

			return this.keys[prefix].filter(function (item) {
				return item.indexOf(search) !== -1;
			});
		},

		/**
		 * This method should be available on all datasources, in certain situations with non-live datasources
		 * will be pointless, in that case it should just return true
		 */
		pause: function () {
			throw 'Your DataSource doesn\'t have a pause method';
		},

		/**
		 * This method should be available on all datasources, in certain situations with non-live datasources
		 * will be pointless, in that case it should just return true
		 */
		play: function () {
			throw 'Your DataSource doesn\'t have a play method';
		},

		save: function () {
			localStorage.setItem('data', JSON.stringify(this.data));
		},

		getData: function () {
			return this.data;
		}
	});

	return DataSourceModel;
});