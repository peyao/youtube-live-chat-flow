import Vue from 'vue'
import App from '~/settingsComponents/App.vue'
import '~/plugins/vue-composition-api'
import vuetify from '~/plugins/vuetify'

new Vue({
  el: '#app',
  render: (createElement) => createElement(App),
  vuetify,
})
