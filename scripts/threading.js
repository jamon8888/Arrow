var Thread = (function() {
	"use strict";
	var timeouts	= [],
		messageName = '',
		scheduledTimeouts = [];

	var handleMessage = function (event) {
		if (event.source === window && event.data === messageName) {
			event.stopPropagation();
			if (timeouts.length > 0) {
				var func = timeouts.shift();
				func();
			}
		}
	};

	window.addEventListener('message', handleMessage, true);


	return {
		start: function (func, _messageName, time) {

			if (time) {
				// use setTimeout
				scheduledTimeouts.push(setTimeout(func, time));
			} else {
				messageName = _messageName;
				timeouts.push(func);
				window.postMessage(messageName, '*');
			}
		},

		stopAll: function () {
			scheduledTimeouts.forEach(function (timeout) {
				window.clearTimeout(timeout);
			});
		}
	};

})();
