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

    if (process.argv.length < 3) {
        console.error("Please provide the game session address as an argument.");
        process.exit(1);
    }

    const gameSessionAddress = new PublicKey(process.argv[2]);

    try {
        // Fetch the game account to get the list of bettors
        const gameAccount = await program.account.game.fetch(gameSessionAddress);
        if (Array.isArray(gameAccount.bets)) {
            const bettorAccounts = gameAccount.bets.map((bet: any) => ({
                pubkey: bet.user,
                isWritable: true,
                    isSigner: false
                }));

            const tx = await program.methods
                .endGame()
                .accounts({
                    game: gameSessionAddress,
                    admin: wallet.publicKey,
                    systemProgram: anchor.web3.SystemProgram.programId,
                })
                .remainingAccounts(bettorAccounts)
                .rpc();
            console.log("Game ended successfully!");
            console.log("Transaction signature:", tx);
        }


    } catch (error) {
        console.error("Error ending game:", error);
    }
}

main().then(() => process.exit(0)).catch(error => {
    console.error(error);
    process.exit(1);
});