define([
	'jquery',
	'underscore',
	'backbone',
	'RawDeflate',
	'collections/dashboard/DashboardCollection',
	'collections/user/DataSourceUserCollection',
	'collections/visualization/VisualizationCollection'
], function ($, _, Backbone, RawDeflate, DashboardCollection, DataSourceUserCollection, VisualisationCollection) {

	var SyncModel = Backbone.Model.extend({

		/**
		 * Takes the data we have in local storage and represents it as an object with all the 
		 * sensitive information removed!
		 * 
		 * @return {Object} A object representing the local storage
		 */
		exportData: function (dashboard) {

			var download = {};

			// all datasources
			download.DataSourceCollection = _.map(DataSourceUserCollection.toJSON(), function (datasource) {
				// remove the api key
				if (datasource.apikey) { datasource.apikey = ''; }
				if (datasource.username) { datasource.username = ''; }
				return datasource;
			});
			
			// get the data
			download.Data = JSON.parse(unescape(RawDeflate.inflate(data)));

			// get this dashboard
			download.Dashboard = dashboard.toJSON();

			// get the visualisations
			download.Visualisations = _.map(dashboard.getVisualizations(), function (model) {
				return model.toJSON();
			});

			return download;
		},

		/**
		 * Takes in an object and merges it with the existing local storage
		 * 
		 * @param  {Object} d The data representation
		 */
		importData: function (d) {

			var download = JSON.parse(d.data),
				data = JSON.parse(unescape(RawDeflate.inflate(data))) || {};

			// import the datasource
			_.each(download.DataSourceCollection, function (collection) {
				if (DataSourceUserCollection.get(collection.id)) {
					DataSourceUserCollection.get(collection.id).update(collection);
				} else {
					DataSourceUserCollection.create(collection);
				}
			});

			// import the dashboards
			if (DashboardCollection.get(download.Dashboard.id)) {
				DashboardCollection.get(download.Dashboard.id).update(download.Dashboard);
			} else {
				DashboardCollection.create(download.Dashboard);
			}

			// import the visualisations
			_.each(download.Visualisations, function (collection) {
				if (VisualisationCollection.get(collection.id)) {
					VisualisationCollection.get(collection.id).update(collection);
				} else {
					VisualisationCollection.create(collection);
				}
			});

			// update the data
			for (var id in download.Data) {
				if (download.Data.hasOwnProperty(id)) {
					if (data[id] === undefined) {
						data[id] = download.Data[id];
					} else {
						// attempt to extend it
						_.extend(data[id], download.Data[id]);
					}
				}
			}

			/**
			 * @todo If the users cache is full then we will have a problem 
			 */
			try {
				var deflatedObject = RawDeflate.deflate(escape(JSON.stringify(this.data)));
				localStorage.setItem('data', deflatedObject);
			} catch (exception) {
				if (exception.name === "QUOTA_EXCEEDED_ERR") {
					alert('We are unable to import the data, this will exceed your quota.');
				}
			}
		}
	});
	return new SyncModel();
});

