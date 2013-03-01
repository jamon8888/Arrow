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
			barspacing: 1,
			padding: 10
		},

		draw: function () {

			var padding = this.get('padding'),
				width = this.get('width') - padding,
				height = this.get('height') - padding - 80,
				x = this.get('x'),
				y = this.get('y');

			var comparision = function (d, key, value) {
				if (_.isDate(d[key][value])) {
					var date = new Date(d[key][value]);
					return date.getTime();
				}
				return d[key][value];
			};

			var minX = d3.min(this.data, function (d) { return comparision(d, 'x', x); }),
				minY = d3.min(this.data, function (d) { return comparision(d, 'y', y); }),
				maxX = d3.max(this.data, function (d) { return comparision(d, 'x', x); }),
				maxY = d3.max(this.data, function (d) { return comparision(d, 'y', y); });


			var rangeX = d3.scale.linear().domain([minX, maxX]).range([0, width]),
				rangeY = d3.scale.linear().domain([minY, maxY]).range([height, 0]);

			var chart = d3.select(this.div)
				.append('svg')
				.attr('width', width)
				.attr('height', height + 40);

			chart.selectAll('rect')
				.data(this.data)
			.enter()
				.append('rect')
				.attr('x',function(d, i){ return i * width / this.data.length; }.bind(this))
				.attr('y', function (d) { return rangeY(d.y[y]); })
				.attr('height', function (d) { return height - rangeY(d.y[y]); })
				.attr('width', function (d) { return width / this.data.length; }.bind(this));

			// yaxis
			if (this.get('showy')) {
				var yaxis = chart.append('g')
					.attr('class', 'yaxis')
					.attr('transform', 'translate(' + padding + ',0)')
					.call(d3.svg.axis().scale(rangeY).orient('left').ticks(5));
			}

			// xaxis
			if (this.get('showx')) {
				var xaxis = chart.append('g')
					.attr('class', 'xaxis')
					.attr('transform', 'translate(' + padding + ',' + (height + 40 - padding) + ')')
					.call(d3.svg.axis().scale(rangeX).orient('bottom').tickValues(this.data.map(function (d) {
						return d.x[x];
					})));
			
			}

		},

		render: function (data) {
			this.data = this.process(data, this.get('x'), this.get('y'));
			this.div = document.createElement('div');
			this.div.className = 'barchartvis';
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