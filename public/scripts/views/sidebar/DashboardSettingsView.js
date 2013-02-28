define([
	'jquery',
	'jqueryui',
	'underscore',
	'backbone',
	'chosen',
	'd3',
	'models/datasource/DataSourceModel',
	'views/popup/PopupView',
	'views/header/ShareView',
	'text!templates/sidebar/DashboardSettingsView.html'
], function ($, $ui, _, Backbone, Chosen, d3, DataSourceModel, PopupView, ShareView, DashboardSettingsTemplate) {

	'use strict';

	var DashboardSettingsView = Backbone.View.extend({

		events: {
			'click .colors li': 'changeColor',
			'click .btn.blue': 'save',
			'click .btn.delete': 'del',
			'click #share': 'share'
		},

		render: function () {

			var form = _.template(DashboardSettingsTemplate, {
				'title': this.model.get('title'),
				'colors': this.model.get('allColors'),
				'color': this.model.get('color')
			});

			// render the popup
			this.popup = new PopupView();
			this.el = this.popup.render(form);
			// override the Jquery extended el element
			this.$el = $(this.el);
			// rebind the events
			this.delegateEvents();

			// build a little chart
			this.buildAvailabilityData();
			this.buildAvailabilityChart();

			// bind the slider
			this.$el.find('#slider').slider({
				range: true,
				min: this.min,
				max: this.max,
				values: [
					this.model.get('startTime') ? this.model.get('startTime') : this.min,
					this.model.get('endTime') ? this.model.get('endTime') : this.max
				],
				step: 1000 * 10
			});
		},

		buildAvailabilityData: function () {

			var avail = {},
				dsm = new DataSourceModel(),
				data = dsm.getData();

			this.availGraph = [];

			// fetch all the totals in each bucket
			_.each(data, function (datasource) {
				for (var time in datasource) {
					avail[datasource[time].timestamp] = datasource[time].keys.Total.sum;
				}
			});

			// add them to an array
			for (var time in avail) {
				this.availGraph.push({
					'time': parseInt(time, 10),
					'value': avail[time]
				});
			}

			console.log(this.availGraph);

			this.min = parseInt(d3.min(this.availGraph, function (d) { return d.time; }), 10);
			this.max = parseInt(d3.max(this.availGraph, function (d) { return d.time; }), 10);
		},

		buildAvailabilityChart: function () {

			var width = 320,
				height = 54;

			var max = d3.max(this.availGraph, function (d) { return d.value; });
			var min = d3.min(this.availGraph, function (d) { return d.value; });

			var y = d3.scale.linear().domain([0, max]).rangeRound([0, height]);
			var x = d3.scale.linear().domain([this.min, this.max]).range([0, width]);

			var chart = d3.select('#barchart')
				.append('svg')
				.attr('width', width)
				.attr('height', height);

			var barWidth = (width / ((this.max - this.min) / 10000));
			barWidth = barWidth < 1 ? 1 : barWidth;

			chart.selectAll('rect')
				.data(this.availGraph)
				.enter()
				.append('rect')
				.attr('x', function (d, i) { return Math.round(x(d.time)); })
				.attr('y', function (d) { return height - y(d.value); })
				.attr('width', function (d, i) { return barWidth;  })
				.attr('height', function (d) { return y(d.value); });
		},

		changeColor: function (evt) {
			var $target = $(evt.target);
			this.$el.find('.colors li').removeClass('selected');
			$target.addClass('selected');
		},

		save: function () {

			// get the name
			var name = this.$el.find('input[name="name"]').val();
			// get the color
			var color = this.$el.find('.colors li.selected').attr('data-color');
			// get the time range
			var timeframe = this.$el.find('#slider').slider('values');

			if (this.min !== timeframe[0]) {
				this.model.set('startTime', timeframe[0]);
			} else {
				this.model.set('startTime', false);
			}

			if (this.max !== timeframe[1]) {
				this.model.set('endTime', timeframe[1]);
			} else {
				this.model.set('endTime', false);
			}

			this.model.set('title', name);
			this.model.set('color', color);

			this.model.save();

			this.popup.remove();
		},

		del: function (evt) {

			var $target = $(evt.target),
				confirmText = 'Are you sure?',
				index = null;

			if ($target.html() !== confirmText) {
				$target.html(confirmText);
				return;
			}

			// find the current index
			this.model.collection.each(function (d, i) {
				if (d === this.model) {
					index = i;
				}
			}.bind(this));

			// do we have an element after
			if (this.model.collection.at(index + 1)) {
				this.model.collection.at(index + 1).show();
			} else if (this.model.collection.at(index - 1)) {
				this.model.collection.at(index - 1).show();
			} else {
				// do nothing
			}

			// remove the popup
			this.popup.remove();
			this.model.destroy();
		},

		share: function () {
			var sv = new ShareView();
			sv.render();
		}
	});

	return DashboardSettingsView;
});