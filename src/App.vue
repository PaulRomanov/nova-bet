<script setup>
import { ref } from 'vue'
import { useWeb3Store } from './stores/web3.js'
import { useLangStore } from './stores/lang.js'

import TheHeader from './components/TheHeader.vue'
import BalancePanel from './components/BalancePanel.vue'
import GameHistory from './components/GameHistory.vue'
import CoinFlipGame from './components/CoinFlipGame.vue'
import ResultModal from './components/ResultModal.vue'
import WrongNetworkBanner from './components/WrongNetworkBanner.vue'

const web3 = useWeb3Store()
const lang = useLangStore()

const isModalOpen = ref(false)
const modalData = ref(null)

function openResultModal(result) {
  modalData.value = result
  isModalOpen.value = true
}
</script>

<template>
  <div class="min-h-screen bg-gray-950 text-slate-100 font-sans">
    <div class="fixed inset-0 pointer-events-none overflow-hidden">
      <div
        class="absolute -top-40 -left-40 w-96 h-96 bg-violet-700 rounded-full opacity-20 blur-3xl"
      />
      <div
        class="absolute top-1/2 -right-32 w-80 h-80 bg-cyan-500 rounded-full opacity-10 blur-3xl"
      />
      <div
        class="absolute bottom-0 left-1/3 w-72 h-72 bg-fuchsia-600 rounded-full opacity-10 blur-3xl"
      />
    </div>

    <TheHeader />

    <WrongNetworkBanner />

    <div
      v-if="!web3.isContractConfigured"
      class="relative z-10 mx-auto mt-6 max-w-2xl px-5 py-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm text-center"
    >
      {{ lang.t.contractWarning }}
    </div>

    <main
      class="relative z-10 max-w-5xl mx-auto px-4 py-10 grid gap-6 lg:grid-cols-3"
    >
      <aside class="flex flex-col gap-5">
        <BalancePanel />
        <GameHistory />
      </aside>
      <CoinFlipGame @game-finished="openResultModal" />
    </main>

    <footer class="relative z-10 text-center text-slate-700 text-xs pb-6">
      NovaBet Casino · MVP · Sepolia Testnet
    </footer>
    <ResultModal
      :is-open="isModalOpen"
      :data="modalData"
      @close="isModalOpen = false"
    />
  </div>
</template>
