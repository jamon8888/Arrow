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
			visualizations: new VisualizationCollection(),
			allColors: ['#f04747', '#00afd4', '#ebaf3c', '#38b87c', '#e9662c'],
			color: '#e9e9e9',
			startTime: false,
			endTime: false
		},

		set: function(attributes, options) {

		    if (attributes.visualizations !== undefined && !(attributes.visualizations instanceof VisualizationCollection)) {
				var visualizationCollection = new VisualizationCollection();

				_.each(attributes.visualizations, function (vis) {
					var Visulation = VisualizationManagerModel.findVisualization(vis.name);

					if (vis.id === undefined) {
						vis.id = _.uniqueId('v');
					}

					var mod = new Visulation(vis);

					visualizationCollection.add(mod);
				});

		        attributes.visualizations = visualizationCollection;
		    }
		    return Backbone.Model.prototype.set.call(this, attributes, options);
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
			var visualizations = this.get('visualizations');
			visualizations.add(vis);
			this.set('visualizations', visualizations);
			this.save();
		}

	});

	return DashboardModel;
});