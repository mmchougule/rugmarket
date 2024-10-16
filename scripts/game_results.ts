import * as anchor from "@coral-xyz/anchor";
import { Program, AnchorProvider, Idl } from "@coral-xyz/anchor";
import { Keypair, PublicKey } from "@solana/web3.js";
import * as toml from 'toml';
import fs from 'fs';


async function main() {
    const connection = new anchor.web3.Connection("http://localhost:8899", 'confirmed');
    const wallet = new anchor.Wallet(Keypair.fromSecretKey(
        Buffer.from(JSON.parse(fs.readFileSync('/Users/mayurchougule/rugroulette/keypair.json', 'utf-8')))
    ));
    const provider = new AnchorProvider(connection, wallet, { commitment: 'confirmed' });
    anchor.setProvider(provider);

    const anchorTomlContent = fs.readFileSync('./Anchor.toml', 'utf8');
    const anchorConfig = toml.parse(anchorTomlContent);
    const programId = new PublicKey(anchorConfig.programs.localnet.rugged_roulette_sol.address);
    const idl = JSON.parse(fs.readFileSync('./target/idl/rugged_roulette_sol.json', 'utf8')) as Idl;
    const program = new Program(idl, programId, provider);
    console.log(process.argv)

    if (process.argv.length < 3) {
        console.error("Please provide the game session address as an argument.");
        process.exit(1);
    }

    const gameSessionAddress = new PublicKey(process.argv[2]);

    try {
        const gameAccount = await program.account.game.fetch(gameSessionAddress);
        // Process game data
        const totalBets = (gameAccount.bets as any[])
          .reduce((sum: number, bet: any) => sum + bet.amount.toNumber(), 0);
        const uniqueBettors = new Set((gameAccount.bets as any[]).map((bet: any) => bet.user.toString())).size;
        
        const winningToken = (gameAccount.tokens as any[]).reduce((min: any, token: any) => 
            token.price < min.price ? token : min
        );
        
        const winningBets = (gameAccount.bets as any[]).filter((bet: any) => bet.token.equals(winningToken.id));
        const totalWinningBets = winningBets.reduce((sum, bet) => sum + bet.amount.toNumber(), 0);
        
        const houseFee = totalBets * 0.01; // Assume 1% house fee
        const payoutPool = totalBets - houseFee;
        
        const winnerPayouts = winningBets.map(bet => ({
            user: bet.user.toString(),
            payout: (bet.amount.toNumber() / totalWinningBets) * payoutPool
        }));

        // Display results
        console.log("Game Results:");
        console.log("-------------");
        console.log(`Game Status: ${gameAccount.status}`);
        console.log(`Start Time: ${new Date(gameAccount.startTime as number * 1000).toLocaleString()}`);
        console.log(`End Time: ${new Date(gameAccount.endTime as number * 1000).toLocaleString()}`);
        console.log(`Total Bets: ${totalBets / anchor.web3.LAMPORTS_PER_SOL} SOL`);
        console.log(`Number of Unique Bettors: ${uniqueBettors}`);
        console.log(`Winning Token: ${winningToken.id.toString()}`);
        console.log(`Winning Token Price: ${winningToken.price}`);
        console.log(`House Fee: ${houseFee / anchor.web3.LAMPORTS_PER_SOL} SOL`);
        console.log(`Payout Pool: ${payoutPool / anchor.web3.LAMPORTS_PER_SOL} SOL`);
        console.log(`Game Profit: ${houseFee / anchor.web3.LAMPORTS_PER_SOL} SOL`);
        console.log(`Win Percentage: ${(winningBets.length / (gameAccount.bets as any[]).length * 100).toFixed(2)}%`);
        
        console.log("\nWinner Payouts:");
        winnerPayouts.forEach((winner, index) => {
            console.log(`${index + 1}. ${winner.user}: ${winner.payout / anchor.web3.LAMPORTS_PER_SOL} SOL`);
        });

    } catch (error) {
        console.error("Error fetching game results:", error);
    }
}

main().then(() => process.exit(0)).catch(error => {
    console.error(error);
    process.exit(1);
});