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

    // Mock price updates - in a real scenario, you'd fetch these from an oracle or other source
    const priceUpdates = [
        { tokenId: new PublicKey("E2uo9LHz6hB1jXfFDXe25vV3SmQvehttxpTV8ncJZCdY"), price: 100 },
        { tokenId: new PublicKey("J8RM9GWY5bfZJxn3n6ixQ3F8Z5tXQCnyJHiZjw5genSo"), price: 200 },
    ];

    try {
        const tx = await program.methods
            .updatePrices(priceUpdates)
            .accounts({
                game: gameSessionAddress,
                admin: wallet.publicKey,
            })
            .rpc();

        console.log("Prices updated successfully!");
        console.log("Transaction signature:", tx);
    } catch (error) {
        console.error("Error updating prices:", error);
    }
}

main().then(() => process.exit(0)).catch(error => {
    console.error(error);
    process.exit(1);
});

// import * as anchor from "@coral-xyz/anchor";
// import { Program } from "@coral-xyz/anchor";
// import { RuggedRouletteSol } from "../target/types/rugged_roulette_sol";

// async function main() {
//   const provider = anchor.AnchorProvider.env();
//   anchor.setProvider(provider);

//   const program = anchor.workspace.RuggedRouletteSol as Program<RuggedRouletteSol>;

//   // Replace with your actual game session address
//   const gameSessionAddress = new anchor.web3.PublicKey("YOUR_GAME_SESSION_ADDRESS");

//   // Replace with actual token IDs and new prices
//   const priceUpdates = [
//     { tokenId: new anchor.web3.PublicKey("TOKEN_ID_1"), newPrice: new anchor.BN(90) },
//     { tokenId: new anchor.web3.PublicKey("TOKEN_ID_2"), newPrice: new anchor.BN(80) },
//   ];

//   try {
//     const tx = await program.methods
//       .updateTokenPrices(priceUpdates)
//       .accounts({
//         gameSession: gameSessionAddress,
//         admin: provider.wallet.publicKey,
//       })
//       .rpc();

//     console.log("Token prices updated successfully. Transaction signature:", tx);
//   } catch (error) {
//     console.error("Error updating token prices:", error);
//   }
// }

// main().then(() => process.exit(0)).catch(error => {
//   console.error(error);
//   process.exit(1);
// });