define([
	'jquery',
	'underscore',
	'backbone',
	'datasift',
	'models/datasource/DataSourceModel'
], function ($, _, Backbone, DataSift, DataSourceModel) {

	'use strict';

	var DataSiftDataSourceModel = DataSourceModel.extend({

		defaults: {
			'name': 'DataSift',
			'niceName': '',
			'username': '',
			'apikey': '',
			'hash': ''
		},

		success: function () {},
		error: function () {},

		initialize: function (attributes) {

			if (!DataSift) {
				throw 'DataSift is required';
			}

			var username = attributes.username,
				apikey = attributes.apikey,
				hash = attributes.hash;

			// connect to datasift
			DataSift.connect(username, apikey);
			DataSift.register(hash, {
				onOpen: _.bind(this.success, this),
				onMessage: _.bind(this.onMessage, this),
				onClose: _.bind(this.success, this),
				onError: _.bind(this.error, this)
			});

			DataSiftDataSourceModel.__super__.initialize.apply(this);
		},

		start: function (error, success) {
			this.set('running', true);
			DataSift.start(this.get('hash'));

			this.error = error;
			this.success = success;
		},

		stop: function (error, success) {
			this.set('running', false);
			DataSift.stop(this.get('hash'));

			this.error = error;
			this.success = success;
		},

		onMessage: function (interaction) {
			// The DataSift library will only make one connection to DS, so we need to check the data we want is for this hash
			if (this.get('hash') !== interaction.hash) {
				return;
			}
			this.traverse(interaction.data);
		},

		traverse: function (obj, name) {

			name = name ? name + '.' : '';

			for (var key in obj) {

				if (obj.hasOwnProperty(key)) {
					if (_.isArray(obj[key])) {
						this.store(this.get('id'), name + key, obj[key]);
					} else if (_.isObject(obj[key])) {
						this.traverse(obj[key], name + key);
					} else {
						this.store(this.get('id'), name + key, obj[key]);
					}
				}
			}
		}

	});

	return DataSiftDataSourceModel;
});