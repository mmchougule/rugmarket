# Rugged Roulette Documentation

## Overview
Rugged Roulette is a fast-paced betting game on Solana where players bet on which token will have the lowest price at the end of a betting period. The game features a unique free-bet system for new players and regular betting with house fees.

## Game Mechanics

### Game Lifecycle
1. Game Creation (Every 10 minutes)
   - Two tokens selected for betting
   - Betting duration: 10 minutes
   - Minimum bet: 0.05 SOL
   - House fee: 10% (only on regular bets)

### Bet Types
1. **Free Bet**
   - Available once per wallet
   - No SOL required to place bet
   - Receives 75% of normal winning share
   - Perfect for new players to try the game

2. **Regular Bet**
   - Requires SOL deposit
   - Full share of winnings
   - Subject to house fee
   - No limit on number of bets

## Winning Calculations & Scenarios

### Scenario 1: Low Activity Game
```
Game Settings:
- 2 players
- 10 minute duration
- Token A vs Token B

Bets:
Player 1: 0.1 SOL on Token A (FREE bet)
Player 2: 0.1 SOL on Token B (REGULAR bet)

If Token A Wins:
- Total Pot: 0.1 SOL (only regular bets)
- House Fee: 0.01 SOL
- Player 1 wins: 0.09 SOL * 0.75 = 0.0675 SOL
- House keeps: 0.01 SOL

ROI:
- Player 1: ∞% (free bet)
- Player 2: -100% (lost bet)
- House: 10% of regular bets
```

### Scenario 2: Medium Activity Game
```
Game Settings:
Same as above

Bets:
Player 1: 0.1 SOL on Token A (FREE bet)
Player 2: 0.2 SOL on Token A (REGULAR bet)
Player 3: 0.3 SOL on Token B (REGULAR bet)

If Token A Wins:
- Total Real Pot: 0.5 SOL
- House Fee: 0.05 SOL
- Winning Pot: 0.45 SOL
- Distribution:
  * Player 1 (FREE): ~0.11 SOL (reduced share)
  * Player 2 (REGULAR): ~0.34 SOL (full share)
  * House: 0.05 SOL

ROI:
- Player 1: ∞% (free bet)
- Player 2: +70%
- Player 3: -100%
- House: 10% of 0.5 SOL
```

### Scenario 3: High Activity Game
```
Game Settings:
Same as above

Bets:
5 players on Token A: 1 SOL each (4 regular, 1 free)
3 players on Token B: 1 SOL each (all regular)

If Token A Wins:
- Total Real Pot: 7 SOL
- House Fee: 0.7 SOL
- Winning Pot: 6.3 SOL
- Distribution:
  * Free Bet Winner: ~0.945 SOL (75% share)
  * Each Regular Winner: ~1.34 SOL
  * House: 0.7 SOL

ROI:
- Free Bet Winner: ∞%
- Regular Winners: +34%
- Losing Players: -100%
- House: 10% of 7 SOL
```

## House Economics

### Revenue Streams
1. Primary: 10% house fee on regular bets
2. Secondary: Unclaimed winnings (if any)

### Expected Revenue per Game
```
Low Activity (10-20 players):
- Average pot: 2 SOL
- House revenue: 0.2 SOL
- Daily revenue (144 games): ~28.8 SOL

High Activity (50+ players):
- Average pot: 10 SOL
- House revenue: 1 SOL
- Daily revenue (144 games): ~144 SOL
```

## Operational Considerations

### Game Frequency
```
Games per day: 144 (one every 10 minutes)
Optimal schedule:
- Game starts: XX:00
- Betting ends: XX:10
- Results & Payouts: XX:11
- Next game prep: XX:12-XX:59
```

### Technical Requirements
1. RPC Node capacity: ~500 transactions per game
2. Program compute budget: Well within limits
3. Account space: Fixed per game

### Risk Management
1. Price Oracle reliability
2. Network congestion during high activity
3. Minimum player threshold (optional)

## Player Benefits

### New Players
1. Risk-free first bet
2. Learning opportunity
3. Real winning potential
4. No KYC required

### Regular Players
1. Frequent betting opportunities
2. Simple win conditions
3. Quick payouts
4. Transparent odds

## Example Betting Strategies

### Conservative
```
- Wait for price trends
- Bet minimum amounts
- Use free bet first
- Focus on familiar tokens
```

### Aggressive
```
- Multiple bets per game
- Higher amounts
- Both tokens coverage
- Volume-based approach
```

## Future Considerations

### Potential Enhancements
1. Tiered betting system
2. Token variety expansion
3. Tournament modes
4. Loyalty rewards

### Scaling Considerations
1. Multiple parallel games
2. Different duration options
3. Variable fee structures
4. Cross-chain expansion

## Technical Integration

### Frontend Requirements
```typescript
interface GameState {
    gameId: string;
    startTime: number;
    endTime: number;
    tokenA: PublicKey;
    tokenB: PublicKey;
    totalBets: number;
    currentPot: number;
}

interface BetResult {
    txId: string;
    betAmount: number;
    potentialWinning: number;
    timestamp: number;
}
```

### RPC Requirements
- Dedicated RPC recommended for >1000 users
- Websocket connections for real-time updates
- Cache layer for frequent queries

Would you like me to expand on any of these sections or add more specific scenarios?

Description: Allow players to speculate on real-world trends, like which meme coin will lose value the fastest. Players bet on the outcome, and winners share the pot based on their predictions.
Implementation:
Implement a prediction market where players bet on the outcome of real or fictional events, with options to bet up or down on certain meme tokens.
Use smart contracts to hold the bets and automatically distribute winnings when the outcome is determined.
Example Use: Players predict the value of meme coins over the next 24 hours. If the chosen coin drops the most, those who bet on it share the winnings.


# Rugged Roulette UI Flow

## 1. Game Creation
- Display: "Game Created" with start time and end time
- Show: Game session address, Admin address

## 2. Betting Period
- Display: Countdown timer to end of betting period
- Show: List of available tokens
- Allow: Users to place bets
- Real-time update: Total bets placed, Number of unique bettors

## 3. Betting Closed
- Display: "Betting Closed" message
- Show: Summary of all bets placed

## 4. Price Update
- Display: "Updating Prices" message
- Show: New prices for each token
- Highlight: Token with the lowest price (winner)

## 5. Game Ended
- Display: "Game Ended" message
- Show: 
  - Winning token
  - Total bets amount
  - Number of winning bets
  - Total payout amount

## 6. Results and Statistics
- Display:
  - List of winners and their payouts
  - Game profit/loss
  - House fee (if applicable)
  - Return on Investment (ROI) for winners
  - Percentage of bets that won

## 7. New Game Option
- Allow admin to create a new game
- Show history of past games