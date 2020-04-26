<template>
  <div class="home">
    <Map
      :geoData="activeMap"
      :coreData="activeData"
      :value="{
        key: 'deaths_per_cap',
        metric: ' Confirmed Deaths per 1M People'
      }"
    />
  </div>
</template>

<script>
import Map from '@/components/Map.vue'

import { NovelCovid } from 'novelcovid'
import census from 'citysdk'

import moment from 'moment'
import * as util from '@/util.js'

const DATE_FORMAT = "YYYY-MM-DD";

export default {
  name: 'Home',
  components: {
    Map
  },
  data() {
    return {
      day: moment(), // Day being displayed (today by default)
      resolution: 'counties', // Resolution being displayed
      track: new NovelCovid(), // Covid data procurement object
      countyFIPS: new Set(), // FIPS IDs of all counties represented in the data
      geoData: { // Geographic and census data
        us: {},
        states: {},
        counties: {}
      },
      covidData: { // Full history of Covid data
        us: [],
        states: [],
        counties: []
      },
      checklist: { // Which data elements have been loaded / computed
        geoData: { // Geographic and census data
          states: 0,
          counties: 0
        },
        covidData: { // Full history of Covid data
          counties: 0
        },
        combo: 0 // Computed metadata combining geo and covid data
      }
    }
  },
  created(){
    this.dataset = RegionalizedData.loadFromOnline();
    /*
    console.log("Loading Geographic and Census Data . . .");
    this.loadGeoData();
    console.log("Loading Covid Data . . .");
    this.loadCovidData();*/
  },

  methods: {

    choroplethData(){
      this.dataset.map( region => {
        let data = {fips: string(region.data.fips)};
        data[this.choropleth_value] = region.data[choropleth_value][day_num-region.day_zero];
        return data;
      });
    }

    // Does what it says on the tin (loads geographic and census data).
    loadGeoData(){
      // Load County Data:
      console.log('\t > County . . .');
      census(
        {
          vintage: 2018, // most recent complete dataset
          geoHierarchy: { county: '*' },
          geoResolution: "20m",
          sourcePath: ["acs", "acs5"],
          values: ["B01001_001E"] // population
        },
        (err,res) => {
          if(err){
            return console.error("Failed to load county data.", err);
          }
          this.geoData.counties = res;

          // Get housing data:
          census(
            {
              vintage: 2018,
              geoHierarchy: { county: '*' },
              sourcePath: [ "acs", "acs5", "profile" ],
              values: [ "DP02_0001E" ]
            },
            (err,res) => {
              if(err){
                return console.error("Failed to load county household data.", err);
              }
              const self = this;
              // Merge datasets:
              res.forEach( d => {
                this.geoData.counties.features.find( x => x.properties.GEOID === d.state + d.county ).properties.DP02_0001E = d.DP02_0001E;
              });
              console.log("County-Level Geo Data Loaded.");
            }
          );
        }
      );
      // Load State Data
      console.log('\t > State . . .');
      census(
        {
          vintage: 2018, // most recent complete dataset
          geoHierarchy: { state: '*' },
          geoResolution: "20m",
          sourcePath: ["acs", "acs5"],
          values: ["B01001_001E"] // population
        },
        (err,res) => {
          if(err){
            return console.error("Failed to load county data.", err);
          }
          this.geoData.states = res;

          // Get housing data:
          census(
            {
              vintage: 2018,
              geoHierarchy: { state: '*' },
              sourcePath: [ "acs", "acs5", "profile" ],
              values: [ "DP02_0001E" ]
            },
            (err,res) => {
              if(err){
                return console.error("Failed to load state household data.", err);
              }
              // Merge datasets:
              res.forEach( d => {
                this.geoData.states.features.find( x => x.properties.GEOID === d.state ).properties.DP02_0001E = d.DP02_0001E;
              });
              console.log("County-Level Geo Data Loaded.");
            }
          );
        }
      );
    },

    // Does what it says on the tin (+ formats it and computes metaparams).
    loadCovidData(){
      console.log("\t > County . . .");
      this.track.nytCounties().then(
        data => {
          // Extract Date Properties:
          data.forEach( d => {
            d.day = moment(d.date, DATE_FORMAT);
          });

          // Collect the IDs of all counties:
          data.forEach( d => {
            this.countyFIPS.add(d.fips);
          });

          // Fill in any missing days:
          this.countyFIPS.forEach( fips => { // For every county:
            // Collect the indices corresponding to each for the county:
            let entries = data.filter( d => d.fips === fips );
            // Get date range of data:
            let dates = entries.map( d => d.day );
            let firstDay = moment.min(dates);

            // For every entry, check to see if an entry exists for that county
            // for the next day (if not tomorrow), if it doesn't exist, create it.
            let today = moment(); // Compute this once so it remains fixed during iteration
            let day = firstDay.clone();
            let currDayData = entries.find( d => d.day.isSame(day) );
            currDayData.collection_date = day.format(DATE_FORMAT); // Add reference to original date of collection
            while( day.isBefore(today, 'day') ){
              let nextDay = day.clone().add(1,'d');
              let nextDayData = entries.find( d => d.day.isSame(nextDay) );

              if(nextDayData === undefined){
                // Create copy of current data but with the next day's date:
                nextDayData = { ...currDayData };
                nextDayData.day = nextDay;
                nextDayData.date = nextDay.format(DATE_FORMAT);
                nextDayData.collection_date = currDayData.collection_date; // Preserve reference to original date of collection

                data.push(nextDayData); // Add reference to original dataset for later use
              } else {
                nextDayData.collection_date = nextDayData.date; // Add reference to original date of collection for data uniformity
              }

              currDayData = nextDayData;
              day = nextDay;
            }
          });

          this.covidData.counties = data;
          console.log("Covid Data Loaded.");
        },
        err => {
          console.error("Couldn't load county Covid data.", err);
        }
      );
    }
  },
  computed: {
    // Compute data to be fed to the choropleth which combines geographic,
    // census, and covid data.
    comboData(){
      let combo = this.covidData; // note: this will also modify covidData. That's fine. Mainly this prop is used to add reactivity.

      // Pre-compute additional data:
      // per capita, per household, per area, per density
      for(const res in combo){
        if(Object.prototype.hasOwnProperty.call(this.geoData[res], 'features')){
          // Only modify data for the selected day:
          let data = combo[res].filter( d => d.day.isSame(this.day, 'day') );
          // For every region:
          this.geoData[res].features.forEach( region => {
            // Grab relevant metadata:
            let pop = region.properties.B01001_001E;
            let houses = region.properties.DP02_0001E;
            let area = region.properties.ALAND / 2.59e6; // m^2 -> mi^2
            let density = pop/area;
            // Grab all covid entries for the region:
            let entries = data.filter( d => d.fips === region.properties.GEOID );
            // Add metadata to each entry:
            entries.forEach( e => {
              if(res === 'counties' && !e.county.includes("County")){
                e.county = e.county + " County"; // Clearly separate names of counties from states
              }
              e.pop = pop - e.deaths;
              e.population = util.formatPopulation(e.pop);
              e.households = util.formatPopulation(houses);
              e.area = area;
              e.density = util.formatPopulation(density);
              e.cases_per_cap = util.formatPopulation(e.cases / e.pop * 1e6);
              e.cases_per_house = util.formatPopulation(e.cases / houses * 1e6);
              e.cases_per_area = e.cases / area;
              e.cases_per_dens = util.formatPopulation(e.cases / density);
              e.deaths_per_cap = util.formatPopulation(e.deaths / e.pop * 1e6);
              e.deaths_per_house = util.formatPopulation(e.deaths / houses * 1e6);
              e.deaths_per_area = e.deaths / area;
              e.deaths_per_dens = util.formatPopulation(e.deaths / density);
            });
          });
        }
      }

      console.log("Combo Data Updated.");
      return combo;
    },
    // Returns the GeoJSON being displayed on the map:
    activeMap(){
      return this.geoData[this.resolution];
    },
    // Returns the data being displayed:
    activeData(){
      // Find most recent data on or before selected day:
      return this.comboData[this.resolution].filter( d => d.day.isSame(this.day, 'day') );
    }
  }
}
</script>

<style scoped lang="scss">

</style>
