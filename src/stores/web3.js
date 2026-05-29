import { defineStore } from 'pinia'
import { ref, shallowRef, computed } from 'vue'
import { ethers } from 'ethers'
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../contracts/casino.js'
import { useLangStore } from './lang.js'

// Sepolia testnet chainId
const SEPOLIA_CHAIN_ID = 11155111

export const useWeb3Store = defineStore('web3', () => {
  const lang = useLangStore()

  // ─── State ─────────────────────────────────────────────────────────────────
  const provider = shallowRef(null)
  const signer = shallowRef(null)
  const contract = shallowRef(null)

  const address = ref('')
  const chainId = ref(null)
  const walletBalance = ref('0.0000')
  const casinoBalance = ref('0.0000')
  const casinoReserve = ref('0.0000')

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

  const isWrongNetwork = computed(
    () => isConnected.value && chainId.value !== SEPOLIA_CHAIN_ID,
  )

  const isContractConfigured = computed(
    () => CONTRACT_ADDRESS !== '0x0000000000000000000000000000000000000000',
  )

  // ─── Sound ─────────────────────────────────────────────────────────────────
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
      clickAudio.play().catch(() => {})
    }
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────
  function setError(msg) {
    error.value = msg
    setTimeout(() => { error.value = '' }, 6000)
  }

  /** Parse user-friendly error from ethers/MetaMask errors */
  function parseError(err) {
    const msg = err?.message || ''

    // MetaMask action rejected
    if (err?.code === 'ACTION_REJECTED' || err?.code === 4001 || msg.includes('user rejected')) {
      return lang.t.walletRejected
    }

    // MetaMask request already pending (e.g. error code -32002)
    if (err?.code === -32002 || msg.includes('-32002') || msg.includes('already pending')) {
      return lang.t.errMetaMaskPending
    }

    // ethers v6 #notReady error
    if (msg.includes('#notReady') || msg.includes('private member')) {
      return lang.t.errNotReady
    }

    if (err?.reason) return err.reason
    if (err?.data?.message) return err.data.message

    return msg || lang.t.errUnknown
  }

  /** Read balances from the contract */
  async function refreshBalances() {
    if (!provider.value || !address.value) return

    // 1. Fetch wallet balance (independent of contract)
    try {
      const walletBal = await provider.value.getBalance(address.value)
      walletBalance.value = parseFloat(ethers.formatEther(walletBal)).toFixed(4)
    } catch (err) {
      console.error('wallet balance fetch error:', err)
    }

    // 2. Fetch contract balances
    if (!contract.value) return
    try {
      const [casinoBal, reserve] = await Promise.all([
        contract.value.getBalance(address.value),
        contract.value.getCasinoReserve(),
      ])
      casinoBalance.value = parseFloat(ethers.formatEther(casinoBal)).toFixed(4)
      casinoReserve.value = parseFloat(ethers.formatEther(reserve)).toFixed(4)
    } catch (err) {
      console.error('contract balances fetch error:', err)
      // Reset casino balances to 0 if contract calls fail (e.g. wrong contract address)
      casinoBalance.value = '0.0000'
      casinoReserve.value = '0.0000'
    }
  }

  // ─── MetaMask event listeners (attached once on connect) ───────────────────
  function attachMetaMaskListeners() {
    if (!window.ethereum) return

    window.ethereum.on('accountsChanged', async (accounts) => {
      if (accounts.length === 0) {
        disconnectWallet()
      } else {
        address.value = accounts[0]
        await refreshBalances()
      }
    })

    window.ethereum.on('chainChanged', (newChainId) => {
      // chainChanged passes hex string, convert to number
      chainId.value = parseInt(newChainId, 16)
      // Reload to reset contract state cleanly
      window.location.reload()
    })
  }

  // ─── Connect Wallet ────────────────────────────────────────────────────────
  async function connectWallet() {
    if (!window.ethereum) {
      setError(lang.t.metaMaskNotFound)
      return
    }

    isLoading.value = true
    error.value = ''

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      })

      // Create ethers v6 BrowserProvider
      provider.value = new ethers.BrowserProvider(window.ethereum)
      signer.value = await provider.value.getSigner()

      // Read current network
      const network = await provider.value.getNetwork()
      chainId.value = Number(network.chainId)
      address.value = accounts[0]
      isConnected.value = true

      // Initialize contract instance
      contract.value = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer.value,
      )

      attachMetaMaskListeners()
      await refreshBalances()
    } catch (err) {
      setError(parseError(err))
    } finally {
      isLoading.value = false
    }
  }

  // ─── Switch to Sepolia ─────────────────────────────────────────────────────
  async function switchToSepolia() {
    if (!window.ethereum) return
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xaa36a7' }], // Sepolia hex chainId
      })
    } catch (err) {
      setError(parseError(err))
    }
  }

  // ─── Disconnect ────────────────────────────────────────────────────────────
  function disconnectWallet() {
    address.value = ''
    chainId.value = null
    walletBalance.value = '0.0000'
    casinoBalance.value = '0.0000'
    casinoReserve.value = '0.0000'
    isConnected.value = false
    gameHistory.value = []
    provider.value = null
    signer.value = null
    contract.value = null
  }

  // ─── Deposit ───────────────────────────────────────────────────────────────
  async function deposit(amountEth) {
    if (!contract.value) return
    isPending.value = true
    error.value = ''
    try {
      const value = ethers.parseEther(amountEth)
      const tx = await contract.value.deposit({ value })
      await tx.wait()
      await refreshBalances()
    } catch (err) {
      setError(parseError(err))
    } finally {
      isPending.value = false
    }
  }

  // ─── Withdraw ──────────────────────────────────────────────────────────────
  async function withdraw(amountEth) {
    if (!contract.value) return
    isPending.value = true
    error.value = ''
    try {
      const amount = ethers.parseEther(amountEth)
      const tx = await contract.value.withdraw(amount)
      await tx.wait()
      await refreshBalances()
    } catch (err) {
      setError(parseError(err))
    } finally {
      isPending.value = false
    }
  }

  // ─── Flip (Coinflip game) ──────────────────────────────────────────────────
  async function flip(choice, amountEth) {
    if (!contract.value) return null
    isPending.value = true
    error.value = ''

    if (spinAudio) {
      spinAudio.loop = true
      spinAudio.currentTime = 0
      spinAudio.play().catch(() => {})
    }

    try {
      const betAmount = ethers.parseEther(amountEth)
      const tx = await contract.value.flip(choice, betAmount)
      const receipt = await tx.wait()

      // Stop spin sound
      if (spinAudio) {
        spinAudio.pause()
        spinAudio.currentTime = 0
      }

      // Parse CoinFlipped event from receipt logs
      let resultLog = null
      for (const log of receipt.logs) {
        try {
          const parsed = contract.value.interface.parseLog({
            topics: log.topics,
            data: log.data,
          })
          if (parsed && parsed.name === 'CoinFlipped') {
            const { won, result, payout } = parsed.args
            const payoutEth = parseFloat(ethers.formatEther(payout)).toFixed(4)

            if (won) {
              if (winAudio) { winAudio.currentTime = 0; winAudio.play().catch(() => {}) }
            } else {
              if (loseAudio) { loseAudio.currentTime = 0; loseAudio.play().catch(() => {}) }
            }

            resultLog = {
              won,
              result: Number(result), // 0 = Heads, 1 = Tails
              payout: payoutEth,
              bet: amountEth,
              choice,
              timestamp: Date.now(),
              txHash: tx.hash,
            }
            break
          }
        } catch {
          // Log doesn't match our ABI — skip
        }
      }

      await refreshBalances()

      if (resultLog) {
        gameHistory.value = [resultLog, ...gameHistory.value].slice(0, 10)
      }

      isPending.value = false
      return resultLog
    } catch (err) {
      if (spinAudio) {
        spinAudio.pause()
        spinAudio.currentTime = 0
      }
      setError(parseError(err))
      isPending.value = false
      return null
    }
  }

  return {
    address,
    chainId,
    walletBalance,
    casinoBalance,
    casinoReserve,
    isConnected,
    isLoading,
    isPending,
    isWrongNetwork,
    error,
    gameHistory,
    shortAddress,
    isContractConfigured,
    connectWallet,
    disconnectWallet,
    switchToSepolia,
    deposit,
    withdraw,
    flip,
    refreshBalances,
    playClick,
  }
})
