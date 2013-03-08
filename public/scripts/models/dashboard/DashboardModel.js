define([
	'jquery',
	'underscore',
	'backbone',
	'collections/visualization/VisualizationCollection',
	'models/visualization/VisualizationManagerModel'
], function ($, _, Backbone, VisualizationCollection, VisualizationManagerModel) {

	'use strict';

	var DashboardModel = Backbone.Model.extend({

		defaults: {
			title: '',
			hidden: true,
			color: '#e9e9e9',
			allColors: ['#f04747', '#00afd4', '#ebaf3c', '#38b87c', '#e9662c'],
			startTime: false,
			endTime: false
		},

		show: function () {
			this.set('hidden', false);
			this.save();
		},

		hide: function () {
			this.set('hidden', true);
			this.save();
		},

		addVisualization: function (vis) {
			vis.set('dashboard', this.id);
			VisualizationCollection.create(vis);
		}

	});

	return DashboardModel;
});