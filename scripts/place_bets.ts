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

    if (process.argv.length < 5) {
        console.error("Please provide the game session address, token ID, and bet amount as arguments.");
        process.exit(1);
    }

    const gameSessionAddress = new PublicKey(process.argv[2]);
    const tokenId = new PublicKey(process.argv[3]);
    const betAmount = new anchor.BN(process.argv[4]);

    try {
        const tx = await program.methods
            .placeBet(tokenId, betAmount)
            .accounts({
                game: gameSessionAddress,
                user: wallet.publicKey,
                systemProgram: anchor.web3.SystemProgram.programId,
            })
            .rpc();

        console.log("Bet placed successfully!");
        console.log("Transaction signature:", tx);
    } catch (error) {
        console.error("Error placing bet:", error);
    }
}

main().then(() => process.exit(0)).catch(error => {
    console.error(error);
    process.exit(1);
});