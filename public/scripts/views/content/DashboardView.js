define([
	'jquery',
	'underscore',
	'backbone',
	'vent',
	'collections/dashboard/DashboardCollection',
	'views/content/CreateVisualization',
	'views/content/VisualizationView'
], function ($, _, Backbone, vent, DashboardCollection, CreateVisualization, VisualizationView) {

	'use strict';

	var DashboardView = Backbone.View.extend({

		tagName: 'div',

		events: {
			'click .add': 'createVisualization'
		},

		initialize: function () {
			this.model.get('visualizations').on('add', this.addChart, this);
			this.model.get('visualizations').on('change', this.saveVisualizations, this);
			this.model.get('visualizations').on('remove', this.saveVisualizations, this);
			this.model.on('change', this.update, this);
		},

		render: function () {
			this.update();
			// add all the visulizations
			this.addAllCharts(this.model.get('visualizations'));
			this.$el.append('<div class="add vis"><span></span></div>');
			return this;
		},

		update: function () {
			this.model.get('hidden') ? this.$el.hide() : this.$el.show();
		},

		addChart: function (chart) {
			var view = new VisualizationView({model:chart}),
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
			this.$el.html();
			charts.each(this.addChart, this);
		},

		createVisualization: function () {
			new CreateVisualization({model: this.model});
		},

		saveVisualizations: function () {
			this.model.save();
		}
	});

	return DashboardView;
});