define([
	'jquery',
	'underscore',
	'backbone',
	'models/visualization/LineGraph',
	'models/visualization/PieChart',
	'models/visualization/WordCloud',
	'models/visualization/BarChart'
], function ($, _, Backbone, LineGraph, PieChart, WordCloud, BarChart) {

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
			visualizations.push(WordCloud);
			visualizations.push(BarChart);
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