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

		template: _.template('<span class="status"></span><%= niceName %></li>'),

		/**
		 * Watch for change events
		 */
		initialize: function () {
			this.model.on('change', this.render, this);
		},

		/**
		 * Render the li
		 */
		render: function () {
			var body = this.template(this.model.toJSON());
			this.$el.html(body);

			console.log(this.model);

			if (this.model.getActivityStatus() === 'running') {
				this.$el.find('span').addClass('activity-running');
			} else {
				this.$el.find('span').addClass('activity-paused');
			}

			return this;
		}
	});

	return DataSourceListItemView;
});
