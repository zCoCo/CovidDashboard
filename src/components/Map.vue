<template>
  <div class="map">
    <l-map
      :center="[39.8283, -98.5795] /* Geographic Center of the US */ "
      :zoom="4"
      style="height: 500px;"
      :options="mapOptions">
        <l-choropleth-layer
          :data="coreData"
          titleKey="county"
          idKey="fips"
          :value="value"
          :extraValues="extraValues"
          geojsonIdKey="GEOID"
          strokeColor="9c9c9c"
          currentStrokeColor="efefef"
          :strokeWidth="0.3"
          :currentStrokeWidth="2"
          :geojson="mapData"
          :colorScale="colorScale">
            <template slot-scope="props">
              <l-info-control
                :item="props.currentItem"
                :unit="props.unit"
                title="Region Data"
                placeholder="Hover over a region"/>
              <l-reference-chart
                :title="value.metric.trim()"
                :colorScale="colorScale"
                :min="props.min"
                :max="props.max"
                position="topright"/>
            </template>
        </l-choropleth-layer>
    </l-map>
  </div>
</template>

<script>
import { LMap } from 'vue2-leaflet'
import { InfoControl, ReferenceChart, ChoroplethLayer } from 'vue-choropleth'

// Load Map Data:
// GeoJSON Map Outlines at varying resolutions:
import outline_us from '@/data/geo/us_outline_20m.js'
// import outline_states from '@/data/geo/us_states_20m.js'
// import outline_counties from '@/data/geo/us_counties_20m_fips.js'
// import outline_congress from '@/data/geo/us_congressional2010_20m.js'

export default {
  name: 'Map',
  props: {
    value: {
      type: Object,
      required: true
    },
    geoData: { // Core Data to be Represented
      type: Object,
      required: true
    },
    coreData: { // Core Data to be Represented
      type: Array,
      required: true
    },
  },
  data(){
    return {
      colorScale: ['#f6e5c5','#f7b538', '#e89f3c','#de864a', '#d6695c','#c2574c', '#ad453c','#98342e', '#822420','#6c1414', '#540804'],
      mapOptions: {
        attributionControl: true
      }
    }
  },
  components: {
    'l-map': LMap,
    'l-info-control': InfoControl,
    'l-reference-chart': ReferenceChart,
    'l-choropleth-layer': ChoroplethLayer
  },
  mounted() {
  },
  methods: {
    /*
    Uncomment if you're loading new US GeoJSON data and want to format and
    condense it while still allowing for fast loading.
    formatRawData(){
      // Adds fips field to county data:
      this.outlines.counties.features.forEach( c => {
        // Create fips identifier:
        c.properties.fips = c.properties.GEO_ID.substr(-5);
        // Remove redundant and unnecessary properties:
        delete c.properties.GEO_ID;
        delete c.properties.COUNTY;
        delete c.properties.LSAD;
        delete c.properties.CENSUSAREA;
      });
      let str = JSON.stringify(this.outlines.counties, null, 1);
      //str = str.replace(/(?<!},)\n\w*(?=[^{])/g, ' '); // <- different formatting option
      str = str.replace(/\n/g, ' ');
      str = str.replace(/ +/g, ' ');
      str = str.replace(/}, *{/g, '}\n,\n{');
      console.log(str);
      console.log("Counties Formatted.");
    }*/
  },
  computed: {
    // Return the map data to be displayed:
    mapData(){
      if(Object.keys(this.geoData).length === 0){ // If empty GeoData was given, display US outline by default
        return outline_us;
      }
      return this.geoData;
    },

    extraValues(){
      // List of elements that are guaranteed to be in the extra values list:
      let must = [
        {
          key: "collection_date",
          metric: "(closest prior collection date)"
        }
      ];
      // List of elements that should be in the extra values list:
      let extras = [
        {
          key: 'cases',
          metric: ' Confirmed Cases'
        },
        {
          key: 'deaths',
          metric: ' Confirmed Deaths'
        },
        {
          key: 'population',
          metric: ' People'
        },
        {
          key: 'households',
          metric: ' Households'
        },
        {
          key: 'density',
          metric: ' People / Sq. Mile'
        }
      ];
      // Add useful fields but don't repeat the main value:
      for(let i = 0; i < extras.length; ++i){
        if(this.value.key === extras[i].key){
          extras.splice(i,1);
        }
      }
      return [...extras, ...must];
    }
  }
}
</script>

<style scoped lang="scss">
  @import "~leaflet/dist/leaflet.css";

</style>
