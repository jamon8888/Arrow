define([
	'jquery',
	'underscore',
	'backbone',
	'chosen',
	'collections/visualization/VisualizationCollection',
	'collections/user/DataSourceUserCollection',
	'models/visualization/VisualizationManagerModel',
	'views/popup/PopupView',
	'text!templates/CreateVisualization.html',
	'text!templates/AutoComplete.html'
], function ($, _, Backbone, Chosen, VisualizationCollection, DataSourceUserCollection, VisualizationManagerModel, PopupView, CreateVisualizationTemplate, AutoCompleteTemplate) {

	'use strict';

	var CreateVisualization = Backbone.View.extend({

		/**
		 * The current visulization
		 */
		visulization: false,

		/**
		 * The popup instance
		 */
		popup: false,

		/**
		 * The ID of the datasource we have selected
		 */
		datasource: false,

		/**
		 * Watch for the events
		 */
		events: {
			'mousedown .btn.blue': 'addVisualization',
			'keyup .axis': 'autoComplete'
		},

		/**
		 * When we attempt to create the visulization we need to fetch the DataSources
		 */
		initialize: function () {
			DataSourceUserCollection.fetch({
				update: true,
				success: _.bind(this.render, this),
				error: function () {
					console.log('Failed to collect the user datasources');
				}
			});
		},


		/**
		 * Once we have the data back from our storage we need to display it in the popup
		 * 
		 * @param  {[type]} collection [description]
		 * @param  {[type]} response   [description]
		 * @param  {[type]} options    [description]
		 */
		render: function (collection, response, options) {

			this.popup = new PopupView();

			this.el = this.popup.render(_.template(CreateVisualizationTemplate, {
				'visualizations': VisualizationManagerModel.get('visualizations'),
				'datasources': DataSourceUserCollection,
				'userName': '',
				'visualization': false,
				'datasource': false
			}));

			// have to redefine the JQuery version of el (YUK!)
			this.$el = $(this.el);
			this.delegateEvents();

			this.$el.find('select[name="datasource"]').chosen().change(_.bind(this.chooseDataSource, this));
			this.$el.find('select[name="visualization"]').chosen().change(_.bind(this.chooseVisualization, this));
		},

		error: function (collection, response, options) {
			var message = response;

			// if we can't find it, it hasn't been created
			if (response === 'Record Not Found') {
				message = 'First you need to add a datasource';
			}

			this.el = this.popup.render(message);

			// have to redefine the JQuery version of el (YUK!)
			this.$el = $(this.el);
			this.delegateEvents();
		},

		/**
		 * Given a string return the correct visulization model
		 * 
		 * @param  {String} name [description]
		 * @return {Object}      The visulization model
		 */
		findVisualization: function (name) {

			var vis = false,
				models = VisualizationManagerModel.get('visualizations');

			// check the default name for a match
			models.forEach(function (v) {
				if (v.prototype.defaults.name === name) {
					vis = v;
				}
			});
			return vis;
		},

		/**
		 * When a user selected a vis load up the vis specific form
		 * 
		 * @param  {Object} e Event object
		 */
		chooseVisualization: function (e) {		
			var target = $(e.target);
			this.visualization = target.val();

			var	Model = this.findVisualization(this.visualization),
				vis = new Model();

			$('#popup .varea').html('');
			$('#popup .varea').append(vis.form());
		},

		chooseDataSource: function (e) {
			var target = $(e.target);
			this.datasource = target.val();
		},

		/**
		 * Add the vis to our collection
		 */
		addVisualization: function () {

			var Model = this.findVisualization(this.visualization),
				instance = false,
				fields = $('.varea input'),
				attributes = {};

			_.each(fields, function (field) {
				field = $(field);
				attributes[field.attr('name')] = field.val();
			});

			attributes.userName = $('input[name="userName"]').val();

			instance = new Model(attributes);
			instance.set('datasource', this.datasource);
			this.model.addVisualization(instance);

			this.remove();
		},

		autoComplete: function (e, datasource) {

			var element = $(e.target),
				index = -1,
				autocomplete = $('#autocomplete');

			if (!datasource) {
				datasource = this.datasource;
			}

			if (!datasource || _.indexOf([13, 38, 40], e.keyCode) !== -1) {
				return;
			}

			if (autocomplete) {
				autocomplete.remove();
				$(document).unbind('keyup');
			}

			var datasourceModel = DataSourceUserCollection.get(datasource);
			datasourceModel = datasourceModel.getDataSource();

			if (element.val().length > 2) {
				var options = datasourceModel.findKey(datasource, element.val()).slice(0, 10);
				var text = _.template(AutoCompleteTemplate, {
					options: options,
					offset: element.offset(),
					width: element.width()
				});

				$(document.body).append(text);
				autocomplete = $('#autocomplete');

				$(document).keyup(function (e) {

					if (_.indexOf([13, 38, 40], e.keyCode) === -1) {
						return;
					}
					
					// going up or down
					index += e.keyCode === 40 ? 1 : (e.keyCode === 38 ? -1 : 0); 

					if (index < 0 || index > options.length) {
						index = 0;
					}

					var lis = $('#autocomplete li');
					lis.removeClass('selected');
					$(lis[index]).addClass('selected');

					if (e.keyCode === 13) {
						element.val(lis[index].innerHTML);
						autocomplete.remove();
						$(document).unbind('keyup');
					}
				});

				_.each($('#autocomplete li'), function (li) {
					$(li).on('click', function () {
						element.val(li.innerHTML);
						autocomplete.remove();
						$(document).unbind('keyup');
					});
				});

				element.one('click', function () {
					autocomplete.remove();
					$(document).unbind('keyup');
				});
			} 
		}
	});

	return CreateVisualization;

});