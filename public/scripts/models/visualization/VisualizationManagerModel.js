define([
	'jquery',
	'underscore',
	'backbone',
	'models/visualization/LineGraph',
	'models/visualization/PieChart',
	'models/visualization/WordCloud',
	'models/visualization/BarChart',
	'models/visualization/WorldMap',
	'models/visualization/ListChart'
], function ($, _, Backbone, LineGraph, PieChart, WordCloud, BarChart, WorldMap, ListChart) {

	'use strict';

	var VisualizationManagerModel = Backbone.Model.extend({

		defaults: {
			visualizations: []
		},

		initialize: function () {
			var visualizations = this.get('visualizations');
			
			// line graph model
			visualizations.push(LineGraph);
			visualizations.push(PieChart);
			// the word cloud is too processor intensive
			//visualizations.push(WordCloud);
			visualizations.push(BarChart);
			visualizations.push(WorldMap);
			visualizations.push(ListChart);
			// another model
			// visualizations.push(blah);

			this.set('visualizations', visualizations);
		},

		findVisualization: function (name) {
			var vis = this.get('visualizations'),
				v = false;

			_.each(vis, function (visualizations) {
				if (visualizations.prototype.defaults.name === name) {
					v = visualizations;
				}
			});

			return v;
		}
	});

	return new VisualizationManagerModel();

});