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
			allColors: ['#f04747', '#00afd4', '#ebaf3c', '#38b87c', '#e9662c'],
			color: '#e9e9e9',
			startTime: false,
			endTime: false
		},

		getCharts: function () {
			return this.visualizations;
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