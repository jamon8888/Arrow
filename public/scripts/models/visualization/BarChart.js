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

		defaults: {
			name: 'BarChart',
			niceName: 'Bar Chart',
			userName: 'Bar Chart',
			height: 300,
			width: 300,
			showx: false,
			showy: false,
			group: false
		},

		draw: function () {

			var width = this.get('width'),
				height = this.get('height') - 40,
				group = this.get('group'),
				showx = this.get('showx'),
				showy = this.get('showy'),
				yWidth = 40;

			var maxGroup = d3.max(this.data, function (d) { return d.value; }),
				range = d3.scale.linear().domain([0, maxGroup]).range([height, 0]),
				colors = d3.scale.ordinal().domain([0, this.data.length-1]).range(COLOR);

			var rangeX = function (i) {
				return showy ? (((width-yWidth) / this.data.length) * i) + yWidth : i * (width / this.data.length);
			}.bind(this);

			var chart = d3.select(this.div)
				.append('svg')
				.attr('width', width)
				.attr('height', height);

			chart.selectAll('rect')
				.data(this.data)
			.enter()
				.append('rect')
				.attr('x',function(d, i){ return rangeX(i); }.bind(this))
				.attr('y', function (d) { return range(d.value); })
				.attr('height', function (d) { return height - range(d.value) ; })
				.attr('width', function (d) { return (showy ? (width - yWidth) : width) / this.data.length; }.bind(this))
				.attr('fill', function (d, i) { return colors(i); });

			if (showy) {
				var yaxis = chart.append('g')
					.attr('class', 'yaxis')
					.attr('transform', 'translate(' + 40 + ',0)')
					.call(d3.svg.axis().scale(range).orient('left').ticks(5));
			}

			console.log(this.data);

			if (showx) {
				var xaxis = chart.append('g')
					.attr('class', 'xaxis')
					.attr('transform', 'translate(' + 0 + ',' + (height - 20) + ')');

				xaxis.selectAll('text')
					.data(this.data)
				.enter()
					.append('text')
					.attr('y', function (d, i) { 
						return rangeX(i) +  (((width - yWidth) / this.data.length) / 2); 
					}.bind(this))
					.attr('transform', 'rotate(-90)')
					.text(function (d) {
						return d.label;
					});
			}
		},

		render: function (data) {
			this.data = this.process(data, this.get('group'));
			this.div = document.createElement('div');
			this.div.className = 'barchartvis';
			this.draw();
			return this.div;
		},

		process: function (data, group) {

			var newData = [],
				countObj = {};

			// find them all based over time
			_.each(data, function (obj) {
				this.loop(obj.keys, function (key, parent) {
					if (key === group) {
						newData.push(parent);
					}
				});
			}.bind(this));

			_.each(newData, function (data) {
				for (var key in data) {
					if (data.hasOwnProperty(key)) {
						if (countObj[key] === undefined) {
							countObj[key] = 0;
						}
						countObj[key] += data[key];
					}
				}
			});

			newData = [];
			for (var label in countObj) {
				newData.push({
					value: countObj[label],
					label: label
				});
			}

			return newData;
		},

		form: function () {
			var form = _.template(BarGraphFormTemplate, {
				'group': this.get('group')
			});
			return form;
		}
	});

	return BarChart;
});