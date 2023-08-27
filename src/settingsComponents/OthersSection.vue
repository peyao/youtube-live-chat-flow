<template>
  <div class="others-section">
    <v-switch
      v-model="chatVisible"
      class="mt-0 pt-0"
      label="Always Show Chat"
      hint="By default, the chat is hidden for YouTube Premieres."
      persistent-hint
      dense
    />
    <v-switch
      v-model="startEnabled"
      class="mt-0 pt-0"
      label="Enable Chat By Default"
      hint="If disabled, live chat flow won't start until you enable it in the player's bottom controls."
      persistent-hint
      dense
    />
    <!-- <v-switch
      v-model="bottomChatInputEnabled"
      class="mt-3 pt-0"
      label="Bottom Chat Input"
      hint="Move the chat input to the bottom controls on video. (Page reload required)"
      persistent-hint
      dense
    />
    <v-switch
      v-model="growBottomChatInputEnabled"
      :disabled="!bottomChatInputEnabled"
      class="mt-3 pt-0"
      label="Grow Bottom Chat Input"
      dense
    /> -->

    <div class="caption" style="margin-top: 12px">(Advanced) FPS Limiting (0 to disable, higher values have higher impact on GPU)</div>
    <v-slider
      v-model="performanceThrottling"
      class="align-center mb-5"
      min="0"
      max="240"
      step="1"
      dense
      hide-details
    >
      <template #prepend>
        <v-text-field
          v-model="performanceThrottling"
          class="mt-0 pt-0"
          dense
          hide-details
          single-line
          type="number"
          min="0"
          max="240"
          step="1"
          suffix=""
          style="width: 75px"
        />
      </template>
    </v-slider>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from '@vue/composition-api'
import { settingsStore } from '~/store'

export default defineComponent({
  setup() {
    const chatVisible = computed({
      get: () => {
        return settingsStore.chatVisible
      },
      set: (value) => {
        settingsStore.setChatVisible({
          chatVisible: value,
        })
      },
    })
    const startEnabled = computed({
      get: () => {
        return settingsStore.startEnabled
      },
      set: (value) => {
        settingsStore.setStartEnabled({
          startEnabled: value
        })
      }
    })
    const bottomChatInputEnabled = computed({
      get: () => {
        return settingsStore.bottomChatInputEnabled
      },
      set: (value) => {
        settingsStore.setBottomChatInputEnabled({
          bottomChatInputEnabled: value,
        })
      },
    })
    const growBottomChatInputEnabled = computed({
      get: () => {
        return settingsStore.growBottomChatInputEnabled
      },
      set: (value) => {
        settingsStore.setGrowBottomChatInputEnabled({
          growBottomChatInputEnabled: value,
        })
      },
    })
    const performanceThrottling = computed({
      get: () => {
        return settingsStore.performanceThrottling
      },
      set: (value) => {
        settingsStore.setPerformanceThrottling({
          performanceThrottling: value
        })
      }
    })

    return {
      bottomChatInputEnabled,
      chatVisible,
      startEnabled,
      growBottomChatInputEnabled,
      performanceThrottling
    }
  },
})
</script>
