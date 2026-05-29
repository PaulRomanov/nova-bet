<script setup>
import { useWeb3Store } from '../stores/web3.js'
import { useLangStore } from '../stores/lang.js'

const web3 = useWeb3Store()
const lang = useLangStore()
</script>

<template>
  <Transition name="slide-down">
    <div
      v-if="web3.isWrongNetwork"
      class="relative z-20 flex items-center justify-center gap-4 mx-auto mt-4 max-w-xl px-5 py-3 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-300 text-sm text-center"
    >
      <span>{{ lang.t.wrongNetwork }}</span>
      <button
        @click="web3.switchToSepolia()"
        class="px-3 py-1 rounded-lg bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400 transition-colors shrink-0"
      >
        {{ lang.t.switchNetwork }}
      </button>
    </div>
  </Transition>
</template>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
