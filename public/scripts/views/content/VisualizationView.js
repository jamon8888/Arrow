define([
	'jquery',
	'underscore',
	'backbone',
	'd3',
	'vent',
	'collections/visualization/VisualizationCollection',
	'models/user/DataSourceUserModel',
	'models/visualization/VisualizationManagerModel',
	'views/popup/PopupView',
	'views/content/CreateVisualization',
	'text!templates/visualization/Visualization.html',
	'text!templates/visualization/EditVisualization.html'
], function ($, _, Backbone, d3, vent, VisualizationCollection, DataSourceUserModel, VisualizationManagerModel, PopupView, CreateVisualization, VisulizationTemplate, EditVisualizationTemplate) {

	'use strict';

	// for each of the visulizations render this

	var VisualizationView = Backbone.View.extend({

		tagName: 'div',

		events: {
			'mousedown .settings': 'settings',
			'mousedown .return': 'settings',
			'mousedown .btn.save': 'saveSettings',
			'mousedown .btn.advanced': 'advancedSettings',
			'mousedown .delete': 'del',
			'mousedown .drag': 'dragging'
		},

		/**
		 * Make sure we have an instance of the model and listen for events
		 */
		initialize: function () {
			var Model = VisualizationManagerModel.findVisualization(this.model.get('name'));
			this.model.setInstance(new Model(this.model.toJSON()));

			this.model.on('change', this.update, this);
			// list for global events
			vent.on('arrow:data:' + this.model.prefix(), this.render, this);
		},

		/**
		 * Render the visualisation
		 * 
		 * @param  {Object} data    The data we are rendering
		 * @param  {Object} options 
		 * @return {Object} this   
		 */
		render: function (data, options) {

			var startTime = this.options.dashboard.get('startTime'),
				endTime = this.options.dashboard.get('endTime'),
				color = d3.rgb(this.options.dashboard.get('color')),
				colors = d3.scale.ordinal().range([
					color.toString(), color.brighter(2).toString(), 
					color.darker().toString(), color.brighter().toString(), 
					color.darker(2).toString()
				]),
				element = false,
				body = false;

			this.$el.html('');
			// we have to deep copy the data array
			this.data = data ? data.slice() : false;

			// remove all the buckets which are outside the time range
			if (startTime || endTime) {
				for (var i = 0; i < this.data.length; i++) {
					if ((startTime && startTime > this.data[i].timestamp) 
						|| (endTime && endTime < this.data[i].timestamp)) {
						this.data.splice(i--, 1);
					}
				}
			}

			this.properties = {
				'height': this.model.get('height'),
				'width': this.model.get('width'),
				'showx': this.model.get('showx'),
				'showy': this.model.get('showy'),
				'padding': this.model.get('padding')
			};

			_.extend(this.properties, options);
			this.model.set(this.properties);

			element = this.model.getInstance().render(this.data, colors);

			body = _.template(VisulizationTemplate, {
				'title': this.model.get('userName'),
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

		/**
		 * When the model changes we need to save it and rerender it
		 */
		update: function () {
			this.model.save();
			this.render(this.data);
		},

		/**
		 * Toggle the settings window
		 */
		settings: function () {
			this.$el.toggleClass('flipped');
		},

		/**
		 * Save the simple settings
		 */
		saveSettings: function () {
			this.model.set('userName', $('input[name="name"]', this.$el).val());
			this.$el.removeClass('flipped');
		},

		/**
		 * Save the advanced settings
		 */
		advancedSettings: function () {
			var body = _.template(EditVisualizationTemplate, {
				'userName': this.model.get('userName')
			});

			var pv = new PopupView(),
				pvElement = pv.render(body);

			$('#popup .varea').append(this.model.getInstance().form());

			// bind the autocomplete
			$('#popup .axis').on('keyup', _.bind(this.autoComplete, this));

			// When we click submit
			$('.btn.blue', pvElement).mousedown(function () {
				var fields = $('.varea input', pvElement);
				_.each(fields, function (field) {
					if ($(field).val() !== '') {
						this.model.set($(field).attr('name'), $(field).val());
					} else {
						this.model.unset($(field).attr('name'));
					}
				}.bind(this));
				// remove popup
				pv.remove();
				this.$el.toggleClass('flipped');
			}.bind(this));
		},

		autoComplete: function (e) {
			// delegate to the create visulation method
			CreateVisualization.prototype.autoComplete(e, this.model.get('datasource'));
		},

		/**
		 * Delete a visualisation
		 * @param  {[type]} evt [description]
		 * @return {[type]}     [description]
		 */
		del: function (evt) {
			var $target = $(evt.target),
				confirmText = 'Are you sure?';

			this.$el.find('.delete').addClass('confirm');

			if ($target.html() !== confirmText) {
				this.$el.find('.delete').html('<span class="del-label">' + confirmText + '</span>').addClass('can-cancel');
				return;
			}

			var model = VisualizationCollection.get(this.model.id);
			model.destroy();
			this.remove();
		},

		/**
		 * Allows the visualisation to be dragged and resized
		 * 
		 * @param  {Object} e Mousemove event
		 */
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