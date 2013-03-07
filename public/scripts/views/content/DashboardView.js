define([
	'jquery',
	'underscore',
	'backbone',
	'vent',
	'collections/dashboard/DashboardCollection',
	'collections/visualization/VisualizationCollection',
	'views/content/CreateVisualization',
	'views/content/VisualizationView'
], function ($, _, Backbone, vent, DashboardCollection, VisualisationCollection, CreateVisualization, VisualizationView) {

	'use strict';

	var DashboardView = Backbone.View.extend({

		tagName: 'div',

		events: {
			'mousedown .add': 'createVisualization'
		},

		initialize: function () {
			VisualisationCollection.on('add', this.render, this);
			
			this.model.on('change:hidden', this.update, this);
			this.model.on('change:startTime', this.render, this);
			this.model.on('change:endTime', this.render, this);
			this.model.on('change:color', this.render, this);
		},

		render: function () {

			var visualisations = VisualisationCollection.where({dashboard: this.model.id});
			// wipe the content
			this.$el.html('');
			// toggle
			this.toggle();

			// add all the visulizations
			this.addAllCharts(visualisations);
			// now append our special add block
			this.$el.append('<div class="add vis"><span></span></div>');
			return this;
		},

		toggle: function () {
			if (this.model.get('hidden')) {
				this.$el.hide();
			} else {
				this.$el.show();
			}
		},

		addChart: function (chart) {

			var view = new VisualizationView({ model: chart, dashboard: this.model}),
				data = chart.getDataSource().getData(),
				addNew = $('.add.vis', this.$el),
				html = view.render(data[chart.get('datasource')]).el;

			if (addNew.is(':visible')) {
				addNew.before(html);
			} else {
				this.$el.append(html);
			}
		},

		addAllCharts: function (charts) {
			_.each(charts, _.bind(this.addChart, this));
		},

		createVisualization: function () {
			new CreateVisualization({model: this.model});
		}
	});

	return DashboardView;
});