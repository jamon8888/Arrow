define([
	'jquery',
	'underscore',
	'backbone',
	'localstorage',
	'models/dashboard/DashboardModel'
], function ($, _, Backbone, localStorage, DashboardModel) {

	'use strict';

	var DashboardCollection = Backbone.Collection.extend({
		model: DashboardModel,
		localStorage: new Backbone.LocalStorage('DashboardCollection')
	});

	return new DashboardCollection();
});
