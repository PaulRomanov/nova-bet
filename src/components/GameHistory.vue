<script setup>
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
      class="text-slate-600 text-sm text-center py-6"
    >
      {{ lang.t.noGames }}
    </div>

    <ul v-else class="space-y-2">
      <li
        v-for="(g, i) in web3.gameHistory"
        :key="i"
        class="flex items-center justify-between text-xs rounded-lg px-3 py-2"
        :class="g.won ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-red-500/10 border border-red-500/20'"
      >
        <span>
          {{ g.choice === 0 ? '🦅' : '🔮' }}
          <span class="ml-1 text-slate-400">{{ g.bet }} ETH</span>
        </span>
        <span :class="g.won ? 'text-emerald-400' : 'text-red-400'" class="font-bold">
          {{ g.won ? `+${g.payout}` : `-${g.bet}` }} ETH
        </span>
        <span class="text-slate-600">{{ formatTs(g.timestamp, lang.currentLang) }}</span>
      </li>
    </ul>
  </div>
</template>
