'use strict';
/* A GeoJSON Feature VueChoropleth data Compatible Container of Information
about a region.
Includes the ability to store a number of timeseries streams (defined in a
static member at the end of the file).

Note: the implementation of some operations in this class may be inelegant but
that's because they are optimized for speed and minimal memory usage since an
application may have thousands of Region objects, each with thousands of stream
entries.

Author: Connor W. Colombo
Last Updated: 4/26/2020
*/

const moment = require('moment');

import TimeseriesCollection from './TimeseriesCollection.js'

class Region {
  // Creates an empty dataset for a Region as part of the given parent
  // RegionalizedData collection.
  constructor(parent){
    this.parent = parent;
    // Default geo meta data:
    this.population = 0;
    this.households = 0;
    this.area = 0;

    // Basic Geo-JSON Feature Members (not dependent on other members):
    this.type = 'Feature';
    this.geometry = {};

    // Preallocate datastreams:
    this.datastreams = new TimeseriesCollection(this.parent.NDays, Object.keys(Region.stream_metadata));

    return new Proxy(this, this);
  } // ctor

  // Proxy getter catcher for undefined members:
  get(obj, prop){
    if(prop in obj){ // TODO: NOTE: rn, this overrides default getters for computed properties like "get density". Test and find a solution to this... Reflect Proxy receiver?
      // If the property exists, return it:
      return obj[prop];
    } else if(obj.datastreams[prop]){
    // If the property requested is a datastream, return its value at the default day:
      return obj.datastreams[prop][this.parent.day_default];
    } else{
    // Determine if requested value can be derived from existing streams using
    // the form "property_per_something":
      let denomIdx = prop.lastIndexOf('_');
      let perIdx = prop.substring(0,denomIdx).lastIndexOf('_'); // should === 'per'
      let baseProp = prop.substring(0,perIdx);
      let per = prop.substring(perIdx+1,denomIdx);
      let denom = prop.substring(denomIdx+1);

      if(per === 'per' && obj.datastreams[baseProp]){
      // if a valid request:
        if(denom in obj){
        // if denominator is a simple property of this Region, just divide:
          return obj.datastreams.map( d => d / obj[denom] );
        } else if(obj.datastreams[denom]){
        // if denominator is itself a datastream, divide each element:
          let denomArr = obj.datastreams[denom]; // Capture it outside of the map in case it's computed
          return obj.datastreams.map( (d,i) => d / denomArr[i] );
        } else {
          // For special cases:
          if(denom === "cap"){
          // per 1M people
            return obj.datastreams.map( d => d / obj.population * 1e6 );
          }
        }

      } else{
       return undefined;
      }
    }
  }

  // Computed properties:
  get density(){
    return this.population / this.area;
  }

  // GeoJSON Compatibility layer (allow a Region object to be
  // substituted for a GeoJSON Feature object)
  get properties(){
    return this;
  }





  // Returns the Default Data this Object Should Contain
  static defaultData(){
    return { // data which gets saved to JSON
      properties: {
        area: 0,
        population: 0,
        households: 0
      },
      days: Uint16Array(),
      collection_days: Uint16Array(),
    }
  }

  static fields(){
    return
    ];
  }

  // Datastreams:
  get x(){

  }

  rate(){

  }

  smooth(){

  }
} // class: Region

// Static fields:
// Metadata about all available streams:
Region.stream_metadata = {
  cases: {
    name: "cases",
    displayName: "Confirmed Cases",
    desc: "Cases confirmed by testing"
  },
  deaths: {
    name: "deaths",
    displayName: "Confirmed Deaths",
    desc: "Deaths confirmed by testing"
  }
};

export default Region;
