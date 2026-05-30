<script setup lang="ts">
import { ref } from 'vue'
import { useWeb3Store } from '../stores/web3.js'
import { useLangStore } from '../stores/lang.js'

const web3 = useWeb3Store()
const lang = useLangStore()

const depositAmount = ref<string>('0.01')
const withdrawAmount = ref<string>('')

async function handleDeposit() {
  if (!depositAmount.value || Number(depositAmount.value) <= 0) return
  await web3.deposit(depositAmount.value)
}

async function handleWithdraw() {
  const amt = withdrawAmount.value || web3.casinoBalance
  if (!amt || Number(amt) <= 0) return
  await web3.withdraw(amt)
}

function handleMaxDeposit() {
  // Gas reserve of 0.005 ETH to prevent out of gas transaction failures
  const maxVal = Math.max(0, Number(web3.walletBalance) - 0.005)
  // Format to avoid floating point precision issues (e.g. 0.045000000000000005)
  depositAmount.value = parseFloat(maxVal.toFixed(6)).toString()
  web3.playClick()
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
        <div class="relative flex-1">
          <input
            v-model="depositAmount"
            type="number"
            step="0.001"
            min="0.001"
            placeholder="0.01"
            :disabled="web3.isPending"
            class="w-full bg-white/5 border border-white/10 rounded-lg pl-3 pr-16 py-2 text-sm focus:outline-none focus:border-violet-500 transition-colors disabled:opacity-50"
          />
          <button
            @click="handleMaxDeposit"
            :disabled="web3.isPending"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-violet-400 hover:text-violet-300 disabled:hover:text-violet-400 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed uppercase"
          >
            Max
          </button>
        </div>
        <button
          @click="handleDeposit"
          :disabled="web3.isPending"
          class="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <span v-if="web3.isPending" class="animate-pulse">…</span>
          <span v-else>↑</span>
        </button>
      </div>
    </div>

    <div class="space-y-2">
      <label class="text-xs text-slate-400">{{ lang.t.withdraw }}</label>
      <div class="flex gap-2">
        <div class="relative flex-1">
          <input
            v-model="withdrawAmount"
            type="number"
            step="0.001"
            min="0.001"
            placeholder="0.0"
            :disabled="web3.isPending"
            class="w-full bg-white/5 border border-white/10 rounded-lg pl-3 pr-16 py-2 text-sm focus:outline-none focus:border-cyan-500 transition-colors disabled:opacity-50"
          />
          <button
            @click="withdrawAmount = web3.casinoBalance; web3.playClick()"
            :disabled="web3.isPending"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-violet-400 hover:text-violet-300 disabled:hover:text-violet-400 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed uppercase"
          >
            Max
          </button>
        </div>
        <button
          @click="handleWithdraw"
          :disabled="web3.isPending"
          class="px-4 py-2 rounded-lg bg-cyan-700 hover:bg-cyan-600 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <span v-if="web3.isPending" class="animate-pulse">…</span>
          <span v-else>↓</span>
        </button>
      </div>
    </div>
  </div>
</template>
