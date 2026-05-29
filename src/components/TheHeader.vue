<script setup>
import { useWeb3Store } from '../stores/web3.js'
import { useLangStore } from '../stores/lang.js'

const web3 = useWeb3Store()
const lang = useLangStore()
</script>

<template>
  <header
    class="relative z-10 flex items-center justify-between px-6 py-4 border-b border-white/5 backdrop-blur-sm"
  >
    <div class="flex items-center gap-3">
      <span class="text-2xl">🎰</span>
      <span
        class="text-xl font-bold tracking-widest bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent"
      >
        NOVA<span class="text-white">BET</span>
      </span>
    </div>

    <div class="flex items-center gap-3">
      <button
        @click="lang.toggleLang(); web3.playClick()"
        class="px-3 py-1.5 text-xs font-bold rounded-lg border border-white/10 hover:border-violet-500/50 hover:bg-white/5 transition-all duration-200"
      >
        {{ lang.currentLang.toUpperCase() }}
      </button>

      <button
        v-if="!web3.isConnected"
        @click="web3.connectWallet()"
        :disabled="web3.isLoading"
        class="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-violet-900/40"
      >
        <svg
          v-if="web3.isLoading"
          class="w-4 h-4 animate-spin"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          />
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          />
        </svg>
        <span v-if="web3.isLoading">{{ lang.t.connecting }}</span>
        <span v-else>{{ lang.t.connectWallet }}</span>
      </button>

      <div v-else class="flex items-center gap-3">
        <div class="text-right hidden sm:block">
          <div class="text-xs text-slate-400">{{ lang.t.wallet }}</div>
          <div class="text-sm font-mono font-semibold text-cyan-400">
            {{ web3.shortAddress }}
          </div>
        </div>
        <div class="text-right">
          <div class="text-xs text-slate-400">ETH</div>
          <div class="text-sm font-bold text-white">
            {{ web3.walletBalance }}
          </div>
        </div>
        <button
          @click="web3.disconnectWallet()"
          class="px-3 py-1.5 text-xs rounded-lg border border-white/10 hover:border-red-500/50 hover:text-red-400 transition-all duration-200"
        >
          {{ lang.t.disconnect }}
        </button>
      </div>
    </div>
  </header>

  <Transition name="slide-down">
    <div
      v-if="web3.error"
      class="relative z-20 mx-auto mt-4 max-w-lg px-5 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm text-center"
    >
      ⚠️ {{ web3.error }}
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
