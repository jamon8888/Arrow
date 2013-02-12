define([
	'jquery',
	'underscore',
	'backbone'
], function ($, _, Backbone) {
	/**
	 * A misc popup view which will render a nice little dialog box for us
	 *
	 * <h2>Usage</h2>
	 */
	var PopupView = Backbone.View.extend({

		// events to apply
		events: {
			'click': 'removePopup',
			'click .close': 'removePopup'
		},

		// Popup template
		template: _.template(
			'<div id="popup">' +
				'<div class="body"><%= body %></div>' +
			'</div>'
        ),

		/**
		 * Render the popup
		 * 
		 * @param  {String} title title for the popup
		 * @param  {String} body  string to append to the popup
		 */
        render: function (body, attributes) {

			var obj = {
				'body': body
			};
			_.extend(obj, attributes);

			// run through the template once
			var template = this.template({
				'body': body
			});
			// now run through it again with our new attributes
			this.el.innerHTML = _.template(template, attributes || {});
			this.el.id = 'overlay';

			document.body.appendChild(this.el);

			var input = $('input[type="text"]', this.el);

			if (input.length > 0) {
				input[0].focus();
			}

			return this.el;
        },

        removePopup: function (e) {
			if ($(e.target).hasClass('close') || e.target.id === 'overlay') {
				this.remove();
			}
        }
	});

	return PopupView;
});