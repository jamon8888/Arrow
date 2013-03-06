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
			this.model.on('addviz', this.render, this);
			this.model.get('visualizations').on('change', this.changeVisualizations, this);
			this.model.get('visualizations').on('remove', this.changeVisualizations, this);
			this.model.on('change:hidden', this.update, this);
			this.model.on('change:startTime', this.render, this);
			this.model.on('change:endTime', this.render, this);
			this.model.on('change:color', this.render, this);
		},

		render: function () {
			this.$el.html('');
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

			var view = new VisualizationView({
					model: this.model,
					chart: chart
				}),
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
			charts.each(this.addChart, this);
		},

		createVisualization: function () {
			new CreateVisualization({model: this.model});
		},

		changeVisualizations: function (model, collection) {
			this.model.set('visualizations', this.model.get('visualizations'));
			this.model.save();
		}
	});

	return DashboardView;
});