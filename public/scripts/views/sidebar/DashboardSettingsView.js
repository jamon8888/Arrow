define([
	'jquery',
	'underscore',
	'backbone',
	'chosen',
	'views/popup/PopupView',
	'text!templates/sidebar/DashboardSettingsView.html'
], function ($, _, Backbone, Chosen, PopupView, DashboardSettingsTemplate) {

	'use strict';

	var DashboardSettingsView = Backbone.View.extend({

		events: {
			'click .colors li': 'changeColor',
			'click .btn.blue': 'save'
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

			this.model.set('title', name);
			this.model.set('color', color);

			this.model.save();

			this.popup.remove();
		}
	});

	return DashboardSettingsView;
});