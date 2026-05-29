<script setup>
import { ref, computed } from 'vue'
import { useWeb3Store } from '../stores/web3.js'
import { useLangStore } from '../stores/lang.js'

const emit = defineEmits(['game-finished'])

const web3 = useWeb3Store()
const lang = useLangStore()

const betAmount = ref('0.01')
const lastResult = ref(null)
const isFlipping = ref(false)
const selectedSide = ref(null)

const SIDES = computed(() => [
  { id: 0, label: lang.t.heads, emoji: '🦅' },
  { id: 1, label: lang.t.tails, emoji: '🔮' },
])

const resultSideLabel = computed(() => {
  if (!lastResult.value) return ''
  return lastResult.value.result === 0
    ? `${lang.t.heads} 🦅`
    : `${lang.t.tails} 🔮`
})

async function handleFlip() {
  web3.playClick()
  if (selectedSide.value === null) {
    web3.error = lang.t.errorNoSide
    return
  }
  if (!betAmount.value || Number(betAmount.value) < 0.001) {
    web3.error = lang.t.errorMinBet
    return
  }

  isFlipping.value = true
  lastResult.value = null

  const result = await web3.flip(selectedSide.value, betAmount.value)

  // Keep animation going for at least 1.5s for UX
  await new Promise((r) => setTimeout(r, 1500))
  isFlipping.value = false

  if (result) {
    lastResult.value = result

    // Emit game result to parent so it can open the result modal
    setTimeout(() => {
      emit('game-finished', {
        won: result.won,
        payout: result.payout,
        bet: result.bet,
        sideLabel:
          result.result === 0 ? `${lang.t.heads} 🦅` : `${lang.t.tails} 🔮`,
      })
    }, 400)
  }
}

function selectSide(id) {
  selectedSide.value = id
  web3.playClick()
}

function selectChip(chip) {
  betAmount.value = chip
  web3.playClick()
}
</script>

<template>
  <section
    class="lg:col-span-2 rounded-2xl bg-white/5 border border-white/10 p-8 backdrop-blur-sm flex flex-col items-center gap-8"
  >
    <h1 class="text-2xl font-bold tracking-tight text-center">
      <span
        class="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent"
      >
        {{ lang.t.coinFlip }}
      </span>
      <span class="ml-2 text-slate-500 text-base font-normal">· 1.95x</span>
    </h1>

    <div class="relative w-40 h-40 select-none">
      <div
        class="w-full h-full rounded-full flex items-center justify-center text-7xl transition-all duration-300"
        :class="{
          'animate-spin': isFlipping,
          'shadow-[0_0_40px_rgba(139,92,246,0.6)]':
            !isFlipping && lastResult?.won,
          'shadow-[0_0_40px_rgba(239,68,68,0.5)]':
            !isFlipping && lastResult && !lastResult.won,
          'shadow-[0_0_20px_rgba(139,92,246,0.3)]': !lastResult,
        }"
        style="background: radial-gradient(circle at 35% 35%, #4c1d95, #1e1b4b)"
      >
        <span v-if="isFlipping">🌀</span>
        <span v-else-if="lastResult">{{
          lastResult.result === 0 ? '🦅' : '🔮'
        }}</span>
        <span v-else>🪙</span>
      </div>
    </div>

    <Transition name="fade-up">
      <div v-if="lastResult && !isFlipping" class="text-center">
        <div
          class="text-3xl font-black tracking-wide"
          :class="lastResult.won ? 'text-emerald-400' : 'text-red-400'"
        >
          {{ lastResult.won ? lang.t.winTitle : lang.t.loseTitle }}
        </div>
        <div class="text-slate-400 text-sm mt-1">
          {{ lang.t.felled }}:
          <span class="text-white font-semibold">{{ resultSideLabel }}</span>
          <span v-if="lastResult.won" class="ml-2 text-emerald-400">
            +{{ lastResult.payout }} ETH
          </span>
        </div>
      </div>
    </Transition>

    <div class="flex gap-4 w-full max-w-sm">
      <button
        v-for="side in SIDES"
        :key="side.id"
        @click="selectSide(side.id)"
        class="flex-1 py-4 rounded-2xl border-2 text-center text-2xl flex flex-col items-center gap-1 transition-all duration-200"
        :class="
          selectedSide === side.id
            ? 'border-violet-500 bg-violet-500/20 shadow-[0_0_20px_rgba(139,92,246,0.3)] scale-105'
            : 'border-white/10 hover:border-white/25 hover:bg-white/5'
        "
      >
        <span>{{ side.emoji }}</span>
        <span class="text-sm font-semibold text-slate-300">{{
          side.label
        }}</span>
      </button>
    </div>

    <div class="w-full max-w-sm space-y-2">
      <label class="text-xs text-slate-400 uppercase tracking-widest">{{
        lang.t.bet
      }}</label>
      <div class="flex gap-2">
        <div class="flex gap-1">
          <button
            v-for="chip in ['0.001', '0.01', '0.05', '0.1']"
            :key="chip"
            @click="selectChip(chip)"
            class="px-2 py-1 text-xs rounded-lg border transition-colors"
            :class="
              betAmount === chip
                ? 'border-violet-500 bg-violet-500/20 text-violet-300'
                : 'border-white/10 text-slate-500 hover:border-white/20'
            "
          >
            {{ chip }}
          </button>
        </div>
        <input
          v-model="betAmount"
          type="number"
          step="0.001"
          min="0.001"
          max="0.1"
          class="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500 transition-colors text-right"
        />
      </div>
      <div class="text-xs text-slate-600">{{ lang.t.minMax }}</div>
    </div>

    <button
      v-if="web3.isConnected"
      @click="handleFlip"
      :disabled="web3.isPending || isFlipping || !web3.isContractConfigured"
      class="w-full max-w-sm py-4 rounded-2xl text-lg font-black uppercase tracking-widest bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-xl shadow-violet-900/50 active:scale-95"
    >
      <span v-if="isFlipping || web3.isPending" class="animate-pulse">{{
        lang.t.waiting
      }}</span>
      <span v-else>🎲 {{ lang.t.flipCoin }}</span>
    </button>

    <button
      v-else
      @click="web3.connectWallet()"
      class="w-full max-w-sm py-4 rounded-2xl text-lg font-bold border-2 border-violet-500/50 hover:border-violet-400 text-violet-400 hover:text-violet-300 transition-all duration-200"
    >
      {{ lang.t.playToEarn }}
    </button>

    <p class="text-xs text-slate-700 text-center max-w-xs">
      {{ lang.t.houseEdge }}
    </p>
  </section>
</template>

<style scoped>
.fade-up-enter-active,
.fade-up-leave-active {
  transition: all 0.4s ease;
}
.fade-up-enter-from {
  opacity: 0;
  transform: translateY(12px);
}
.fade-up-leave-to {
  opacity: 0;
}
</style>
