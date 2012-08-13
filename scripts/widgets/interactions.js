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

		// create the line function
		var line = d3.svg.line()
			.x(function (value) { return x(value.time); })
			.y(function (value) { return y(value.count); });

		// render the line
		points.append('path')
			.attr('d', line(data))
			.attr('class', 'line-points');

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
		number.update(total + ' <span>total analyzed interactions</span>');
		div.appendChild(number);

	};

	var timeframe = function (_data) {

		var tempdata	= {},
			dataHash	= new Hash(_data),
			range		= 0,
			wrap		= 0;

		/*
		// find the smallest time
		var min = dataHash.min(function (pair) {
			return parseInt(pair.key, 10);
		});

		// find the largest time
		var max = dataHash.max(function (pair) {
			return parseInt(pair.key, 10);
		});

		data = [];
		range = (max - min) / 1000;

		// work out the timeframe of the chart, we need at least 10
		if (range >= 60 * 60 * 24 * 365 * 10) {
			// years
			wrap = 1000 * 60 * 60 * 60 * 24 * 365;
			format = '%x';
		} else if (range >= 60 * 60 * 24 * 7 * 10) {
			// weeks
			wrap = 1000 * 60 * 60 * 24 * 7;
			format = '%d %b';
		} else if (range >= 60 * 60 * 24 * 10) {
			// days
			wrap = 1000 * 60 * 60 * 24;
			format = '%d %b';
		} else if (range >= 60 * 60 * 10) {
			// hours
			wrap = 1000 * 60 * 60;
			format = '%m/%d %H:%M';
		} else if (range >= 60 * 3) {
			// mins
			wrap = 1000 * 60;
			format = '%H:%M';
		} else {
			// seconds
			wrap = 1000;
			format = '%H:%M:%S';
		}
		 */

		total = 0;
		dataHash.each(function (pair) {
			data.push({
				'time': new Date(parseInt(pair.key, 10)),
				'count': pair.value.count
			});
			total += pair.value.count;
		});

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
			div.update('');
			render();
		},

		getTotal: function () {
			return total;
		}
	};

})();

/*
var liveInteractions = {


	width: document.viewport.getWidth(),
	height: 300,
	currentTime: 0,
	timeCount: 0,

	init: function(div, options) {

		this.div = div;
		this.options = options;
		this.interactions = [];

		// how many bars can we fit in?
		this.bars = Math.floor(this.width/80);

		for (var i = 0; i < this.bars; i++) {
			this.interactions.push(0);
		}

		this.render();

		setInterval(this.update.bindAsEventListener(this), 1000);

		// listen for events
		$(document).observe('dashboard:message', this.onMessage.bindAsEventListener(this));
	},

	onMessage: function() {
		var d = new Date();
		var currentTime = Math.floor(d.getTime()/1000);

		if (currentTime == this.currentTime) {
			this.timeCount++;
		} else {
			this.currentTime = currentTime;
			this.interactions.push(this.timeCount);
			this.timeCount = 1;
		}

		if (this.interactions.length > this.bars) {
			this.interactions.shift();
		}
	},

	render: function() {



	},

	update: function() {
		this.y = d3.scale.linear().domain([0, d3.max(this.interactions)]).range([0, this.height]);

		this.rectangles.selectAll('rect')
			.data(this.interactions)
		.transition()
			.duration(1000)
			.attr('y', function(value) { return this.height - this.y(value); }.bind(this))
			.attr('height', function(value) { return this.y(value); }.bind(this));
	}
}*/