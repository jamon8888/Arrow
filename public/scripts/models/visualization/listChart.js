define([
	'jquery',
	'underscore',
	'backbone',
	'models/visualization/VisualizationModel',
	'text!templates/visualization/listchart/form.html'
], function ($, _, Backbone, VisualizationModel, ListChartFormTemplate) {

	'use strict';

	var ListChart = VisualizationModel.extend({

		data: false,
		div: false,

		defaults: {
			name: 'ListChart',
			niceName: 'List Chart',
			userName: 'List Chart',
			height: 300,
			width: 300,
			padding: 0,
			group: false,
			limit: 10
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

			// sort them
			newData = newData.sort(function (a, b) {
				return b.value - a.value;
			});

			// now trim off everything but the last 10
			var totalSum = 0;
			if (newData.length > this.get('limit')) {
				// work out the total of the remaining
				for (var i = this.get('limit'); i < newData.length; i++) {
					totalSum += newData[i].value;
				}
				// now trim the fat
				newData = newData.splice(0, this.get('limit'));
				// add the other
				newData.push({
					'label': 'other',
					'value': totalSum
				});
			}

			return newData;
		},

		draw: function () {

			var template = '<ol>';

			_.each(this.data, function (item) {
				template += '<li>' + item.label + ' (' + item.value + ')</li>';
			});

			template += '</ol>';

			this.div.innerHTML = template;

		},

		render: function (data) {
			this.data = this.process(data, this.get('group'));

			this.div = document.createElement('div');
			this.div.className = 'ListChart';

			if (this.data.length === 0) {
				this.noData();
				return this.div;
			}

			this.draw();
			return this.div;
		},

		form: function () {
			var form = _.template(ListChartFormTemplate, {
				'group': this.get('group'),
				'limit': this.get('limit')
			});
			return form;
		}
	});

	return ListChart;
});