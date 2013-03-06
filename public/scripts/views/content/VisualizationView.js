define([
	'jquery',
	'underscore',
	'backbone',
	'd3',
	'vent',
	'models/user/DataSourceUserModel',
	'models/visualization/VisualizationManagerModel',
	'views/popup/PopupView',
	'text!templates/visualization/Visualization.html',
	'text!templates/visualization/EditVisualization.html'
], function ($, _, Backbone, d3, vent, DataSourceUserModel, VisualizationManagerModel, PopupView, VisulizationTemplate, EditVisualizationTemplate) {

	'use strict';

	// for each of the visulizations render this

	var VisualizationView = Backbone.View.extend({

		tagName: 'div',

		events: {
			'click .settings': 'settings',
			'click .return': 'settings',
			'click .btn.save': 'saveSettings',
			'click .btn.advanced': 'advancedSettings',
			'click .delete': 'del',
			'mousedown .drag': 'dragging'
		},

		initialize: function () {
			vent.on('arrow:data:' + this.options.chart.prefix(), this.render, this);
			this.options.chart.on('change', this.save);
		},

		render: function (data, options) {

			var startTime = this.model.get('startTime'),
				endTime = this.model.get('endTime');

			this.$el.html('');
			// we have to deep copy the data array
			this.data = data ? data.slice() : false;

			// remove all the buckets which are outside the time range
			if (startTime || endTime) {
				for (var i = 0; i < this.data.length; i++) {
					if ((startTime && startTime > this.data[i].timestamp) || (endTime && endTime < this.data[i].timestamp)) {
						this.data.splice(i--, 1);
					}
				}
			}

			this.properties = {
				'height': this.options.chart.get('height'),
				'width': this.options.chart.get('width'),
				'showx': this.options.chart.get('showx'),
				'showy': this.options.chart.get('showy'),
				'padding': this.options.chart.get('padding')
			};

			_.extend(this.properties, options);
			this.options.chart.set(this.properties);

			var color = d3.rgb(this.model.get('color')),
				colours = d3.scale.ordinal().range([
					color.toString(), 
					color.brighter(2).toString(), 
					color.darker().toString(), 
					color.brighter().toString(), 
					color.darker(2).toString(),
					color.brighter(3).toString(),
					color.darker(3).toString()
				]);

			var element = this.options.chart.render(this.data, colours);

			var body = _.template(VisulizationTemplate, {
				'title': this.options.chart.get('userName'),
				'width': this.properties.width,
				'height': this.properties.height
			});

			this.$el.html(body);
			this.$el.addClass('vis');

			// add the element to the vis body
			$('.chart', this.$el).append(element);

			this.$el.css({
				'height': this.properties.height,
				'width': this.properties.width
			});

			if (this.properties.width > this.properties.height) {
				this.$el.addClass('landscape');
			} else {
				this.$el.removeClass('landscape');
			}

			return this;
		},

		settings: function () {
			this.$el.toggleClass('flipped');
		},

		del: function (evt) {

			var $target = $(evt.target),
				confirmText = 'Are you sure?';

			this.$el.find('.delete').addClass('confirm');

			if ($target.html() !== confirmText) {
				this.$el.find('.delete').html('<span class="del-label">' + confirmText + '</span>').addClass('can-cancel');
				return;
			}

			this.options.chart.collection.remove(this.options.chart);
			this.remove();
			this.model.save();
		},

		advancedSettings: function () {
			var body = _.template(EditVisualizationTemplate, {
				'userName': this.options.chart.get('userName')
			});

			var pv = new PopupView(),
				pvElement = pv.render(body);

			$('#popup .varea').append(this.options.chart.form());

			$('.btn.blue', pvElement).click(function () {

				var fields = $('.varea input', pvElement);

				_.each(fields, function (field) {
					if ($(field).val() !== '') {
						this.options.chart.set($(field).attr('name'), $(field).val());
					} else {
						this.options.chart.unset($(field).attr('name'));
					}
				}.bind(this));

				this.render(this.data, this.properties);

				pv.remove();
				this.$el.toggleClass('flipped');

			}.bind(this));
		},

		saveSettings: function () {
			this.options.chart.set('userName', $('input[name="name"]', this.$el).val());
			this.render(this.data);
			this.$el.removeClass('flipped');
		},

		dragging: function (e) {

			e.preventDefault();

			var dragging = false;

			// create a fake div
			var div = $('<div>', {
				'class': 'fakevis',
				'css': {
					'top': this.$el.offset().top,
					'left': this.$el.offset().left,
					'width': this.$el.width(),
					'height': this.$el.height()
				}
			});

			$('body').append(div);

			// watch for mouse movement
			$(document).mousemove(function (e) {

				var offset = this.$el.offset(),
					x = e.pageX - offset.left,
					y = e.pageY - offset.top,
					newX = Math.round(x / 300) * 300,
					newY = Math.round(y / 300) * 300;

				// compensate for the margins
				newX = newX + (((newX / 300) - 1) * 20);
				newY = newY + (((newY / 300) - 1) * 20);

				dragging = true;
				$(div).css({
					'width': newX,
					'height': newY
				});

			}.bind(this));

			$(document).mouseup(function (e) {
				var width = div.width(),
					height = div.height();

				if (dragging) {

					this.$el.css({
						'width': width,
						'height': height
					});

					$('.pane', this.$el).css({
						'width': width,
						'height': height
					});

					$(div).remove();
					$(document).unbind('mousemove');
					dragging = false;

					this.properties.width = width;
					this.properties.height = height;
					this.properties.padding = 10;
					this.properties.showx = false;
					this.properties.showy = false;

					if (width > 300) {
						this.properties.padding = 40;
						this.properties.showx = true;
						this.properties.showy = true;
					}

					this.render(this.data, this.properties);
				}
			}.bind(this));
		}

	});

	return VisualizationView;
});