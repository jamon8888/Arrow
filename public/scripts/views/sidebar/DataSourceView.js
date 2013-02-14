define([
	'jquery',
	'underscore',
	'backbone',
	'chosen',
	'collections/user/DataSourceUserCollection',
	'views/popup/PopupView',
	'text!templates/DataSource.html'
], function ($, _, Backbone, Chosen, DataSourceUserCollection, PopupView, DataSourceTemplate) {

	'use strict';

	/**
	 * Lets a user manage their data sources
	 */
	var DataSourceView = Backbone.View.extend({

		events: {
			'click .btn.add': 'toggleAdd',
			'click .btn.save': 'saveDataSource',
			'click .toggle': 'toggleRunning',
			'click .delete': 'remove',
			'click .edit': 'edit'
		},

		render: function () {
			// load all the datasources
			DataSourceUserCollection.fetch({
				update: true,
				success: _.bind(this.showPopup, this),
				error: function () {
					console.log('failed to get user datasources');
				}
			});
		},

		rerender: function (datasource) {
			var form = _.template(DataSourceTemplate, {
				'UserDataSources': DataSourceUserCollection,
				'datasources': this.model.get('datasources'),
				'datasource': datasource || false
			});

			$('.body', this.$el).html(form);
			this.delegateEvents();
			// bind the chosen form
			this.$el.find('#choosetype').chosen().change(this.showForm);
		},

		showPopup: function () {

			var form = _.template(DataSourceTemplate, {
				'UserDataSources': DataSourceUserCollection,
				'datasources': this.model.get('datasources'),
				'datasource': false
			});

			// render the popup
			this.popup = new PopupView();
			this.el = this.popup.render(form);
			// override the Jquery extended el element
			this.$el = $(this.el);
			// rebind the events
			this.delegateEvents();
			// bind the chosen form
			this.$el.find('#choosetype').chosen().change(this.showForm);
		},

		toggleAdd: function () {
			$('.manageDataSource', '#popup').toggle();
			$('.editDataSource', '#popup').toggle();
		},

		showForm: function (e) {
			_.each($('.type', '#popup'), function (type) {
				$(type).hide();
			});
			$('.type.' + $(e.target).val(), '#popup').show();
		},

		/**
		 * Take the data in the form and save it
		 */
		saveDataSource: function () {

			var select = $('select', '#popup'),
				form = $('.type.' + select.val()),
				fields = $('input', form),
				attributes = {},
				id = this.$el.find('input[name="id"]').val();

			// iterate each of the fields and all the values
			_.each(fields, function (field) {
				field = $(field);
				attributes[field.attr('name')] = field.val();
			});

			attributes.name = select.val();

			if (id) {
				var model = DataSourceUserCollection.get(id);
				model.set(attributes);
				model.save();
			} else {
				// save to the collection
				DataSourceUserCollection.create(attributes);
			}

			// rerender the list
			this.rerender();
		},

		toggleRunning: function (e) {

			var t = $(e.target),
				id = t.attr('data-id'),
				running = t.hasClass('start') ? false : true,
				datasource = DataSourceUserCollection.get(id);

			if (running) {
				datasource.stop();
				t.removeClass('stop').addClass('start');
			} else {
				datasource.start();
				t.removeClass('start').addClass('stop');
			}
		},

		remove: function (e) {
			var id = $(e.target).attr('data-id');
			$(e.target).parent().remove();

			var model = DataSourceUserCollection.get(id);
			model.destroy();
		},

		edit: function (e) {
			var id = $(e.target).attr('data-id');
			this.rerender(DataSourceUserCollection.get(id));
			this.toggleAdd();
		}

	});

	return DataSourceView;
});