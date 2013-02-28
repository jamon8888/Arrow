define([
	'jquery',
	'underscore',
	'backbone',
	'collections/dashboard/DashboardCollection',
	'collections/user/DataSourceUserCollection'
], function ($, _, Backbone, DashboardCollection, DataSourceUserCollection) {

	var SyncModel = Backbone.Model.extend({

		/**
		 * Takes the data we have in local storage and represents it as an object with all the 
		 * sensitive information removed!
		 * 
		 * @return {Object} A object representing the local storage
		 */
		exportData: function () {
			var download = {};
			// get everything in our localstorage
			Object.keys(localStorage).forEach(function (key) {
				download[key] = localStorage.getItem(key);
			});

			if (download.DataSourceCollection) {
				// we need to remove the sensitive information from the datasources
				var datasources = download.DataSourceCollection.split(',');
				_.each(datasources, function (datasource) {
					var ds = JSON.parse(download['DataSourceCollection-' + datasource]);
					for (var key in ds) {
						if (key !== 'name' && key !== 'niceName' && key !== 'id' && key !== 'hash') {
							delete(ds[key]);
						}
					}
					download['DataSourceCollection-' + datasources] = JSON.stringify(ds);
				});
			}

			return download;
		},

		/**
		 * Takes in an object and merges it with the existing local storage
		 * 
		 * @param  {Object} d The data representation
		 */
		importData: function (d) {
			// data
			var data = JSON.parse(localStorage.getItem('data')) || {};
			d.data = JSON.parse(d.data);
			for (var id in d.data) {
				if (d.data.hasOwnProperty(id)) {
					if (data[id] === undefined) {
						data[id] = d.data[id];
					} else {
						// attempt to extend it
						_.extend(data[id], d.data[id]);
					}
				}
			}
			localStorage.setItem('data', JSON.stringify(data));

			// datasources
			var datasources = d.DataSourceCollection.split(',');
			_.each(datasources, function (ds) {
				var item = JSON.parse(d['DataSourceCollection-' + ds]);
				if (!DataSourceUserCollection.get(item.id)) {
					DataSourceUserCollection.create(item);
				} else {
					console.log('Datasource already exists');
				}
			});

			// dashboards
			var dashboards = d.DashboardCollection.split(',');
			_.each(dashboards, function (dashboard) {
				var item = JSON.parse(d['DashboardCollection-' + dashboard]);
				if (!DashboardCollection.get(item.id)) { 
					DashboardCollection.create(item);
				} else {
					console.log('Dashboard already exists');
				}
			});
		}
	});
	return new SyncModel();
});

