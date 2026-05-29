<script setup lang="ts">
import { ref, computed } from 'vue'
import { useWeb3Store } from '../stores/web3.js'
import { useLangStore } from '../stores/lang.js'
import CoinSvg from './CoinSvg.vue'

const emit = defineEmits<{
  (e: 'game-finished', data: { won: boolean; payout: string; bet: string; sideLabel: string }): void
}>()

const web3 = useWeb3Store()
const lang = useLangStore()

const betAmount = ref('0.01')
const lastResult = ref<{ won: boolean; payout: string; bet: string; result: number } | null>(null)
const isFlipping = ref(false)
const selectedSide = ref<number | null>(null)
const hoveredSide = ref<number | null>(null)
const showFairnessInfo = ref(false)

const SIDES = computed(() => [
  { id: 0, label: lang.t.heads },
  { id: 1, label: lang.t.tails },
])

const resultSideLabel = computed(() => {
  if (!lastResult.value) return ''
  return lastResult.value.result === 0
    ? `${lang.t.heads} 🦅`
    : `${lang.t.tails} 🪙`
})

/**
 * Determines which coin to show in the central display.
 * Priority: flipping > selected > hovered > result > split(2)
 */
const centralCoinSide = computed((): number => {
  if (isFlipping.value) return selectedSide.value ?? 1
  if (selectedSide.value !== null && !lastResult.value) return selectedSide.value
  if (lastResult.value) return lastResult.value.result
  if (hoveredSide.value !== null) return hoveredSide.value
  return 2 // split coin
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
          result.result === 0 ? `${lang.t.heads} 🦅` : `${lang.t.tails} 🪙`,
      })
    }, 400)
  }
}

function selectSide(id: number) {
  selectedSide.value = id
  web3.playClick()
}

function selectChip(chip: string) {
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

    <!-- Central Interactive Coin -->
    <div class="relative w-44 h-44 select-none">
      <div
        class="w-full h-full flex items-center justify-center transition-all duration-500 ease-out"
        :class="{
          'animate-flip-3d': isFlipping,
          'hover:scale-105 active:scale-95 cursor-pointer': !isFlipping,
          'drop-shadow-[0_0_35px_rgba(52,211,153,0.5)]':
            !isFlipping && lastResult?.won,
          'drop-shadow-[0_0_35px_rgba(239,68,68,0.4)]':
            !isFlipping && lastResult && !lastResult.won,
        }"
      >
        <Transition name="coin-swap" mode="out-in">
          <CoinSvg :key="centralCoinSide" :side="centralCoinSide" size="large" />
        </Transition>
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

    <!-- Side Selection Buttons -->
    <div class="flex gap-4 w-full max-w-sm">
      <button
        v-for="side in SIDES"
        :key="side.id"
        @click="selectSide(side.id)"
        @mouseenter="hoveredSide = side.id"
        @mouseleave="hoveredSide = null"
        :disabled="web3.isPending || isFlipping"
        class="group flex-1 py-5 px-3 rounded-2xl border-2 text-center flex flex-col items-center gap-3 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        :class="
          selectedSide === side.id
            ? 'border-violet-500 bg-violet-500/20 shadow-[0_0_20px_rgba(139,92,246,0.25)] scale-105'
            : 'border-white/10 hover:border-white/25 hover:bg-white/5'
        "
      >
        <CoinSvg :side="side.id" size="medium" />
        <span class="text-sm font-semibold tracking-wide text-slate-300 transition-colors group-hover:text-white">
          {{ side.label }}
        </span>
      </button>
    </div>

    <!-- Bet Selection Section -->
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
            :disabled="web3.isPending || isFlipping"
            class="px-2 py-1 text-xs rounded-lg border transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
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
          :disabled="web3.isPending || isFlipping"
          class="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500 transition-colors text-right disabled:opacity-50"
        />
      </div>
      <div class="text-xs text-slate-600">{{ lang.t.minMax }}</div>
    </div>

    <button
      v-if="web3.isConnected"
      @click="handleFlip"
      :disabled="web3.isPending || isFlipping || !web3.isContractConfigured"
      class="w-full max-w-sm py-4 rounded-2xl text-lg font-black uppercase tracking-widest bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-xl shadow-violet-900/50 active:scale-95 cursor-pointer"
    >
      <span v-if="isFlipping || web3.isPending" class="animate-pulse">{{
        lang.t.waiting
      }}</span>
      <span v-else>🎲 {{ lang.t.flipCoin }}</span>
    </button>

    <button
      v-else
      @click="web3.connectWallet()"
      class="w-full max-w-sm py-4 rounded-2xl text-lg font-bold border-2 border-violet-500/50 hover:border-violet-400 text-violet-400 hover:text-violet-300 transition-all duration-200 cursor-pointer"
    >
      {{ lang.t.playToEarn }}
    </button>

    <div class="flex flex-col items-center gap-2 max-w-sm w-full border-t border-white/5 pt-4">
      <p class="text-[11px] text-slate-700 text-center">
        {{ lang.t.houseEdge }}
      </p>
      
      <button 
        @click="showFairnessInfo = !showFairnessInfo; web3.playClick()"
        class="text-[11px] text-violet-400/80 hover:text-violet-300 transition-colors underline cursor-pointer select-none"
      >
        {{ lang.t.provablyFair }}
      </button>

      <Transition name="fade-height">
        <div 
          v-if="showFairnessInfo" 
          class="w-full text-[11px] text-slate-500 bg-white/5 border border-white/10 rounded-xl p-3.5 space-y-2 mt-1 shadow-inner text-left"
        >
          <p>{{ lang.t.provablyFairDesc }}</p>
          <code class="block bg-slate-950/80 p-2 rounded border border-white/5 font-mono text-[10px] text-cyan-400 break-all leading-relaxed select-all">
            keccak256(abi.encodePacked(<br>
            &nbsp;&nbsp;blockhash(block.number - 1),<br>
            &nbsp;&nbsp;block.timestamp,<br>
            &nbsp;&nbsp;msg.sender,<br>
            &nbsp;&nbsp;betAmount<br>
            )) % 2
          </code>
          <p class="text-[10px] leading-relaxed text-slate-600">
            {{ lang.t.randomnessDisclaimer }}
          </p>
        </div>
      </Transition>
    </div>
  </section>
</template>

<style scoped>
@keyframes coin-flip-3d {
  0% {
    transform: rotateY(0deg);
  }
  100% {
    transform: rotateY(1800deg);
  }
}

.animate-flip-3d {
  animation: coin-flip-3d 1.5s cubic-bezier(0.15, 0.85, 0.35, 1) infinite;
  perspective: 1000px;
}

/* Smooth coin swap transition (split ↔ full coin on hover) */
.coin-swap-enter-active,
.coin-swap-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.coin-swap-enter-from {
  opacity: 0;
  transform: scale(0.92) rotateY(45deg);
}
.coin-swap-leave-to {
  opacity: 0;
  transform: scale(0.92) rotateY(-45deg);
}

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

.fade-height-enter-active,
.fade-height-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  max-height: 250px;
  overflow: hidden;
}
.fade-height-enter-from,
.fade-height-leave-to {
  opacity: 0;
  max-height: 0;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  margin-top: 0 !important;
}
</style>
