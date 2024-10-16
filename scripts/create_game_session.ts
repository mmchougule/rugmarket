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

    const gameKeypair = Keypair.generate();
    const bettingDuration = 600; // 10 minutes
    const tokenIds = [Keypair.generate().publicKey, Keypair.generate().publicKey];

    try {
        const tx = await program.methods
            .createGameSession(new anchor.BN(bettingDuration), tokenIds)
            .accounts({
                game: gameKeypair.publicKey,
                admin: provider.wallet.publicKey,
                systemProgram: anchor.web3.SystemProgram.programId,
            })
            .signers([gameKeypair])
            .rpc();

        console.log("Game session created with address:", gameKeypair.publicKey.toString());
        console.log("Transaction signature:", tx);
    } catch (error) {
        console.error("Error creating game session:", error);
    }
}

main().then(() => process.exit(0)).catch(error => {
    console.error(error);
    process.exit(1);
});