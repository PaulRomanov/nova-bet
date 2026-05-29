<script setup>
import { ref } from 'vue'
import { useWeb3Store } from '../stores/web3.js'
import { useLangStore } from '../stores/lang.js'

const web3 = useWeb3Store()
const lang = useLangStore()

const depositAmount = ref('0.01')
const withdrawAmount = ref('')

async function handleDeposit() {
  if (!depositAmount.value || Number(depositAmount.value) <= 0) return
  await web3.deposit(depositAmount.value)
}

async function handleWithdraw() {
  const amt = withdrawAmount.value || web3.casinoBalance
  if (!amt || Number(amt) <= 0) return
  await web3.withdraw(amt)
}
</script>

<template>
  <div
    class="rounded-2xl bg-white/5 border border-white/10 p-5 backdrop-blur-sm"
  >
    <div class="text-xs text-slate-400 uppercase tracking-widest mb-1">
      🏦 {{ lang.t.casinoReserve }}
    </div>
    <div
      class="text-3xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent"
    >
      {{ web3.casinoReserve }} ETH
    </div>
    <div v-if="web3.isConnected" class="mt-3 text-xs text-slate-500">
      {{ lang.t.yourCasinoBalance }}:
      <span class="text-cyan-400 font-semibold"
        >{{ web3.casinoBalance }} ETH</span
      >
    </div>
  </div>

  <div
    v-if="web3.isConnected"
    class="rounded-2xl bg-white/5 border border-white/10 p-5 backdrop-blur-sm space-y-4"
  >
    <div class="text-xs text-slate-400 uppercase tracking-widest">
      💸 {{ lang.t.depositWithdraw }}
    </div>

    <div class="space-y-2">
      <label class="text-xs text-slate-400">{{ lang.t.deposit }}</label>
      <div class="flex gap-2">
        <input
          v-model="depositAmount"
          type="number"
          step="0.001"
          min="0.001"
          placeholder="0.01"
          class="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500 transition-colors"
        />
        <button
          @click="handleDeposit"
          :disabled="web3.isPending"
          class="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <span v-if="web3.isPending" class="animate-pulse">…</span>
          <span v-else>↑</span>
        </button>
      </div>
    </div>

    <div class="space-y-2">
      <label class="text-xs text-slate-400">{{ lang.t.withdraw }}</label>
      <div class="flex gap-2">
        <input
          v-model="withdrawAmount"
          type="number"
          step="0.001"
          min="0.001"
          :placeholder="web3.casinoBalance"
          class="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
        />
        <button
          @click="handleWithdraw"
          :disabled="web3.isPending"
          class="px-4 py-2 rounded-lg bg-cyan-700 hover:bg-cyan-600 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <span v-if="web3.isPending" class="animate-pulse">…</span>
          <span v-else>↓</span>
        </button>
      </div>
    </div>
  </div>
</template>
