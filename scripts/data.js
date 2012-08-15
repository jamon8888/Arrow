/*jshint
  forin:true, noarg:true, noempty:false, eqeqeq:true, bitwise:true, strict:true,
  undef:true, curly:true, browser:true, indent:4, maxerr:50, prototypejs:true, 
  smarttabs:true*/
/*global DataSift:true, Loading:true, Data:true, Available:true, Login:true,
  Thread:true, Widget:true, Pie:true, CSV:true, Interactions:true, console:true*/

var Data = (function () {

	"use strict";

	var formattedData = {
		'string': {},
		'number': {},
		'latlong': {}
	};

	var blacklist	= [],
		timeData	= {},
		time		= false,
		counter		= 0;

	/*
	* We store strings in a format that represents them as a pie chart, we
	* create a key and append an array counting the number of times a string
	* appears
	*
	* @param key, the current name
	* @param value, the value
	*/
	var storeString = function (key, value) {
		// create the key
		if (!formattedData.string[key]) {
			formattedData.string[key] = {};
		}
		// create the value
		if (!formattedData.string[key][value]) {
			formattedData.string[key][value] = 0;
		}
		// increment
		formattedData.string[key][value] += 1;
	};

	/**
	* Store an integer against a timestamp
	*
	* @param key, the current name
	* @param value, the value
	*/
	var storeInt = function (key, value) {
		if (!formattedData.number[key]) {
			formattedData.number[key] = {};
		}
		if (!formattedData.number[key][time]) {
			formattedData.number[key][time] = 0;
		}
		formattedData.number[key][time] += value;
	};

	/*
	* Store an Lat Long
	*
	* @param key, the current name
	* @param value, the value
	*/
	var storeLatLong = function (key, value) {
		if (!formattedData.latlong[key]) {
			formattedData.latlong[key] = [];
		}
		formattedData.latlong[key].push(value);
	};

	/*
	* Store an Array
	*
	* @param key, the current name
	* @param value, the value
	*/
	var storeArray = function (key, value) {
		// first splice so we only have 10 items
		value.splice(10);

		// store each of them as a string
		value.each(function (item) {
			// determine the content of the array
			if (Object.isString(item)) {
				// store as a string
				storeString(key, item);
			} else if (Object.isNumber(item)) {
				// store as a int
				storeInt(key, item);
			} else {
				// must be an object, which we need to reflatten
				flatten(item, key);
			}
		});
	};

	/*
	* Some sections of the data are really badly thought through and should be
	* changed, this is where we are doing this
	*
	* @param Data, the data object
	*/
	var fixes = function (data) {

		// demographic.age_range
		if (data && data.demographic && data.demographic.age_range) {
			var start = data.demographic.age_range.start;
			var end = data.demographic.age_range.end;
			data.demographic.age_range = start + '-' + end;
		}

		// compensation when lat and long come through as numbers
		var lat = false,
			lng = false;

		if (data && data.interaction && data.interaction.geo && data.interaction.geo.latitude) {
			lat = data.interaction.geo.latitude;
			lng = data.interaction.geo.longitude;
			data.interaction.geo = lat + ',' + lng;
		}

		if (data && data.twitter && data.twitter.geo && data.twitter.geo.latitude) {
			lat = data.twitter.geo.latitude;
			lng = data.twitter.geo.longitude;
			data.twitter.geo = lat + ',' + lng;
		}

		if (data && data.twitter && data.twitter.retweeted && data.twitter.retweeted.geo) {
			lat = data.twitter.retweeted.geo.latitude;
			lng = data.twitter.retweeted.geo.longtitude;
			data.twitter.geo = lat + ',' + lng;
		}

		// convert UTC offset to a string
		if (data && data.twitter && data.twitter.user && data.twitter.user.utc) {
			data.twitter.user.utc = "" + data.twitter.user.utc + "";
		}
	};

	/**
	 * Count the total number of interactions and count the total over time
	 * 
	 * @param  {Object} data The interaction
	 */
	var count = function (data) {

		var date = data.interaction_created_at ? data.interaction_created_at : data.interaction.created_at;

		time = new Date(date);
		time.setMilliseconds(0);

		// if we go over a minutes, only store minutes
		if (Object.keys(timeData).length > 60) {
			time.setSeconds(0);
		}

		time = time.getTime();

		if (!timeData[time]) {
			timeData[time] = {
				count: 0
			};
		}

		timeData[time].count += 1;
	};

	/*
	* Take an interaction object and flatten it, we are taking all the nested
	* objects of objects and converting them into the format of object_object
	* so we can easily count them. This function recurses quite a bit.
	*
	* @param data, data Object
	* @param name, the current name we are on
	*/
	var flatten = function (data, name) {
		
		// keep a copy of the name
		var _name	= name,
			date	= false;

		// fix the data
		fixes(data);

		// we only show a total count with time, so they have to be there
		if (data && ((data.interaction && data.interaction.created_at) || data.interaction_created_at)) {
			count(data);
		} 

		// loop through all the data
		for (var key in data) {
			if (data.hasOwnProperty(key)) {

				// build up the name
				name = name ? name += '_' + key : key;

				// skip if in the blacklist
				if (blacklist.indexOf(name) !== -1) {
					name = _name;
					break;
				}

				// if it grows too large, remove it but only for strings
				if (formattedData.string[name] && Object.keys(formattedData.string[name]).length > 500) {
					blacklist.push(name);
					//delete(formattedData.string[name]);
					name = _name;
					return;
				}

				// comparisons
				if (Object.isString(data[key])) {

					// is a latlong?
					if (data[key].match(/^(\-?\d+(\.\d+)?),\s*(\-?\d+(\.\d+)?)$/)) {
						// latlong
						storeLatLong(name, data[key]);
					} else {
						// string
						storeString(name, data[key]);
					}

				} else if (Object.isNumber(data[key])) {
					// number
					storeInt(name, data[key]);
				} else if (Object.isArray(data[key])) {
					// array
					storeArray(name, data[key]);
				} else {
					// object
					flatten(data[key], name);
				}

				name = _name;

			}
		}
	};

	return {

		/*
		* Take an interaction object and flatten it, we are taking all the nested
		* objects of objects and converting them into the format of object_object
		* so we can easily count them. This function recurses quite a bit.
		*
		* @param data, data Object
		* @param name, the current name we are on
		*/
		flatten: function (data, name) {
			flatten(data, name);
		},

		/*
		* Get all the formatted data in it's current state
		*
		* @return Object of data
		*/
		get: function () {
			return formattedData;
		},

		getTime: function () {
			return timeData;
		},

		getBlacklist: function () {
			return blacklist;
		}
	};
})();