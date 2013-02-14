define([
	'jquery',
	'underscore',
	'backbone',
	'vent',
	'models/user/DataSourceUserModel',
	'models/visualization/VisualizationManagerModel',
	'views/popup/PopupView',
	'text!templates/visualization/Visualization.html',
	'text!templates/visualization/EditVisualization.html'
], function ($, _, Backbone, vent, DataSourceUserModel, VisualizationManagerModel, PopupView, VisulizationTemplate, EditVisualizationTemplate) {

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

		initialize: function () {
			vent.on('arrow:data:' + this.model.prefix(), this.render, this);
			this.model.on('change', this.save);
		},

		render: function (data, options) {

			this.$el.html('');

			this.data = data;

			this.options = {
				'height': this.model.get('height'),
				'width': this.model.get('width'),
				'showx': this.model.get('showx'),
				'showy': this.model.get('showy'),
				'padding': this.model.get('padding')
			};

			_.extend(this.options, options);
			this.model.set(this.options);

			var element = this.model.render(data);

			var body = _.template(VisulizationTemplate, {
				'title': this.model.get('userName'),
				'width': this.options.width,
				'height': this.options.height
			});

			this.$el.html(body);
			this.$el.addClass('vis');

			// add the element to the vis body
			$('.chart', this.$el).append(element);

			this.$el.css({
				'height': this.options.height,
				'width': this.options.width
			});

			if (this.options.width > this.options.height) {
				this.$el.addClass('landscape');
			} else {
				this.$el.removeClass('landscape');
			}

			return this;
		},

		settings: function () {
			this.$el.toggleClass('flipped');
		},

		del: function () {
			this.remove();
			this.model.collection.remove(this.model);
		},

		advancedSettings: function () {
			var body = _.template(EditVisualizationTemplate, {
				'userName': this.model.get('userName')
			});

			var pv = new PopupView(),
				pvElement = pv.render(body);

			$('#popup .varea').append(this.model.form());

			$('.btn.blue', pvElement).click(function () {

				var fields = $('.varea input', pvElement);

				_.each(fields, function (field) {
					if ($(field).val() !== '') {
						this.model.set($(field).attr('name'), $(field).val());
					} else { 
						this.model.unset($(field).attr('name'));
					}
				}.bind(this));

				this.render(this.data, this.options);

				pv.remove();
				this.$el.toggleClass('flipped');

			}.bind(this));
		},

		saveSettings: function () {
			this.model.set('userName', $('input[name="name"]', this.$el).val());
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

					this.options.width = width;
					this.options.height = height;
					this.options.padding = 10;
					this.options.showx = false;
					this.options.showy = false;

					if (width > 300) {
						this.options.padding = 40;
						this.options.showx = true;
						this.options.showy = true;
					}

					this.render(this.data, this.options);
				}
			}.bind(this));
		}

	});

	return VisualizationView;
});