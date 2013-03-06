define([
	'jquery',
	'underscore',
	'backbone',
	'd3',
	'models/visualization/VisualizationModel',
	'text!templates/visualization/linegraph/form.html'
], function ($, _, Backbone, d3, VisualizationModel, LineGraphFormTemplate) {

	'use strict';

	var LineGraph = VisualizationModel.extend({

		lines: {},
		paths: {},
		xfunc: false,
		yfunc: false,
		xaxis: false,
		yaxis: false,
		svg: false,
		div: false,
		x: '',
		series: [],
		legend: [],

		defaults: {
			name: 'LineGraph',
			niceName: 'Line Graph',
			userName: 'Line Graph',
			height: 300,
			width: 300,
			showx: false,
			showy: false,
			legend: false,
			padding: 10
		},

		/**
		 * Find the max or min value of all the fields for this point
		 * 
		 * @param  {Array} data	
		 * @return {Int}		The highest number   
		 */
		getExtremes: function (data, field, type) {
			var comparator = [];
			_.each(data, function (obj) {
				this.loop(obj[field], function (key, value) {
					comparator.push(value);
				});
			}.bind(this));
			return d3[type](comparator);
		},


		calculate: function () {

			var data = this.data,
				maxX = this.getExtremes(data, 'x', 'max'),
				minX = this.getExtremes(data, 'x', 'min'),
				minY = this.getExtremes(data, 'y', 'min'),
				maxY = this.getExtremes(data, 'y', 'max'),
				padding = this.get('padding'),
				height = this.get('height') - padding - 40,
				width = this.get('width') - padding,
				xfunc = false,
				yfunc = false;

			minY = _.isDate(minY) ? minY : minY > 0 ? 0 : minY;

			xfunc = _.isDate(maxX) ? d3.time.scale() : d3.scale.linear();
			xfunc.domain([minX, maxX]).range([padding, width + padding]);

			yfunc = _.isDate(maxY) ? d3.time.scale() : d3.scale.linear();
			yfunc.domain([minY, maxY]).range([height, padding]);

			this.xfunc = xfunc;
			this.yfunc = yfunc;
		},

		tick: function () {

			this.paths.transition()
				.duration(100)
				.ease('linear')
				.attr('d', this.line(this.data));

			this.xaxis.call(d3.svg.axis().scale(this.xfunc).orient("bottom"));
			this.yaxis.call(d3.svg.axis().scale(this.yfunc).orient('left').ticks(5));

		},

		lineCreator: function (x, y) {

			var xfunc = this.xfunc,
				yfunc = this.yfunc;

			return d3.svg.line()
				.x(function (value) { 
					return value.x[x] ? xfunc(value.x[x]) : xfunc(0); 
				}.bind(this))
				.y(function (value) { 
					return value.y[y] ? yfunc(value.y[y]) : yfunc(0); 
				}.bind(this));
		},

		draw: function () {

			var svg = false,
				padding = this.get('padding'),
				height = this.get('height') - padding - 40,
				width = this.get('width') - padding,
				paths = this.paths,
				data = this.data,
				legend = [],
				xaxis = false,
				yaxis = false,
				lines = {};

			// create the SVG
			svg = d3.select(this.div)
				.append('svg')
				.attr('class', 'linegraph')
				.attr('height', height + padding)
				.attr('width', width + padding)
				.append('g');

			// xaxis
			if (this.get('showx')) {
				xaxis = svg.append('g')
					.attr('class', 'xaxis')
					.attr('transform', 'translate(0,' + height + ')')
					.call(d3.svg.axis().scale(this.xfunc).orient('bottom').ticks(5));

				svg.selectAll('.xaxis .tick')
					.attr('y2', height)
					.attr("transform", "translate(0,-" + height + ")"); 
			}

			// yaxis
			if (this.get('showy')) {
				yaxis = svg.append('g')
					.attr('class', 'yaxis')
					.attr('transform', 'translate(' + padding + ',0)')
					.call(d3.svg.axis().scale(this.yfunc).orient('left').ticks(5));
			}

			// there is only one xaxis, but multiple y's
			_.each(this.series, function (s) {
				lines[s] = this.lineCreator(this.get('x'), s);
			}.bind(this));

			// draw each of the lines
			var i = 0;
			for (var l in lines) {
				if (lines.hasOwnProperty(l)) {
					var color = this.colors(i);
					paths[l] = svg.append('path')
						.attr('d', lines[l](data))
						.attr('class', l)
						.attr('stroke', color)
						.attr('stroke-width', '3px')
						.attr('fill', 'none');

					legend.push({
						title: l,
						color: color
					});
				}
				i++;
			}

			if (this.get('legend') === 'on') {
				d3.select(this.div).append('div')
					.attr('class', 'legend')
					.selectAll('div.label')
					.data(legend)
					.enter()
						.append('div')
						.attr('class', 'label')
						.attr('style', function (d) {
							return 'border-color:' + d.color;
						})
						.text(function (d) {
							return d.title;
						});
			}

			// set all the variables back
			this.svg = svg;
			this.xaxis = xaxis;
			this.yaxis = yaxis;
			this.lines = lines;
			this.paths = paths;
		},

		render: function (data, colors) {

			var series = [],
				counter = 1;

			this.series = _.compact(this.series);

			// get all the lines we need to draw
			while (this.get('y' + counter) !== undefined) {
				series.push(this.get('y' + counter));
				counter++;
			}

			this.x = this.get('x');

			this.series = series;
			this.data = this.process(data, this.get('x'), series);

			// calculate all the data
			this.calculate();

			this.div = document.createElement('div');
			this.div.className = 'linegraph';
			this.colors = colors;
			this.draw();

			return this.div;
		},

		form: function () {
			this.series = _.compact(this.series);
			var form = _.template(LineGraphFormTemplate, this);
			return form;
		}
	});

	return LineGraph;
});