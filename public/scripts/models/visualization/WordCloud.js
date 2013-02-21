define([
	'jquery',
	'underscore',
	'backbone',
	'd3',
	'cloud',
	'models/visualization/VisualizationModel',
	'text!templates/visualization/wordcloud/form.html'
], function ($, _, Backbone, d3, cloud, VisualizationModel, WordCloudFormTemplate) {

	'use strict';

	var WordCloud = VisualizationModel.extend({

		defaults: {
			name: 'WordCloud',
			niceName: 'Word Cloud',
			userName: 'Word Cloud',
			height: 300,
			width: 300,
			padding: 0,
			field: false
		},

		fill: d3.scale.category20(),
		fontSize: d3.scale.log().range([10,100]),

		calculate: function () {

			var layout = d3.layout.cloud()
				.words(this.data)
				.size([this.get('width'), this.get('height') - 50])
				.rotate(function(d) { return (Math.random() * 5) * 30 - 60; })
				.timeInterval(10)
				.font('Impact')
				.fontSize(function (d) { return this.fontSize(d.value) ;}.bind(this))
				.text(function (d) { return d.word; })
				.on('end', _.bind(this.draw, this))
				.start();
		},

		draw: function () {
			d3.select(this.div)
				.append('svg')
				.attr('width', this.get('width'))
				.attr('heigh', this.get('height'))
				.append('g')
				.attr('transform', 'translate(' + this.get('width') / 2 + ',' + (this.get('height') - 40) / 2 + ')')
				.selectAll('text')
				.data(this.data)
				.enter().append('text')
					.style("font-size", function (d) { return this.fontSize(d.value) + 'px'; }.bind(this))
					.style("font-family", "Open Sans")
					.style("fill", function(d, i) { return this.fill(i); }.bind(this))
					.attr("text-anchor", "middle")
					.attr("transform", function(d) {
						return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
					})
					.text(function(d) { return d.text; });

			this.$div.removeClass('loading');
		},

		render: function (data) {
			this.data = this.process(data, this.get('field'));
			this.div = document.createElement('div');
			this.div.className = 'PieChart';
			this.$div = $(this.div);
			this.$div.addClass('loading');
			this.calculate();
			return this.div;
		},

		form: function () {
			var form = _.template(WordCloudFormTemplate, {
				'field': this.get('field')
			});
			return form;
		},

		process: function (data, group) {

			var newData = [],
				words = [],
				countObj = {};

			// find them all based over time
			this.loop(data, function (timestamp, obj) {
				this.loop(obj, function (key, parent) {
					if (key === group) {
						newData.push(parent);
					}
				});
			}.bind(this));

			// get all the words out
			_.each(newData, function (data) {
				for (var word in data) {
					words = words.concat(word.split(' '));
				}
			});

			// count how many times they appear
			_.each(words, function (word) {
				if (countObj[word] === undefined) {
					countObj[word] = 0;
				}
				countObj[word]++;
			});

			// put back into an array
			newData = [];
			for (var label in countObj) {
				newData.push({
					value: countObj[label],
					word: label
				});
			}

			return newData;
		}

	});

	return WordCloud;

});