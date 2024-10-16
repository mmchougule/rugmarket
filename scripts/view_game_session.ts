import * as anchor from "@coral-xyz/anchor";
import { Program, AnchorProvider, Idl } from "@coral-xyz/anchor";
import { Keypair, PublicKey } from "@solana/web3.js";
import * as toml from 'toml';
import fs from 'fs';
import { getProgram } from "../pages/lib/anchor-client";


async function main() {
    const wallet = new anchor.Wallet(Keypair.fromSecretKey(
        Buffer.from(JSON.parse(fs.readFileSync('/Users/mayurchougule/rugroulette/keypair.json', 'utf-8')))
    ));
    const program = getProgram(wallet);

    if (process.argv.length < 3) {
        console.error("Please provide the game session address as an argument.");
        process.exit(1);
    }

    const gameSessionAddress = new PublicKey(process.argv[2]);

    try {
        const gameAccount = await program.account.game.fetch(gameSessionAddress);

        console.log("Game Session Details:");
        console.log(gameAccount);
        console.log("Admin:", (gameAccount.admin as PublicKey).toString());
        console.log("Start Time:", new Date((gameAccount.startTime as anchor.BN).toNumber() * 1000).toUTCString());
        console.log("End Time:", new Date((gameAccount.endTime as anchor.BN).toNumber() * 1000).toUTCString());
        // console.log("Treasury:", gameAccount.treasury.toString(), "lamports");
        console.log("Tokens:");
        if (Array.isArray(gameAccount.tokens)) {
            gameAccount.tokens.forEach((token: any, index: number) => {
                console.log(`  ${index + 1}. ID: ${token.id.toString()}, Price: ${token.price}`);
            });
        } else {
            console.log("No tokens available or tokens is not an array.");
        }
        console.log("Bets:");
        if (Array.isArray(gameAccount.bets)) {
            gameAccount.bets.forEach((bet: any, index: number) => {
                console.log(`  ${index + 1}. User: ${bet.user.toString()}, Token: ${bet.token.toString()}, Amount: ${bet.amount.toString()} lamports`);
            });
        } else {
            console.log("No bets available or bets is not an array.");
        }
        console.log("Winning Token:", (gameAccount.winningToken as PublicKey).toString());
    } catch (error) {
        console.error("Error fetching game session:", error);
    }
}

main().then(() => process.exit(0)).catch(error => {
    console.error(error);
    process.exit(1);
});
