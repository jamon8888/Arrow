define([
	'jquery',
	'underscore',
	'backbone',
	'd3',
	'models/visualization/VisualizationModel',
	'text!templates/visualization/barchart/form.html'
], function ($, _, Backbone, d3, VisualizationModel, BarGraphFormTemplate) {

	'use strict';

	var BarChart = VisualizationModel.extend({

		x: '',
		y: '',
		legend: true,

		defaults: {
			name: 'BarChart',
			niceName: 'Bar Chart',
			userName: 'Bar Chart',
			height: 300,
			width: 300,
			showx: false,
			showy: false,
			legend: false,
			padding: 10
		},

		draw: function () {
			// do something with the data here
			console.log(this.data);
		},

		render: function (data) {
			this.data = this.process(data, this.get('x'), this.series);
			this.div = document.createElement('div');
			this.div.className = 'barchart';
			this.draw();
			return this.div;
		},

		form: function () {
			var form = _.template(BarGraphFormTemplate, this);
			return form;
		}
	});

	return BarChart;
});