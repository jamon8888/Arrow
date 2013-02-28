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
		currentTime: {},
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
		 * When we edit our datasource and we want to restart it, we need to refresh all the attributes
		 * 
		 * @param  {[type]} attributes [description]
		 */
		refreshAttributes: function (attributes) {
			throw 'Your DataSource doesnt support refreshing of attributes';
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

			var currentTime = Date.now(),
				suggestedTime = time ? new Date(time) : false,
				timestamp = Math.round((suggestedTime ? suggestedTime.getTime() : currentTime) / this.bucketSize) * this.bucketSize,
				timebucket = Math.round(currentTime / this.bucketSize) * this.bucketSize,
				bucket = {
					'timestamp': timestamp,
					'keys': {}
				};

			// add the datasource prefix
			if (this.data[prefix] === undefined) {
				this.data[prefix] = [];
				this.keys[prefix] = [];
			}

			// have we changed buckets
			if (this.currentTime[prefix] !== timebucket) {

				// sort the data
				this.data[prefix] = this.data[prefix].sort(function (a, b) {
					return a.timestamp - b.timestamp;
				});

				vent.trigger('arrow:data:' + prefix, this.data[prefix]);
				console.log('triggering: arrow:data:' + prefix);
				this.save();
				this.currentTime[prefix] = timebucket;
			}


			// look through the data to see if the bucket exists, we use a map to pull out the
			// correct attribute - slow!
			var bucketExist = _.indexOf(this.data[prefix].map(function (i) { 
				return i.timestamp; 
			}), timestamp);

			if (bucketExist !== -1) {
				bucket = this.data[prefix][bucketExist];
			}

			if (bucket.keys[key] === undefined) {
				bucket.keys[key] = {};
			}

			// if the buffer grows to big, add to the blacklist
			if (_.keys(bucket.keys[key]).length > this.bufferSize) {
				this.blacklist.push(key);
			}

			// if the key exists in the black list return
			if (_.indexOf(this.blacklist, key) !== -1) {
				return;
			}

			// store the value
			if (_.isString(value)) {
				// stop the string from taking too much space
				if (value.length > 100) {
					value = value.slice(0, 100);
				}
				this.storeString(bucket.keys[key], value);
			} else if (_.isNumber(value)) {
				this.storeNumber(bucket.keys[key], value);
			} else if (_.isArray(value)) {
				this.storeArray(bucket.keys[key], value);
			} else if (value === null) {
				// 
			}

			if (bucketExist === -1) {
				this.data[prefix].push(bucket);
			}	
		},

		/**
		 * Take the data and find all the keys, then narrow them down to our search criteria
		 * 
		 * @param  {[type]} search [description]
		 * @return {[type]}        [description]
		 */
		findKey: function (prefix, search) {

			var findKeys = function (bucket) {
				var keys = [];
				for (var key in bucket) {
					keys.push(key);
					for (var subkey in bucket[key]) {
						keys.push(key + '.' + subkey);
					}
				}
				return keys;
			};

			// this will cause the browser to stall so we throttle it
			var throttled = _.throttle(findKeys, 10);

			if (this.keys[prefix] === undefined || this.keys[prefix].length === 0) {
				this.keys[prefix] = [];
				_.each(this.data[prefix], function (obj) {
					this.keys[prefix] = this.keys[prefix].concat(throttled(obj.keys));
				}.bind(this));
				// remove the duplicates
				this.keys[prefix] = _.uniq(this.keys[prefix]);
				// add in the special case for Time
				this.keys[prefix].unshift('Time');
			}

			return this.keys[prefix].filter(function (item) {
				return item.indexOf(search) !== -1;
			});
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

		save: function () {

			try {
				localStorage.setItem('data', JSON.stringify(this.data));
			} catch (exception) {

				if (exception.name === "QUOTA_EXCEEDED_ERR") {

					console.log('Quota exceeded, removing data');

					for (var i = 0; i < 6; i++) {
						var min = 100000000000000000000000000000,
							prefix = '';
						// need to find the oldest key .........
						for (var key in this.data) {
							for (var bucket in this.data[key]) {
								var bucketInt = parseInt(bucket, 10);
								if (bucketInt < min) {
									prefix = key;
									min = bucketInt;
								}
							}
						}
						console.log('Deleting:' + prefix + '[' + min + ']');
						delete(this.data[prefix][min]);
					}

					console.log('Removed 60 seconds worth of data');
					this.save();
					return;
				} else {
					console.log(exception);
				}

			}
		},

		getData: function () {
			return this.data;
		}
	});

	return DataSourceModel;
});