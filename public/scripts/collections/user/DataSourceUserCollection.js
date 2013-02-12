define([
	'jquery',
	'underscore',
	'backbone',
	'localstorage',
	'models/user/DataSourceUserModel'
], function ($, _, Backbone, localStorage, DataSourceUserModel) {

	'use strict';

	var DataSourceUserCollection = Backbone.Collection.extend({
		model: DataSourceUserModel,
		localStorage: new Backbone.LocalStorage('DataSourceCollection')
	});

	return new DataSourceUserCollection();
});
