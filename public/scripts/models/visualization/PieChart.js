define([
	'jquery',
	'underscore',
	'backbone',
	'd3',
	'models/visualization/VisualizationModel',
	'text!templates/visualization/piechart/form.html'
], function ($, _, Backbone, d3, VisualizationModel, PieChartFormTemplate) {

	'use strict';

	var PieChart = VisualizationModel.extend({

		data: false,
		svg: false,
		div: false,
		pie: false,
		arc: false,
		arcs: [],

		defaults: {
			name: 'PieChart',
			niceName: 'Pie Chart',
			userName: 'Pie Chart',
			height: 300,
			width: 300,
			showlegend: false,
			padding: 0,
			group: false
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

		draw: function () {

			this.pie = d3.layout.pie().sort(null).value(function (v) {
				return v.value;
			});

			var radius = (parseInt(this.get('width'), 10) / 2) - 40;

			this.arc = d3.svg.arc().innerRadius(radius - 70).outerRadius(radius);

			this.svg = d3.select(this.div)
				.append('svg')
				.attr('width', this.get('width'))
				.attr('height', this.get('height') - 40)
			.append('g')
				.attr('transform', 'translate(' + (this.get('width')/2) + ',' +  ((this.get('height') - 40)/2) + ')')
				.attr('class', 'pie');

			var colors = d3.scale.ordinal().domain([0, this.data.length-1]).range(COLOR);

			this.arcs = this.svg.selectAll('path')
				.data(this.pie(this.data))
			.enter()
				.append('path')
				.attr('fill', function (d, i) { return colors(i); })
				.attr('d', this.arc)
				.on('mouseover', _.bind(this.mouseOver, this))
				.on('mouseout', _.bind(this.mouseOut, this));
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
			this.tooltip.innerHTML = evt.data.label;

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

		render: function (data) {

			this.data = this.process(data, this.get('group'));
			this.div = document.createElement('div');
			this.div.className = 'PieChart';
			this.draw();

			return this.div;
		},

		form: function () {
			var form = _.template(PieChartFormTemplate, {
				'group': this.get('group')
			});
			return form;
		}
	});

	return PieChart;
});