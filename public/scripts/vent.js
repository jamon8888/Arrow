/**
 * Global Event Dispatcher
 *
 * Heavily influnced by : http://lostechies.com/derickbailey/2012/04/03/revisiting-the-backbone-event-aggregator-lessons-learned/
 */
define(['backbone'], function (Backbone) {
	var vent = _.extend({}, Backbone.Events);
	return vent;
});