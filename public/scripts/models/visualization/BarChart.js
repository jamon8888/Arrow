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
				range = d3.scale.linear().domain([0, maxGroup]).range([height, 0]);

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
				.attr('fill', function (d, i) { return this.colors(i); }.bind(this))
				.on('mouseover', _.bind(this.mouseOver, this))
				.on('mouseout', _.bind(this.mouseOut, this));

			if (showy) {
				var yaxis = chart.append('g')
					.attr('class', 'yaxis')
					.attr('transform', 'translate(' + 40 + ',0)')
					.call(d3.svg.axis().scale(range).orient('left').ticks(5));
			}

			if (showx && (showy ? (width - yWidth) : width) / this.data.length > 20) {
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
			} else {

			}
		},

		render: function (data, colors) {
			this.data = this.process(data, this.get('group'));
			this.div = document.createElement('div');
			this.div.className = 'barchartvis';
			this.colors = colors;

			// if we have no data
			if (this.data.length === 0) {
				this.noData();
				return this.div;
			}

			this.draw();
			return this.div;
		},

		/**
		 * When we hover over the pie, show a tooltip with the current key we are
		 * hovering
		 * 
		 * @param  {Object} evt Mouse hover event
		 */
		mouseOver: function (evt) {

			this.tooltip = document.createElement('div');
			this.tooltip.id = 'tooltip';
			this.tooltip.innerHTML = evt.label;

			$(this.tooltip).css({
				'left': (window.pageXOffset + d3.event.clientX) + 'px',
				'top': (window.pageYOffset + d3.event.clientY) + 'px'
			});

			document.body.appendChild(this.tooltip);
		},

		/**
		 * Just remove the tooltip when we mouse out
		 *
		 * @todo This could be down a lot better, currently this will flickr if you hover
		 * the tooltip
		 * 
		 * @param  {Object} evt mouse out event
		 */
		mouseOut: function (evt) {
			$(this.tooltip).remove();
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