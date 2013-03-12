define([
	'jquery',
	'underscore',
	'backbone',
	'd3',
	'worlddata',
	'models/visualization/VisualizationModel',
	'text!templates/visualization/worldmap/form.html'
], function ($, _, Backbone, d3, worldData, VisualizationModel, WorldMapTemplate) {

	'use strict';

	var WorldMap = VisualizationModel.extend({

		data: false,
		group: false,

		defaults: {
			name: 'WorldMap',
			niceName: 'World Map',
			userName: 'World Map',
			height: 300,
			width: 300,
			padding: 0
		},

		draw: function () {

			// work out our width and height
			var width = this.get('width'),
				height = this.get('height') - 40;

			// we need to fit the map into that width and height
			var projection = d3.geo.mercator()
				.translate([width / 2, height / 2])
				.scale(width <= (height + 40) ? width : (height * 1.54));

			var path = d3.geo.path()
				.projection(projection);

			var svg = d3.select(this.div).append("svg")
				.attr("width", width)
				.attr("height", height);

			var pane = svg.append('g')
				.attr("class", "pane");

			var countries = pane.append("g")
				.attr("class", "countries");

			var points = pane.append("g")
				.attr('class', 'points');

			// actual render
			countries.selectAll("path")
				.data(worldData.features)
				.enter()
					.append("path")
					.attr("class", 'country')
					.attr("d", path)
					.attr("id", function (feature) {
						return feature.id;
					});

			// insert all the points
			points.selectAll('circle')
				.data(this.data)
				.enter()
					.append('circle')
					.attr("transform", function (d) {
						return "translate(" + projection([d[0], d[1]]) + ")";
					})
					.attr('r', 5)
					.attr('class', 'circle')
					.attr('fill', function (d, i) {
						return this.colours(i);
					}.bind(this));
		},

		render: function (data, colors) {
			this.data = this.process(data, this.get('group'));

			this.div = document.createElement('div');
			this.div.className = 'worldmap';
			this.colours = colors;

			if (this.data.length === 0) {
				this.noData();
				return this.div;
			}

			this.draw();

			return this.div;
		},

		process: function (data, group) {

			var newData = [];

			_.each(data, function (obj) {
				this.loop(obj.keys, function (key, parent) {
					if (key === group) {
						newData.push(parent);
					}
				});
			}.bind(this));

			newData = _.map(_.flatten(newData), function (item) {
				if (_.isString(item)) {
					return item.split(',');
				}
				return false;
			});

			return _.uniq(newData);
		},

		form: function () {
			var form = _.template(WorldMapTemplate, {
				'group': this.get('group')
			});
			return form;
		}
	});

	return WorldMap;
});