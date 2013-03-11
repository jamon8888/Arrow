define([
	'jquery',
	'underscore',
	'backbone',
	'models/datasource/DataSourceModel'
], function ($, _, Backbone, DataSourceModel) {

	'use strict';

	var DataSiftDataSourceModel = DataSourceModel.extend({

		defaults: {
			'name': 'DataSift',
			'niceName': '',
			'username': '',
			'apikey': '',
			'hash': ''
		},

		username: false,
		apikey: false, 
		hash: false,
		closed: true,

		initialize: function (attributes) {
			this.refreshAttributes(attributes);
			DataSiftDataSourceModel.__super__.initialize.apply(this);
		},

		refreshAttributes: function (attributes) {
			this.username = attributes.username;
			this.apikey = attributes.apikey;
			this.hash = attributes.hash;
		},

		/**
		 * Connect to DataSift using a websocket connection
		 * 
		 * @param  Function openEvent What to run once the onOpen event has fired
		 */
		connect: function (openEvent) {
			var url = 'ws://websocket.datasift.com';
			if (this.username && this.apikey) {
				url += '/?username=' + this.username + '&api_key=' + this.apikey;
			}

			this.socket = new WebSocket(url);
			this.socket.onopen = _.bind(openEvent || function () {}, this);
			this.socket.onmessage = _.bind(this.onMessage, this);
			this.socket.onclose = _.bind(this.onClose, this);
			this.socket.onerror = _.bind(this.onError, this);
		},

		/**
		 * When we recieve a message through the WS connection
		 * 
		 * @param  String msg
		 */
		onMessage: function (msg) {
			msg = JSON.parse(msg.data);
			if (msg.status === 'failure') {
				this.onError(msg);
				return;
			}

			// get the time for this interaction
			var time = msg.data.interaction.created_at;
			if (msg.data[msg.data.interaction.type].created_at) {
				time = msg.data[msg.data.interaction.type].created_at;
			}

			if (msg.data && msg.data.interaction && msg.data.interaction.geo) {
				msg.data.interaction.geo = msg.data.interaction.geo.latitude + ',' + msg.data.interaction.geo.longitude;
			}

			time = new Date(time);
			time = time.getTime();
			this.traverse(msg.data, '', time);
		},

		/**
		 * When we have an error
		 * 
		 * @param  String msg
		 */
		onError: function (msg) { 
			if (this.error) {
				this.error(msg);
			}
		},

		/**
		 * When the connection is closed store a flag
		 */
		onClose: function (msg) {
			this.closed = true;
		},

		/**
		 * Start the connection by sending the hash, you can only
		 * do this once the connection is open
		 * 
		 * @param  Function error
		 * @param  Function success
		 */
		start: function (error, success) {
			var start = function () {
				var msg = '{ "action":"subscribe", "hash":"' + this.hash + '", "token":"d39j2vyur9832"}';
				this.socket.send(msg);
				this.set('running', true);
				this.success();
			}.bind(this);

			if (this.closed) {
				this.connect(start);
			} else {
				start();
			}

			this.error = error;
			this.success = success;
		},

		/**
		 * Stop the connection
		 * 
		 * @param  Function error
		 * @param  Function success
		 */
		stop: function (error, success) {
			this.set('running', false);
			var msg = '{ "action":"unsubscribe", "hash":"' + this.hash + '", "token":"d39j2vyur9832"}';
			this.socket.send(msg);
			this.set('running', false);
			this.error = error;
			this.success = success;
			this.success();
		},

		/**
		 * Break up the data and store the individual key
		 * 
		 * @param  {[type]} obj  [description]
		 * @param  {[type]} name [description]
		 * @return {[type]}      [description]
		 */
		traverse: function (obj, name, time) {
			name = name ? name + '.' : '';
			for (var key in obj) {
				if (obj.hasOwnProperty(key)) {
					if (_.isArray(obj[key])) {
						this.store(this.get('id'), name + key, obj[key], time);
					} else if (_.isObject(obj[key])) {
						this.traverse(obj[key], name + key, time);
					} else {
						this.store(this.get('id'), name + key, obj[key], time);
					}
				}
			}
			// increment the bucket counter
			this.store(this.get('id'), 'Total', 1, time);
		}

	});

	return DataSiftDataSourceModel;
});