'use strict';
/*
 * Defines Standard Form for Data that Should be Contained by a Command. Allows
 * for Consistent Expectations when Passing Data between Mongo and Frontend UI.
 * Author: Connor W. Colombo, CMU
 * Last Update: 4/23/2019, Colombo
 */
 // { "_id" : ObjectId("5d0ebc51efd2a534837045aa"), "args" : { "Distance" : 200, "Images" : 60, "Speed" : 99 }, "lookupID" : 81, "name" : "MoveBackward", "stateFp" : "SUCC_SENT" }

const moment = require('moment');

class RegionalizedData {
  // Loads data with the given earliest day (a string in DATE_FORMAT).
  // Loading data from an earlier point will lead to more memory usage and
  // slower computation.
  constructor(earliest_day = "2020-01-01"){
    this.regions = []; // Empty array which will contain all regions.

    // Set a firm 0th day. Having one allows allows all other dates to
    // referenced as integer array indices relative to it (faster and less
    // memory usage).
    this.day_zero = moment(earliest_day, RegionalizedData.DATE_FORMAT);
    // Maximum number of days (and thus entries in each datastream):
    this.NDays = moment().diff(this.day_zero, 'd');
    // Day Default:
    this.day_default = 0; // Day number of date to display data for if a singular value is requested.

    // Basic Geo-JSON Feature Members (not dependent on other members):
    this.type = 'FeatureCollection';
  } // ctor

  // Adds a new region with the given integer id:
  add(id){
    return this.regions[id] = new Region(this);
  }

  // Returns the region with the given integer id:
  get(id){
    return this.regions[id];
  }

  // GeoJSON Compatibility layer (allow a RegionalizedData object to be
  // substituted for a GeoJSON FeatureCollection object)
  get features(){
    return this.regions;
  }

  /*
  TODO TODO TODO:
  preallocate all regions
  for each raw data entry:
    find correspdoing cell in Region[].field, populate.
  for each region:
    fill in the blanks
*/
  static loadFromOnline(earliest_day){
    let dataset = new RegionalizedData(earliest_day);

    // Ingest Geographic and Census Data (use all geographic regions as a way to preallocate Region datastreams):
    loadGeoData((err,res) => {
      res.forEach( d => {
        region = dataset.add(parseInt(d.properties.GEO_ID), new Region());
        region.fips = parseInt(d.properties.GEO_ID);
        region.geometry = d.geometry;
        region.population = d.properties.B01001_001E;
        region.households = d.properties.DP02_0001E;
        region.area = d.properties.ALAND / 2.59e6; // m^2 -> mi^2
      });

      // Load the Covid data, go through each entry and add it to the appropriate datastream.
      loadCovidData((err,res) => {
        res.forEach( d => {
          let region = dataset.get(parseInt(d.fips));
          day = moment(d.date, DATE_FORMAT).diff(dataset.day_zero, 'd');
          region.datastreams.collection_time = day;
          region.datastreams.cases[day] = d.cases;
          region.datastreams.deaths[day] = d.deaths;
        });
      });

    });

    return dataset;
  }

  loadFromCache(){

  }

  updateCache(){

  }

} // class: RegionalizedData

RegionalizedData.DATE_FORMAT = "YYYY-MM-DD";

export default RegionalizedData;
