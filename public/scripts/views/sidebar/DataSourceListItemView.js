define([
	'jquery',
	'underscore',
	'backbone',
	'vent'
], function ($, _, Backbone, vent) {

	'use strict';

	/**
	 * The list of dashboards in the sidebar
	 */
	var DataSourceListItemView = Backbone.View.extend({

		tagName: 'li',

		events: {
			'click': 'toggle'
		},

		template: _.template('<span class="status"></span><%= niceName %></li>'),

		/**
		 * Watch for change events
		 */
		initialize: function () {
			this.errorMessage = false;
			this.model.on('change', this.render, this);
		},

		/**
		 * Render the li
		 */
		render: function () {
			var body = this.template(this.model.toJSON());
			this.$el.html(body);
			return this;
		},

		/**
		 * Toggle the state of the datasource e.g. running or paused
		 */
		toggle: function () {
			if (this.model.getActivityStatus() === 'running') {
				this.model.stop(
					_.bind(this.failedToChangeStatus, this),
					_.bind(this.succeededToChangeStatus, this)
				);
			} else {
				this.model.start(
					_.bind(this.failedToChangeStatus, this),
					_.bind(this.succeededToChangeStatus, this)
				);
			}
		},

		succeededToChangeStatus: function () {
			var span = this.$el.find('span');

			if (this.errorMessage) {
				this.errorMessage.remove();
				this.$el.removeClass('error');
			}

			if (span.hasClass('activity-running')) {
				span.removeClass('activity-running');
				span.addClass('activity-paused');
			} else {
				span.removeClass('activity-paused');
				span.addClass('activity-running');
			}
		},

		failedToChangeStatus: function (msg) {

			if (this.errorMessage) {
				this.errorMessage.remove();
			}

			msg = msg.message ? msg.message : 'An unknown error occured, please try again';

			this.errorMessage = $('<div class="error-popup">' + msg + '</div>');
			this.$el.addClass('error');
			this.$el.append(this.errorMessage);
		}

	});

	return DataSourceListItemView;
});
