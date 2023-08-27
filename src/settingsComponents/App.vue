<template>
  <v-app>
    <v-main class="fill-height">
      <v-container fluid>
        <div class="subtitle-2">General</div>
        <general-section class="mt-3 mb-5 mx-3" />

        <div class="subtitle-2">Appearance</div>
        <appearance-section class="mt-3 mb-5 mx-3" />

        <div class="subtitle-2">Behavior</div>
        <behavior-section class="mt-3 mb-5 mx-3" />

        <!-- NOTE: Removed filter support (perf concern with implementation) -->
        <!-- <div class="subtitle-2">Filter</div> -->
        <!-- <filter-section class="mt-3 mb-5 mx-3" /> -->

        <div class="subtitle-2">Others</div>
        <others-section class="mt-3 mb-5 mx-3" />

        <v-btn class="mt-4" depressed block @click="handleClickReset">
          Reset Settings to Default
        </v-btn>
      </v-container>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import AppearanceSection from '~/settingsComponents/AppearanceSection.vue'
import BehaviorSection from '~/settingsComponents/BehaviorSection.vue'
import GeneralSection from '~/settingsComponents/GeneralSection.vue'
import OthersSection from '~/settingsComponents/OthersSection.vue'
import { settingsStore } from '~/store'

export default defineComponent({
  components: {
    AppearanceSection,
    BehaviorSection,
    GeneralSection,
    OthersSection,
  },
  setup() {
    const handleClickReset = () => {
      settingsStore.resetState()
    }

    return {
      handleClickReset,
    }
  },
})
</script>

<style lang="scss">
html {
  overflow-y: auto;
}
</style>

<style lang="scss" scoped>
.v-application {
  width: 640px;
}
</style>
