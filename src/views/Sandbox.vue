<template>
  <div class="sandbox">
    <h1> Console Sandbox </h1>
    <p>
      This is just a basic console sandbox. <br />
      <vue-markdown>
        All it does is load the latest data from the *Covid Tracking Project* and print it to the debug console. If you put a breakpoint after where it says `// [BREAKPOINT HERE]` (under `webpack://src/views/Sandbox.vue` in the source inspector), you can then play around with the data. You have access to `axios`, `moment.js`, and the fantastic `NovelCovid` module in the `self` object if you need it. Note: a `NovelCovid` instance is available as `self.track` in the console.)
      </vue-markdown>
      <br />
      Happy scavenging!
    </p>
    <br />
    <button @click="load()">Load Data</button>
    <br />
    <div v-if="Object.keys(data).length > 0">
     {{ data }}
    </div>
  </div>
</template>

<script>
import VueMarkdown from 'vue-markdown'
import prettyjson from 'prettyjson'

import axios from 'axios'
import moment from 'moment'

import NovelCovid from 'novelcovid'

export default {
  name: 'Sandbox',
  data(){
    return {
      track: new NovelCovid(),
      data: {},
      // Allow modules to be accessed through 'this':
      axios,
      moment,
      NovelCovid
    }
  },
  components: {
    VueMarkdown
  },
  methods: {
    async load(){
      const self = this; // All 'this' to be accessed in console
      const { data } = await axios.get("https://covidtracking.com/api/us/daily");

      this.data = data;
      this.data.forEach( d => {
        const date = moment(d.date, "YYYYMMDD").format("MM/DD");
        console.log(date);
        console.log(d);
      });

      // [BREAKPOINT HERE]
      console.log("break");
    }
  },
  computed: {
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
  p {
    text-align: left;
    margin: 1rem 2rem;
  }
</style>
