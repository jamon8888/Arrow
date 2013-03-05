define([
	'jquery',
	'underscore',
	'backbone',
	'vent',
	'views/sidebar/CreateDataSourceView'
], function ($, _, Backbone, vent, CreateDataSourceView) {

	'use strict';

	/**
	 * The list of dashboards in the sidebar
	 */
	var DataSourceListItemView = Backbone.View.extend({

		tagName: 'li',

		events: {
			'click': 'toggle',
			'click .set': 'settings'
		},

		template: _.template('<span class="status"></span><span class="label-clip"><%= niceName %></span><div class="set"></div></li>'),

		/**
		 * Watch for change events
		 */
		initialize: function () {
			this.errorMessage = false;
			this.model.on('change', this.render, this);
			this.model.on('remove', this.remove, this);
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

			if (this.$el.hasClass('activity-running')) {
				this.$el.removeClass('activity-running');
				this.$el.addClass('activity-paused');
			} else {
				this.$el.removeClass('activity-paused');
				this.$el.addClass('activity-running');
			}
		},

		failedToChangeStatus: function (msg) {

			if (this.errorMessage) {
				this.errorMessage.remove();
			}

			msg = msg.message ? msg.message : 'An unknown error occured, please try again';

			this.errorMessage = $('<div class="error-popup"><span class="error-details">' + msg + '</span></div>');
			this.$el.addClass('error');
			this.$el.append(this.errorMessage);
		},

		settings: function (evt) {
			evt.stopPropagation();
			var dsv = new CreateDataSourceView({model: this.model});
			dsv.render(this.model);
		}
	});

	return DataSourceListItemView;
});
