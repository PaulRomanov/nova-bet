import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ethers } from 'ethers'
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../contracts/casino.js'

export const useWeb3Store = defineStore('web3', () => {
  // ─── State ─────────────────────────────────────────────────────────────────
  const provider = ref(null)
  const signer = ref(null)
  const contract = ref(null)

  const address = ref('')
  const walletBalance = ref('100.0000') // Даем пользователю виртуальные 100 ETH
  const casinoBalance = ref('0')
  const casinoReserve = ref('10.0000') // Банк казино, который мы залили в Remix

  const isConnected = ref(false)
  const isLoading = ref(false)
  const isPending = ref(false)
  const error = ref('')
  const gameHistory = ref([])

  // ─── Computed ──────────────────────────────────────────────────────────────
  const shortAddress = computed(() =>
    address.value
      ? `${address.value.slice(0, 6)}...${address.value.slice(-4)}`
      : '',
  )

  const isContractConfigured = computed(() => true)

  // ─── Actions ───────────────────────────────────────────────────────────────
  let spinAudio = null
  let winAudio = null
  let loseAudio = null
  let clickAudio = null

  if (typeof window !== 'undefined') {
    spinAudio = new Audio('/sounds/spin.wav')
    winAudio = new Audio('/sounds/win.wav')
    loseAudio = new Audio('/sounds/lose.wav')
    clickAudio = new Audio('/sounds/click.wav')
  }

  function playClick() {
    if (clickAudio) {
      clickAudio.currentTime = 0
      clickAudio.play().catch((e) => console.log('Audio autoplay prevented:', e))
    }
  }

  function setError(msg) {
    error.value = msg
    setTimeout(() => {
      error.value = ''
    }, 5000)
  }

  async function refreshBalances() {
    // В режиме симуляции баланс казино обновляется локально после игр
    if (contract.value) {
      try {
        // Если бы у нас был доступ к RPC, мы бы дергали контракт:
        // const reserve = await contract.value.getCasinoReserve();
        // casinoReserve.value = ethers.formatEther(reserve);
      } catch (err) {
        console.error(err)
      }
    }
  }

  /** Имитация мгновенного подключения кошелька */
  async function connectWallet() {
    isLoading.value = true
    error.value = ''
    try {
      // Генерируем случайный красивый адрес для игрока, раз MetaMask скрыт
      address.value = '0x101E1304bA8d2b01D0B3F334C9b0ABc800C94908'
      isConnected.value = true

      // Инициализируем пустышку контракта, чтобы интерфейс не падал
      const wallet = ethers.Wallet.createRandom()
      contract.value = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        wallet,
      )
    } catch (err) {
      setError('Ошибка симуляции кошелька')
    } finally {
      isLoading.value = false
    }
  }

  function disconnectWallet() {
    address.value = ''
    isConnected.value = false
    gameHistory.value = []
  }

  /** Игра Coin Flip (Полная симуляция логики твое—го контракта Casino.sol) */
  async function flip(choice, amountEth) {
    isPending.value = true
    error.value = ''

    if (spinAudio) {
      spinAudio.loop = true
      spinAudio.currentTime = 0
      spinAudio.play().catch((e) => console.log('Audio autoplay prevented:', e))
    }

    // Имитируем задержку сети блокчейна в 1.5 секунды для красивой анимации монетки
    await new Promise((resolve) => setTimeout(resolve, 1500))

    if (spinAudio) {
      spinAudio.pause()
      spinAudio.currentTime = 0
    }

    try {
      const bet = parseFloat(amountEth)
      if (bet > parseFloat(walletBalance.value)) {
        throw new Error('Insufficient funds in your wallet.')
      }

      // Математика генерации случайности (как в смарт-контракте)
      const isWinner = Math.random() < 0.5
      const gameResult = isWinner ? choice : choice === 0 ? 1 : 0

      let payout = 0
      if (isWinner) {
        payout = bet * 1.95 // Выплата 1.95x из контракта
        walletBalance.value = (
          parseFloat(walletBalance.value) +
          (payout - bet)
        ).toFixed(4)
        casinoReserve.value = (
          parseFloat(casinoReserve.value) -
          (payout - bet)
        ).toFixed(4)

        if (winAudio) {
          winAudio.currentTime = 0
          winAudio.play().catch((e) => console.log('Audio win autoplay prevented:', e))
        }
      } else {
        walletBalance.value = (parseFloat(walletBalance.value) - bet).toFixed(4)
        casinoReserve.value = (parseFloat(casinoReserve.value) + bet).toFixed(4)

        if (loseAudio) {
          loseAudio.currentTime = 0
          loseAudio.play().catch((e) => console.log('Audio lose autoplay prevented:', e))
        }
      }

      const resultLog = {
        won: isWinner,
        result: gameResult, // 0 = Орел, 1 = Решка
        payout: payout.toFixed(4),
        bet: amountEth,
        choice,
        timestamp: Date.now(),
      }

      gameHistory.value = [resultLog, ...gameHistory.value].slice(0, 10)
      isPending.value = false
      return resultLog
    } catch (err) {
      setError(err.message || 'Unknown error')
      isPending.value = false
      return null
    }
  }

  return {
    address,
    walletBalance,
    casinoBalance,
    casinoReserve,
    isConnected,
    isLoading,
    isPending,
    error,
    gameHistory,
    shortAddress,
    isContractConfigured,
    connectWallet,
    disconnectWallet,
    flip,
    refreshBalances,
    playClick,
  }
})
