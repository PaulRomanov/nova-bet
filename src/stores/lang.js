import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const translations = {
  ru: {
    casinoReserve: 'Банк казино',
    yourCasinoBalance: 'Ваш баланс в казино',
    depositWithdraw: 'Пополнение / Вывод',
    deposit: 'Депозит (ETH)',
    withdraw: 'Вывод (ETH)',
    history: 'История',
    noGames: 'Пока нет игр',
    heads: 'Орёл',
    tails: 'Решка',
    bet: 'Ставка (ETH)',
    flipCoin: 'Испытать удачу!',
    minMax: 'Мин: 0.001 · Макс: 0.1 ETH · Выплата: 1.95x',
    houseEdge:
      'Казино имеет преимущество 2.5% (выплата 1.95x вместо 2x). Случайность основана на blockhash (MVP-уровень).',
    wallet: 'Кошелёк',
    connectWallet: '🦊 Подключить кошелёк',
    connecting: 'Подключение…',
    disconnect: 'Выйти',
    playToEarn: 'Подключите кошелёк для игры',
    errorNoSide: 'Выберите орёл или решку',
    errorMinBet: 'Минимальная ставка: 0.001 ETH',
    errorNoFunds:
      'Недостаточно средств на депозите казино. Пожалуйста, пополните баланс!',
    winModalTitle: 'Победа!',
    loseModalTitle: 'Не повезло!',
    loseModalSubtext: 'Удача улыбнется в следующий раз!',
    playAgain: 'Играть еще',
    waiting: '⏳ Ожидание…',
    felled: 'Выпало',
    contractWarning: '⚙️ Вставьте адрес контракта в src/contracts/casino.js',
    walletSimulationError: 'Ошибка симуляции кошелька',
    winTitle: '🎉 Победа!',
    loseTitle: '💀 Проигрыш',
    coinFlip: 'Бросок монетки',
    metaMaskNotFound: 'MetaMask не найден. Установите расширение MetaMask.',
    wrongNetwork: '⚠️ Переключитесь на сеть Sepolia в MetaMask',
    switchNetwork: 'Переключить на Sepolia',
    txPending: '⏳ Транзакция отправлена…',
    txConfirmed: '✅ Транзакция подтверждена',
    viewOnEtherscan: 'Посмотреть на Etherscan',
    depositSuccess: 'Депозит зачислен!',
    withdrawSuccess: 'Вывод выполнен!',
    walletRejected: 'Транзакция отклонена в MetaMask',
    provablyFair: 'Доказуемая честность ℹ️',
    provablyFairDesc: 'Результат игры рассчитывается прямо на блокчейне (on-chain) по формуле:',
    randomnessDisclaimer: 'Формула использует хэш предыдущего блока, метку времени и ваш адрес. Это гарантирует честность со стороны казино.',
    errNotReady: 'Ошибка инициализации кошелька. Пожалуйста, разблокируйте MetaMask или обновите страницу.',
    errMetaMaskPending: 'Запрос подключения уже ожидает подтверждения в MetaMask. Пожалуйста, откройте расширение кошелька.',
    errUnknown: 'Произошла непредвиденная ошибка. Попробуйте еще раз.',
  },
  en: {
    casinoReserve: 'Casino Reserve',
    yourCasinoBalance: 'Your casino balance',
    depositWithdraw: 'Deposit / Withdraw',
    deposit: 'Deposit (ETH)',
    withdraw: 'Withdraw (ETH)',
    history: 'History',
    noGames: 'No games yet',
    heads: 'Heads',
    tails: 'Tails',
    bet: 'Bet (ETH)',
    flipCoin: 'Flip Coin!',
    minMax: 'Min: 0.001 · Max: 0.1 ETH · Payout: 1.95x',
    houseEdge:
      'The casino has a 2.5% house edge (1.95x payout instead of 2x). Randomness is based on blockhash (MVP-level).',
    wallet: 'Wallet',
    connectWallet: '🦊 Connect Wallet',
    connecting: 'Connecting…',
    disconnect: 'Disconnect',
    playToEarn: 'Connect wallet to play',
    errorNoSide: 'Select Heads or Tails',
    errorMinBet: 'Minimum bet: 0.001 ETH',
    errorNoFunds:
      'Insufficient funds on casino deposit. Please, top up your balance!',
    winModalTitle: 'Victory!',
    loseModalTitle: 'Better luck!',
    loseModalSubtext: 'Better luck next time!',
    playAgain: 'Play again',
    waiting: '⏳ Waiting…',
    felled: 'Result',
    contractWarning: '⚙️ Insert contract address in src/contracts/casino.js',
    walletSimulationError: 'Wallet simulation error',
    winTitle: '🎉 Win!',
    loseTitle: '💀 Lost',
    coinFlip: 'Coin Flip',
    metaMaskNotFound: 'MetaMask not found. Please install the MetaMask extension.',
    wrongNetwork: '⚠️ Switch to Sepolia network in MetaMask',
    switchNetwork: 'Switch to Sepolia',
    txPending: '⏳ Transaction submitted…',
    txConfirmed: '✅ Transaction confirmed',
    viewOnEtherscan: 'View on Etherscan',
    depositSuccess: 'Deposit successful!',
    withdrawSuccess: 'Withdrawal successful!',
    walletRejected: 'Transaction rejected in MetaMask',
    provablyFair: 'Provably Fair ℹ️',
    provablyFairDesc: 'The game result is calculated directly on-chain using the formula:',
    randomnessDisclaimer: 'The formula uses the previous block hash, timestamp, and your wallet address, preventing casino manipulation.',
    errNotReady: 'Wallet initialization error. Please unlock MetaMask or refresh the page.',
    errMetaMaskPending: 'A connection request is already pending in MetaMask. Please open your wallet extension.',
    errUnknown: 'An unexpected error occurred. Please try again.',
  },
}

export const useLangStore = defineStore('lang', () => {
  const currentLang = ref('ru')

  const t = computed(() => translations[currentLang.value])

  function toggleLang() {
    currentLang.value = currentLang.value === 'ru' ? 'en' : 'ru'
  }

  return {
    currentLang,
    t,
    toggleLang,
  }
})
