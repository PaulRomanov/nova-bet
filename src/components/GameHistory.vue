<script setup lang="ts">
import { useWeb3Store } from '../stores/web3.js'
import { useLangStore } from '../stores/lang.js'
import { formatTs } from '../utils/date.js'

const web3 = useWeb3Store()
const lang = useLangStore()
</script>

<template>
  <div class="rounded-2xl bg-white/5 border border-white/10 p-5 backdrop-blur-sm flex-1">
    <div class="text-xs text-slate-400 uppercase tracking-widest mb-3">
      📜 {{ lang.t.history }}
    </div>

    <div
      v-if="web3.gameHistory.length === 0"
      class="flex flex-col items-center justify-center py-10 text-slate-500/60 text-sm gap-2 select-none"
    >
      <span class="text-3xl opacity-30">🪙</span>
      <span>{{ lang.t.noGames }}</span>
    </div>

    <ul v-else class="space-y-2">
      <li
        v-for="(g, i) in web3.gameHistory"
        :key="i"
        class="flex items-center justify-between text-xs rounded-lg px-3 py-2"
        :class="g.won ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-red-500/10 border border-red-500/20'"
      >
        <span>
          {{ g.choice === 0 ? '🦅' : '🪙' }}
          <span class="ml-1 text-slate-400">{{ g.bet }} ETH</span>
        </span>
        <span :class="g.won ? 'text-emerald-400' : 'text-red-400'" class="font-bold">
          {{ g.won ? `+${g.payout}` : `-${g.bet}` }} ETH
        </span>
        <div class="flex items-center gap-1.5">
          <span class="text-slate-600">{{ formatTs(g.timestamp, lang.currentLang) }}</span>
          <a
            v-if="g.txHash"
            :href="`https://sepolia.etherscan.io/tx/${g.txHash}`"
            target="_blank"
            rel="noopener noreferrer"
            class="text-slate-500 hover:text-violet-400 transition-colors"
            :title="lang.t.viewOnEtherscan"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
              <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
            </svg>
          </a>
        </div>
      </li>
    </ul>
  </div>
</template>
