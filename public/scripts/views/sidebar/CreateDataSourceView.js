define([
	'jquery',
	'underscore',
	'backbone',
	'chosen',
	'collections/user/DataSourceUserCollection',
	'models/datasource/DataSourceManagerModel',
	'views/popup/PopupView',
	'text!templates/DataSource.html'
], function ($, _, Backbone, Chosen, DataSourceUserCollection, DataSourceManagerModel, PopupView, DataSourceTemplate) {

	'use strict';

	/**
	 * Lets a user manage their data sources
	 */
	var DataSourceView = Backbone.View.extend({

		events: {
			'click .btn.save': 'saveDataSource'
		},

		render: function (datasource) {
			var form = _.template(DataSourceTemplate, {
				'datasources': DataSourceManagerModel.get('datasources'),
				'datasource': datasource
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
			this.popup.remove();
		}

	});

	return DataSourceView;
});