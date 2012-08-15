/*jshint
  forin:true, noarg:true, noempty:false, eqeqeq:true, bitwise:true, strict:true,
  undef:true, curly:true, browser:true, indent:4, maxerr:50, prototypejs:true, 
  smarttabs:true*/
/*global DataSift:true, Loading:true, Data:true, Available:true, Login:true,
  Thread:true, Widget:true, Pie:true, CSV:true, Interactions:true, console:true
  d3:true*/
var Interactions = (function () {

	"use strict";

	var	div			= false,
		data		= [],
		options		= false,
		width		= false,
		height		= 300,
		currentTime = 0,
		timeCount	= 0,
		format		= '',
		total		= 0,
		padding		= 20;

	// parts
	var chart = false,
		rectangles = false;

	var render = function () {

		var maxCount = d3.max(data, function (d) {
			return d.count;
		});

		// find the max time
		var max = d3.max(data, function (i) {
			return i.time;
		});

		// find the min time
		var min = d3.min(data, function (i) {
			return i.time;
		});

		var x = d3.time.scale().domain([min, max]).range([0, width]),
			y = d3.scale.linear().domain([0, maxCount]).range([height - padding, 0]);

		// make sure the data is sorted by time
		data.sort(function (a, b) {
			return a.time - b.time;
		});

		// build the chart
		chart = d3.select(div)
			.append('svg')
			.attr('width', width)
			.attr('height', height)
			.append('g');

		// add a wrapper for the points
		var points = chart
			.append('g')
			.attr('id', 'points');

		chart.selectAll("rect")
			.data(data)
		.enter()
			.append("svg:rect")
			.attr("x", function (d, i) { return x(d.time); })
			.attr('y', function (d) { return height - padding - y(d.count); })
			.attr('width', width / data.length)
			.attr('height', function (d) { return y(d.count); })
			.attr('class', 'bar');

		// x axis function
		var xAxis = d3.svg.axis()
			.scale(x)
			.orient('bottom')
			.ticks(5);

		// render x axis
		chart.append('g')
		    .call(xAxis)
		    .attr("transform", "translate(0," + (height - padding) + ")")
		    .attr('class', 'line-axis');

		// y axis function
		var yAxis = d3.svg.axis()
			.scale(y)
			.orient('left')
			.ticks(5);
			//.tickFormat(d3.format(',.0e'));

		// render y axis
		chart.append('g')
			.call(yAxis)
			.attr("transform", "translate(" + (100) + ",0)")
			.attr('class', 'line-axis y')
			.attr('text-anchor', 'start');

		var number = new Element('div', {'class': 'interactions-total'});
		number.innerHTML = total + ' <span>total analyzed interactions</span>';
		div.appendChild(number);

	};

	/**
	 * Reformat the data
	 * 
	 * @param  {Object} _data The data object
	 */
	var timeframe = function (_data) {

		var ticks	= 20,
			max		= parseInt(d3.max(d3.keys(_data)), 10),
			min		= parseInt(d3.min(d3.keys(_data)), 10),
			range	= max - min,
			times	= {};

		// work out the range, the smallest number we want is 1
		range = Math.ceil(range / ticks);

		// populate our time object with our time buckets
		for (var i = min; i < (min + (range * ticks)); i += range) {
			times[i] = 0;
		}

		// go through the data and see if it belongs to a bucket
		for (var key in _data) {
			if (_data.hasOwnProperty(key)) {

				var currentTime = parseInt(key, 10),
					previous	= 0;

				for (var time in times) {
					if (times.hasOwnProperty(time)) {
						time = parseInt(time, 10);
						if (currentTime <= time && currentTime > previous) {
							times[time] += parseInt(_data[key].count, 10);
						}
						previous = time;
					}
				}
			}
		}

		// reset the data
		data = [];
		// reset the total
		total = 0;

		// go through the data and convert to an array
		for (var timestamp in times) {
			if (times.hasOwnProperty(timestamp)) {
				data.push({
					'time': new Date(parseInt(timestamp, 10)),
					'count': times[timestamp]
				});
				total += times[timestamp];
			}
		}
	};


	return {
		init: function (_div, _data, _options) {

			width = document.viewport.getWidth();
			div = $(_div);
			options = _options;

			timeframe(_data);

			if (data.length > 0) {
				render();
			}

			return this;
		},

		update: function (_data) {
			timeframe(_data);
			div.innerHTML = '';
			render();
		},

		getTotal: function () {
			return total;
		}
	};

})();
