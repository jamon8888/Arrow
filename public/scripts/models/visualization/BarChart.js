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

/*

			// max and min data values
			var max = d3.max(this.data, function(d) {
				return d.y[this.get('y')];
			}.bind(this));

			var min = d3.min(this.data, function(d) {
				return d.y[this.get('y')];
			}.bind(this));

			var y = d3.scale.linear().domain([0, max]).rangeRound([0, this.get('height')]);
			var x = d3.scale.linear().domain([min, max]).range([0, this.get('width')]);

			// max and min time values
			var maxTime = d3.max(this.data, function(d){
				return d.x[this.get('x')];
			}.bind(this));

			maxTime = maxTime.getTime();

			var minTime = d3.min(this.data, function(d){
				return d.x[this.get('x')];
			}.bind(this));

			minTime = minTime.getTime();

			console.log(maxTime, minTime, maxTime-minTime);

			// var yy = d3.scale.linear().domain([0, maxTime]).rangeRound([0, this.get('height')]);
			var xx = d3.scale.linear().domain([minTime, maxTime]).range([0, this.get('width')]);
*/

			var width = this.get('width'),
				height = this.get('height'),
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

			console.log(minX, minY, maxX, maxY);

			var rangeX = d3.scale.linear().domain([minX, maxX]).range([0, width]),
				rangeY = d3.scale.linear().domain([minY, maxY]).range([0, height]);

			var chart = d3.select(this.div)
				.append('svg')
				.attr('width', width)
				.attr('height', height - 40);

			chart.selectAll('rect')
				.data(this.data)
			.enter()
				.append('rect')
				// .attr('x', function (d, i) { return ((width / (maxX - minX)) * (comparision(d, 'x', x) - minX)) - ( i * 75); })
				.attr('x',function(d, i){ return i * (maxX - minX) })
				.attr('y', function (d) { return rangeY(d.y[y]) - 40; })
				.attr('height', function (d) { return height - rangeY(d.y[y]); })
				.attr('width', function (d) { return (width / (maxX - minX)) * ((maxX - minX) / this.data.length); }.bind(this));




/*



			// draw bars
			chart.selectAll('rect')
				 .data(this.data)
				 .enter()
				 .append('rect')
				 .attr('y', function(d){ return this.get('height') - y(d.y[this.get('y')]); }.bind(this))
				 .attr('height', function (d) { return y(d.y[this.get('y')]); }.bind(this))
				 .attr('x', function (d) { return xx(d.x[this.get('x')]); }.bind(this))
				 .attr('width', function (d) { return (width / (maxTime - minTime)) * (d.x[this.get('x')] - minTime) }.bind(this));




				 //.attr('x',function(d, i){ return i * ( this.get('width') / _.keys(this.data).length ); }.bind(this))
				 //.attr('y', function(d){ return this.get('height') - y(d.y[this.get('y')]); }.bind(this))
				 // .attr('width', this.get('width') / _.keys(this.data).length - this.get('barspacing'))
				 // .attr('width', function (d) { return ( y(d.x[this.get('x')]) / _.keys(this.data).length ) - this.get('barspacing'); }.bind(this))
				 //.attr('width', function (d, i) { return xx(d.x[this.get('y')]); }.bind(this))
				 //

			// draw labels
			chart.selectAll('text')
				 .data(this.data)
				 .enter()
				 .append('text')
				 .text(function(d){ return d.y[this.get('y')]}.bind(this))
				 .attr('text-anchor', 'middle')
				 .attr('x',function(d, i){ return i * (this.get('width') / _.keys(this.data).length) + (this.get('width') / _.keys(this.data).length - this.get('barspacing')) / 2; }.bind(this))
				 .attr('y', function(d){ return this.get('height') - d.y[this.get('y')] - 50}.bind(this));

			*/
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