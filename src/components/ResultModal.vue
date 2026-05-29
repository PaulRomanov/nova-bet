<script setup>
import { useWeb3Store } from '../stores/web3.js'
import { useLangStore } from '../stores/lang.js'

/**
 * Props:
 *   isOpen {boolean} - controls modal visibility
 *   data   {object}  - { won, payout, bet, sideLabel }
 *
 * Emits:
 *   close - user requested to close the modal
 */
const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
  data: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['close'])

const web3 = useWeb3Store()
const lang = useLangStore()

function close() {
  web3.playClick()
  emit('close')
}
</script>

<template>
  <Transition name="modal">
    <div
      v-if="isOpen && data"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div
        @click="close"
        class="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
      />

      <div
        class="relative z-10 w-full max-w-sm p-8 rounded-3xl border border-white/10 bg-slate-900/90 text-center shadow-[0_0_50px_rgba(0,0,0,0.8)]"
      >
        <div
          class="absolute inset-0 -z-10 rounded-3xl opacity-20 blur-2xl"
          :class="
            data.won
              ? 'bg-emerald-500 shadow-[0_0_80px_rgba(16,185,129,0.4)]'
              : 'bg-rose-500 shadow-[0_0_80px_rgba(244,63,94,0.4)]'
          "
        />

        <div class="text-6xl mb-4 select-none">
          {{ data.won ? '🎉' : '😢' }}
        </div>
        <h2
          class="text-3xl font-black mb-2 tracking-wide"
          :class="
            data.won
              ? 'text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.5)]'
              : 'text-rose-500 drop-shadow-[0_0_12px_rgba(244,63,94,0.3)]'
          "
        >
          {{ data.won ? lang.t.winModalTitle : lang.t.loseModalTitle }}
        </h2>

        <div class="space-y-4 my-6">
          <p class="text-slate-400 text-sm">
            {{ lang.t.felled }}:
            <span class="text-white font-bold">{{ data.sideLabel }}</span>
          </p>

          <div v-if="data.won" class="text-4xl font-extrabold text-white">
            +{{ data.payout }}
            <span class="text-violet-400 text-2xl font-semibold">ETH</span>
          </div>
          <div v-else class="text-slate-400 text-sm font-medium">
            {{ lang.t.loseModalSubtext }}
          </div>

          <div v-if="data.txHash" class="text-xs text-slate-500 pt-2 border-t border-white/5">
            <a
              :href="`https://sepolia.etherscan.io/tx/${data.txHash}`"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-1 text-violet-400 hover:text-violet-300 transition-colors hover:underline"
            >
              <span>{{ lang.t.viewOnEtherscan }}</span>
              <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 animate-pulse" viewBox="0 0 20 20" fill="currentColor">
                <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
              </svg>
            </a>
          </div>
        </div>

        <button
          @click="close"
          class="w-full py-3.5 rounded-xl font-bold uppercase tracking-wider text-sm transition-all duration-200 active:scale-95"
          :class="
            data.won
              ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.4)]'
              : 'bg-white/10 hover:bg-white/20 text-white'
          "
        >
          {{ lang.t.playAgain }}
        </button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-active .relative,
.modal-leave-active .relative {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.modal-enter-from .relative {
  transform: scale(0.9);
}
.modal-leave-to .relative {
  transform: scale(0.95);
}
</style>
