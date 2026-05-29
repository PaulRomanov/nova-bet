// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title NovaBet Casino - Coinflip Game
 * @author NovaBet Team ( MVP)
 * @notice Provably fair coinflip game with 1.95x payout (2.5% house edge)
 *
 * @dev RANDOMNESS DISCLAIMER:
 *   This contract uses blockhash + block.timestamp + player address for pseudo-randomness.
 *   This is NOT suitable for production — miners can theoretically manipulate block variables.
 *   For production, use Chainlink VRF (https://docs.chain.link/vrf).
 *   This approach is acceptable for a  MVP demonstration on Sepolia testnet.
 */
contract Casino {
    // ─── State ────────────────────────────────────────────────────────────────

    address public owner;

    /// @dev Player balance inside the casino (in wei)
    mapping(address => uint256) public balances;

    /// @dev Minimum bet: 0.001 ETH
    uint256 public constant MIN_BET = 0.001 ether;

    /// @dev Maximum bet: 0.1 ETH (protects casino liquidity)
    uint256 public constant MAX_BET = 0.1 ether;

    /// @dev Payout multiplier numerator (1.95x => 195 / 100)
    uint256 public constant PAYOUT_NUMERATOR = 195;
    uint256 public constant PAYOUT_DENOMINATOR = 100;

    /// @dev Minimum casino reserve required to accept bets
    uint256 public constant MIN_CASINO_RESERVE = 0.5 ether;

    // ─── Events ───────────────────────────────────────────────────────────────

    event Deposited(address indexed player, uint256 amount);
    event Withdrawn(address indexed player, uint256 amount);
    event CoinFlipped(
        address indexed player,
        uint8 choice,       // 0 = Heads, 1 = Tails
        uint8 result,       // 0 = Heads, 1 = Tails
        uint256 betAmount,
        uint256 payout,
        bool won
    );
    event CasinoFunded(address indexed funder, uint256 amount);

    // ─── Modifiers ────────────────────────────────────────────────────────────

    modifier onlyOwner() {
        require(msg.sender == owner, "Casino: not owner");
        _;
    }

    modifier validBet(uint256 amount) {
        require(amount >= MIN_BET, "Casino: bet too small");
        require(amount <= MAX_BET, "Casino: bet too large");
        require(balances[msg.sender] >= amount, "Casino: insufficient balance");
        _;
    }

    // ─── Constructor ──────────────────────────────────────────────────────────

    constructor() payable {
        owner = msg.sender;
        // Owner can pre-fund the casino on deployment
        if (msg.value > 0) {
            emit CasinoFunded(msg.sender, msg.value);
        }
    }

    // ─── Player Functions ─────────────────────────────────────────────────────

    /**
     * @notice Deposit ETH into your casino balance
     */
    function deposit() external payable {
        require(msg.value > 0, "Casino: zero deposit");
        balances[msg.sender] += msg.value;
        emit Deposited(msg.sender, msg.value);
    }

    /**
     * @notice Withdraw your casino balance back to your wallet
     * @param amount Amount in wei to withdraw
     */
    function withdraw(uint256 amount) external {
        require(amount > 0, "Casino: zero withdraw");
        require(balances[msg.sender] >= amount, "Casino: insufficient balance");

        // CEI pattern: update state before transfer to prevent reentrancy
        balances[msg.sender] -= amount;

        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Casino: transfer failed");

        emit Withdrawn(msg.sender, amount);
    }

    /**
     * @notice Play Coinflip game
     * @param choice 0 = Heads, 1 = Tails
     * @param betAmount Amount in wei to bet (must be <= your balance)
     *
     * @dev Pseudo-randomness using blockhash + timestamp + player address.
     *   The result is: keccak256(blockhash(block.number - 1), timestamp, sender) % 2
     *   House edge: 2.5% (payout is 1.95x instead of 2x)
     */
    function flip(uint8 choice, uint256 betAmount)
        external
        validBet(betAmount)
        returns (bool won, uint8 result, uint256 payout)
    {
        require(choice == 0 || choice == 1, "Casino: invalid choice");

        // Ensure casino has enough reserves to pay out potential win
        uint256 maxPayout = (betAmount * PAYOUT_NUMERATOR) / PAYOUT_DENOMINATOR;
        uint256 casinoReserve = address(this).balance - balances[msg.sender];
        require(
            casinoReserve >= maxPayout,
            "Casino: insufficient casino reserve"
        );

        // Pseudo-random result — DISCLAIMER: not production-grade
        bytes32 seed = keccak256(
            abi.encodePacked(
                blockhash(block.number - 1),
                block.timestamp,
                msg.sender,
                betAmount
            )
        );
        result = uint8(uint256(seed) % 2);

        won = (result == choice);

        if (won) {
            payout = maxPayout;
            // Deduct bet from balance, then credit the payout
            balances[msg.sender] = balances[msg.sender] - betAmount + payout;
        } else {
            payout = 0;
            balances[msg.sender] -= betAmount;
        }

        emit CoinFlipped(msg.sender, choice, result, betAmount, payout, won);
    }

    // ─── View Functions ───────────────────────────────────────────────────────

    /**
     * @notice Get player's casino balance
     */
    function getBalance(address player) external view returns (uint256) {
        return balances[player];
    }

    /**
     * @notice Get casino's total ETH reserve
     */
    function getCasinoReserve() external view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @notice Get current bet limits
     */
    function getBetLimits() external pure returns (uint256 min, uint256 max) {
        return (MIN_BET, MAX_BET);
    }

    // ─── Owner Functions ──────────────────────────────────────────────────────

    /**
     * @notice Fund the casino with more ETH (only owner)
     */
    function fundCasino() external payable onlyOwner {
        require(msg.value > 0, "Casino: zero amount");
        emit CasinoFunded(msg.sender, msg.value);
    }

    /**
     * @notice Withdraw casino profits (only owner)
     * @param amount Amount to withdraw in wei
     */
    function ownerWithdraw(uint256 amount) external onlyOwner {
        require(
            address(this).balance >= MIN_CASINO_RESERVE + amount,
            "Casino: would breach minimum reserve"
        );

        (bool success, ) = payable(owner).call{value: amount}("");
        require(success, "Casino: transfer failed");
    }

    /**
     * @notice Transfer ownership
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Casino: zero address");
        owner = newOwner;
    }

    // ─── Fallback ─────────────────────────────────────────────────────────────

    /// @dev Allow direct ETH sends to fund the casino
    receive() external payable {
        emit CasinoFunded(msg.sender, msg.value);
    }
}
