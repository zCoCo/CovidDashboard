<template>
  <div id="app">
    <div class="head">
      <div class="title">
        <h1>RONA Dashboard</h1>
        <h4>Rapid Online Novelcoronavirus Analysis Dashboard</h4>
      </div>
      <div id="nav">
        <router-link to="/">Home</router-link> |
        <router-link to="/dashboard">Dashboard</router-link> |
        <router-link to="/sandbox">Sandbox</router-link>
      </div>
    </div>
    <router-view/>
    <footer>
      DISCLAIMER: This tool and all data in it is for educational purposes only and is provided for free without any waranty or guarantee. The accuracy, recency, fidelity, and trustworthy of this data cannot independently verified or guaranteed by the developer. See the <b>Data Sources</b> page for information on the data sources used.
    </footer>
  </div>
</template>

<script>
import Map from '@/components/Map.vue'

export default {
  name: 'App',
  created(){
    console.log("To any future employers or code scavengers: I'm sorry. I don't have much time so this isn't my best work, or even particularly well crafted 😭. I promise I don't normally push to production.");
  }
}
</script>
<style lang="scss">
  #app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #2c3e50;
  }

  .head {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;

    padding: 1rem 2rem;

    &h1 {
      font-weight: bold;
    }
  }

  #nav {
    text-align: center;
    padding: 1rem;

    a {
      font-weight: bold;
      color: #2c3e50;

      &.router-link-exact-active {
        color: #42b983;
      }
    }
  }
</style>
