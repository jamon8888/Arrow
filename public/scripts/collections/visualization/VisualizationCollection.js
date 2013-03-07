define([
	'jquery',
	'underscore',
	'backbone',
	'models/visualization/VisualizationModel'
], function ($, _, Backbone, VisualizationModel) {

	'use strict';

	var VisualizationCollection = Backbone.Collection.extend({
		model: VisualizationModel,
		localStorage: new Backbone.LocalStorage('VisualizationCollection')
	});

	return new VisualizationCollection();
});