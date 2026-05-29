<script setup>
import { ref, computed } from 'vue'
import { useWeb3Store } from './stores/web3.js'

const web3 = useWeb3Store()

// ─── Deposit / Withdraw UI ──────────────────────────────────────────────────
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

// ─── Coinflip Game ──────────────────────────────────────────────────────────
const betAmount = ref('0.01')
const lastResult = ref(null)      // { won, result, payout, choice }
const isFlipping = ref(false)     // coin animation flag
const selectedSide = ref(null)    // 0 = Heads, 1 = Tails

const isModalOpen = ref(false)
const modalData = ref(null)

const SIDES = [
  { id: 0, label: 'Орёл', emoji: '🦅' },
  { id: 1, label: 'Решка', emoji: '🔮' },
]

async function handleFlip() {
  web3.playClick()
  if (selectedSide.value === null) {
    web3.error = 'Выберите орёл или решку'
    return
  }
  if (!betAmount.value || Number(betAmount.value) < 0.001) {
    web3.error = 'Минимальная ставка: 0.001 ETH'
    return
  }

  isFlipping.value = true
  lastResult.value = null

  const result = await web3.flip(selectedSide.value, betAmount.value)

  // Keep animation going for at least 1.5s for UX
  await new Promise(r => setTimeout(r, 1500))
  isFlipping.value = false

  if (result) {
    lastResult.value = result
    modalData.value = {
      won: result.won,
      payout: result.payout,
      bet: result.bet,
      sideLabel: result.result === 0 ? 'Орёл 🦅' : 'Решка 🔮'
    }
    // Small delay to let the coin animation settle down before modal popup
    setTimeout(() => {
      isModalOpen.value = true
    }, 400)
  }
}

// ─── Helpers ────────────────────────────────────────────────────────────────
const resultSideLabel = computed(() => {
  if (!lastResult.value) return ''
  return lastResult.value.result === 0 ? 'Орёл 🦅' : 'Решка 🔮'
})

function formatTs(ts) {
  return new Date(ts).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}
</script>

<template>
  <div class="min-h-screen bg-gray-950 text-slate-100 font-sans">

    <!-- ── Ambient background glows ─────────────────────────────────── -->
    <div class="fixed inset-0 pointer-events-none overflow-hidden">
      <div class="absolute -top-40 -left-40 w-96 h-96 bg-violet-700 rounded-full opacity-20 blur-3xl"></div>
      <div class="absolute top-1/2 -right-32 w-80 h-80 bg-cyan-500 rounded-full opacity-10 blur-3xl"></div>
      <div class="absolute bottom-0 left-1/3 w-72 h-72 bg-fuchsia-600 rounded-full opacity-10 blur-3xl"></div>
    </div>

    <!-- ── Header ────────────────────────────────────────────────────── -->
    <header class="relative z-10 flex items-center justify-between px-6 py-4 border-b border-white/5 backdrop-blur-sm">
      <div class="flex items-center gap-3">
        <span class="text-2xl">🎰</span>
        <span class="text-xl font-bold tracking-widest bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
          NOVA<span class="text-white">BET</span>
        </span>
      </div>

      <!-- Wallet button -->
      <button
        v-if="!web3.isConnected"
        @click="web3.connectWallet()"
        :disabled="web3.isLoading"
        class="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm
               bg-gradient-to-r from-violet-600 to-cyan-500
               hover:from-violet-500 hover:to-cyan-400
               disabled:opacity-50 disabled:cursor-not-allowed
               transition-all duration-200 shadow-lg shadow-violet-900/40"
      >
        <svg v-if="web3.isLoading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
        </svg>
        <span v-if="web3.isLoading">Подключение…</span>
        <span v-else>🦊 Подключить кошелёк</span>
      </button>

      <div v-else class="flex items-center gap-3">
        <div class="text-right hidden sm:block">
          <div class="text-xs text-slate-400">Кошелёк</div>
          <div class="text-sm font-mono font-semibold text-cyan-400">{{ web3.shortAddress }}</div>
        </div>
        <div class="text-right">
          <div class="text-xs text-slate-400">ETH</div>
          <div class="text-sm font-bold text-white">{{ web3.walletBalance }}</div>
        </div>
        <button
          @click="web3.disconnectWallet()"
          class="px-3 py-1.5 text-xs rounded-lg border border-white/10 hover:border-red-500/50
                 hover:text-red-400 transition-all duration-200"
        >
          Выйти
        </button>
      </div>
    </header>

    <!-- ── Error toast ───────────────────────────────────────────────── -->
    <Transition name="slide-down">
      <div
        v-if="web3.error"
        class="relative z-20 mx-auto mt-4 max-w-lg px-5 py-3 rounded-xl
               bg-red-500/10 border border-red-500/30 text-red-300 text-sm text-center"
      >
        ⚠️ {{ web3.error }}
      </div>
    </Transition>

    <!-- ── Contract not configured warning ──────────────────────────── -->
    <div v-if="!web3.isContractConfigured"
         class="relative z-10 mx-auto mt-6 max-w-2xl px-5 py-4 rounded-xl
                bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm text-center">
      ⚙️ Вставьте адрес контракта в <code class="bg-white/10 px-1 rounded">src/contracts/casino.js</code>
    </div>

    <!-- ── Main content ──────────────────────────────────────────────── -->
    <main class="relative z-10 max-w-5xl mx-auto px-4 py-10 grid gap-6 lg:grid-cols-3">

      <!-- ── LEFT: Stats + History ──────────────────────────────────── -->
      <aside class="flex flex-col gap-5">

        <!-- Casino reserve card -->
        <div class="rounded-2xl bg-white/5 border border-white/10 p-5 backdrop-blur-sm">
          <div class="text-xs text-slate-400 uppercase tracking-widest mb-1">🏦 Банк казино</div>
          <div class="text-3xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
            {{ web3.casinoReserve }} ETH
          </div>
          <div v-if="web3.isConnected" class="mt-3 text-xs text-slate-500">
            Ваш баланс в казино: <span class="text-cyan-400 font-semibold">{{ web3.casinoBalance }} ETH</span>
          </div>
        </div>

        <!-- Deposit / Withdraw -->
        <div v-if="web3.isConnected" class="rounded-2xl bg-white/5 border border-white/10 p-5 backdrop-blur-sm space-y-4">
          <div class="text-xs text-slate-400 uppercase tracking-widest">💸 Пополнение / Вывод</div>

          <div class="space-y-2">
            <label class="text-xs text-slate-400">Депозит (ETH)</label>
            <div class="flex gap-2">
              <input
                v-model="depositAmount"
                type="number" step="0.001" min="0.001"
                class="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm
                       focus:outline-none focus:border-violet-500 transition-colors"
                placeholder="0.01"
              />
              <button
                @click="handleDeposit"
                :disabled="web3.isPending"
                class="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-sm font-semibold
                       disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <span v-if="web3.isPending" class="animate-pulse">…</span>
                <span v-else>↑</span>
              </button>
            </div>
          </div>

          <div class="space-y-2">
            <label class="text-xs text-slate-400">Вывод (ETH, пусто = всё)</label>
            <div class="flex gap-2">
              <input
                v-model="withdrawAmount"
                type="number" step="0.001" min="0.001"
                class="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm
                       focus:outline-none focus:border-cyan-500 transition-colors"
                :placeholder="web3.casinoBalance"
              />
              <button
                @click="handleWithdraw"
                :disabled="web3.isPending"
                class="px-4 py-2 rounded-lg bg-cyan-700 hover:bg-cyan-600 text-sm font-semibold
                       disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <span v-if="web3.isPending" class="animate-pulse">…</span>
                <span v-else>↓</span>
              </button>
            </div>
          </div>
        </div>

        <!-- History -->
        <div class="rounded-2xl bg-white/5 border border-white/10 p-5 backdrop-blur-sm flex-1">
          <div class="text-xs text-slate-400 uppercase tracking-widest mb-3">📜 История</div>
          <div v-if="web3.gameHistory.length === 0" class="text-slate-600 text-sm text-center py-6">
            Пока нет игр
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
              <span class="text-slate-600">{{ formatTs(g.timestamp) }}</span>
            </li>
          </ul>
        </div>
      </aside>

      <!-- ── CENTER: Coinflip Game ───────────────────────────────────── -->
      <section class="lg:col-span-2 rounded-2xl bg-white/5 border border-white/10 p-8 backdrop-blur-sm flex flex-col items-center gap-8">

        <h1 class="text-2xl font-bold tracking-tight text-center">
          <span class="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">Coin Flip</span>
          <span class="ml-2 text-slate-500 text-base font-normal">· 1.95x</span>
        </h1>

        <!-- Coin animation -->
        <div class="relative w-40 h-40 select-none">
          <div
            class="w-full h-full rounded-full flex items-center justify-center text-7xl transition-all duration-300"
            :class="{
              'animate-spin': isFlipping,
              'shadow-[0_0_40px_rgba(139,92,246,0.6)]': !isFlipping && lastResult?.won,
              'shadow-[0_0_40px_rgba(239,68,68,0.5)]': !isFlipping && lastResult && !lastResult.won,
              'shadow-[0_0_20px_rgba(139,92,246,0.3)]': !lastResult,
            }"
            style="background: radial-gradient(circle at 35% 35%, #4c1d95, #1e1b4b)"
          >
            <span v-if="isFlipping">🌀</span>
            <span v-else-if="lastResult">{{ lastResult.result === 0 ? '🦅' : '🔮' }}</span>
            <span v-else>🪙</span>
          </div>
        </div>

        <!-- Win / Lose result -->
        <Transition name="fade-up">
          <div v-if="lastResult && !isFlipping" class="text-center">
            <div
              class="text-3xl font-black tracking-wide"
              :class="lastResult.won ? 'text-emerald-400' : 'text-red-400'"
            >
              {{ lastResult.won ? '🎉 Победа!' : '💀 Проигрыш' }}
            </div>
            <div class="text-slate-400 text-sm mt-1">
              Выпало: <span class="text-white font-semibold">{{ resultSideLabel }}</span>
              <span v-if="lastResult.won" class="ml-2 text-emerald-400">+{{ lastResult.payout }} ETH</span>
            </div>
          </div>
        </Transition>

        <!-- Side selection -->
        <div class="flex gap-4 w-full max-w-sm">
          <button
            v-for="side in SIDES"
            :key="side.id"
            @click="selectedSide = side.id; web3.playClick()"
            class="flex-1 py-4 rounded-2xl border-2 text-center text-2xl flex flex-col items-center gap-1 transition-all duration-200"
            :class="selectedSide === side.id
              ? 'border-violet-500 bg-violet-500/20 shadow-[0_0_20px_rgba(139,92,246,0.3)] scale-105'
              : 'border-white/10 hover:border-white/25 hover:bg-white/5'"
          >
            <span>{{ side.emoji }}</span>
            <span class="text-sm font-semibold text-slate-300">{{ side.label }}</span>
          </button>
        </div>

        <!-- Bet input -->
        <div class="w-full max-w-sm space-y-2">
          <label class="text-xs text-slate-400 uppercase tracking-widest">Ставка (ETH)</label>
          <div class="flex gap-2">
            <!-- Quick bet chips -->
            <div class="flex gap-1">
              <button
                v-for="chip in ['0.001', '0.01', '0.05', '0.1']"
                :key="chip"
                @click="betAmount = chip; web3.playClick()"
                class="px-2 py-1 text-xs rounded-lg border transition-colors"
                :class="betAmount === chip
                  ? 'border-violet-500 bg-violet-500/20 text-violet-300'
                  : 'border-white/10 text-slate-500 hover:border-white/20'"
              >{{ chip }}</button>
            </div>
            <input
              v-model="betAmount"
              type="number" step="0.001" min="0.001" max="0.1"
              class="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm
                     focus:outline-none focus:border-violet-500 transition-colors text-right"
            />
          </div>
          <div class="text-xs text-slate-600">Мин: 0.001 · Макс: 0.1 ETH · Выплата: 1.95x</div>
        </div>

        <!-- Play button -->
        <button
          v-if="web3.isConnected"
          @click="handleFlip"
          :disabled="web3.isPending || isFlipping || !web3.isContractConfigured"
          class="w-full max-w-sm py-4 rounded-2xl text-lg font-black uppercase tracking-widest
                 bg-gradient-to-r from-violet-600 to-cyan-500
                 hover:from-violet-500 hover:to-cyan-400
                 disabled:opacity-40 disabled:cursor-not-allowed
                 transition-all duration-200 shadow-xl shadow-violet-900/50
                 active:scale-95"
        >
          <span v-if="isFlipping || web3.isPending" class="animate-pulse">⏳ Ожидание…</span>
          <span v-else>🎲 Испытать удачу!</span>
        </button>

        <button
          v-else
          @click="web3.connectWallet()"
          class="w-full max-w-sm py-4 rounded-2xl text-lg font-bold
                 border-2 border-violet-500/50 hover:border-violet-400
                 text-violet-400 hover:text-violet-300
                 transition-all duration-200"
        >
          🦊 Подключите кошелёк для игры
        </button>

        <!-- House edge note -->
        <p class="text-xs text-slate-700 text-center max-w-xs">
          Казино имеет преимущество 2.5% (выплата 1.95x вместо 2x).
          Случайность основана на blockhash (MVP-уровень).
        </p>
      </section>
    </main>

    <!-- ── Footer ─────────────────────────────────────────────────────── -->
    <footer class="relative z-10 text-center text-slate-700 text-xs pb-6">
      NovaBet Casino · Hackathon MVP · Sepolia Testnet
    </footer>

    <!-- ── Game Result Modal ─────────────────────────────────────────── -->
    <Transition name="modal">
      <div v-if="isModalOpen && modalData" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div @click="isModalOpen = false" class="absolute inset-0 bg-slate-950/80 backdrop-blur-md"></div>
        
        <!-- Modal Card -->
        <div class="relative z-10 w-full max-w-sm p-8 rounded-3xl border border-white/10 bg-slate-900/90 text-center shadow-[0_0_50px_rgba(0,0,0,0.8)]">
          <!-- Glow effect depending on won/lost -->
          <div class="absolute inset-0 -z-10 rounded-3xl opacity-20 blur-2xl transition-all duration-350"
               :class="modalData.won ? 'bg-emerald-500 shadow-[0_0_80px_rgba(16,185,129,0.4)]' : 'bg-rose-500 shadow-[0_0_80px_rgba(244,63,94,0.4)]'"></div>

          <div class="text-6xl mb-4 select-none">
            {{ modalData.won ? '🎉' : '😢' }}
          </div>

          <h2 class="text-3xl font-black mb-2 tracking-wide"
              :class="modalData.won ? 'text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.5)]' : 'text-rose-500 drop-shadow-[0_0_12px_rgba(244,63,94,0.3)]'">
            {{ modalData.won ? 'Победа!' : 'Не повезло!' }}
          </h2>

          <div class="space-y-4 my-6">
            <p class="text-slate-400 text-sm">
              Выпало: <span class="text-white font-bold">{{ modalData.sideLabel }}</span>
            </p>
            
            <div v-if="modalData.won" class="text-4xl font-extrabold text-white">
              +{{ modalData.payout }} <span class="text-violet-400 text-2xl font-semibold">ETH</span>
            </div>
            <div v-else class="text-slate-400 text-sm font-medium">
              Удача улыбнется в следующий раз!
            </div>
          </div>

          <button
            @click="isModalOpen = false; web3.playClick()"
            class="w-full py-3.5 rounded-xl font-bold uppercase tracking-wider text-sm transition-all duration-200 active:scale-95"
            :class="modalData.won
              ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.4)]'
              : 'bg-white/10 hover:bg-white/20 text-white'"
          >
            Играть еще
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style>
/* Slide-down transition for error toast */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Fade-up transition for game result */
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

/* Modal Transition (Fade + Scale) */
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
