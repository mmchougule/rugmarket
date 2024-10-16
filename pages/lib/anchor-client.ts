import * as anchor from "@coral-xyz/anchor";
import { Connection, PublicKey, SystemProgram, Keypair, Transaction } from "@solana/web3.js";
import { AnchorProvider, Program } from '@coral-xyz/anchor';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import idl from '../idl/rugged_roulette_sol.json';

const programID = new PublicKey("EVcajMJuF9uUrTg96PKW39tsQL5RyDpRZAZk1CUrRrwX");
const RPC = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';

export const getProgram = (wallet) => {
  const connection = new Connection(RPC, 'confirmed');
  const provider = new AnchorProvider(connection, wallet, {
    commitment: 'confirmed',
  });

  return new Program(idl as anchor.Idl, programID, provider);
};

export const fetchGameDetails = async (program: Program, gameAddress: PublicKey) => {
    try {
      const gameAccount = await program.account.game.fetch(gameAddress.toString());
      return gameAccount;
    } catch (error) {
      console.error("Error fetching game details:", error);
      throw error;
    }
};

export const placeBet = async (program: Program, wallet: AnchorWallet, gameAddress: PublicKey, tokenId: PublicKey, amount: number) => {
    try {console.log(amount);console.log(`here : ${new anchor.BN(amount)}`)
      const tx = await program.methods
        .placeBet(tokenId, new anchor.BN(amount))
        .accounts({
          game: gameAddress,
          user: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        // .signers([wallet.publicKey])
        .rpc();
      console.log("Bet placed successfully. Transaction signature:", tx);
      return tx;
    } catch (error) {
      console.error("Error placing bet:", error);
      throw error;
    }
};

export const listActiveGames = async (wallet: anchor.Wallet) => {
    const program = getProgram(wallet);
    const gameListPDA = PublicKey.findProgramAddressSync(
      [Buffer.from("game_list")],
      program.programId
    )[0];

    try {
        let gameList = await program.account.gameList.fetch(gameListPDA);
        return gameList.games;
      } catch (error) {
        console.log(error);
        if (error.message.includes("Account does not exist")) {
          console.log("GameList doesn't exist. Initializing...");
          await program.methods
            .initializeGameList()
            .accounts({
              gameList: gameListPDA,
              authority: program.provider.publicKey,
              systemProgram: SystemProgram.programId,
            })
            .rpc();
          console.log("GameList initialized");
        }
      }
    

    try {
      const games = await program.account.gameList.fetch(gameListPDA);
    //   const activeGames = await program.methods
    console.log(games);

    
      return games;
    } catch (error) {
      console.error("Error listing active games:", error);
      throw error;
    }
  };
  

export const createGameSession = async (wallet: anchor.Wallet, gameDuration: number, tokenIds: string[]) => {
  const program = getProgram(wallet);
  const gameKeypair = Keypair.generate();
  try {
    const gameListPDA = PublicKey.findProgramAddressSync(
      [Buffer.from("game_list")],
      program.programId
    )[0];

    const tx = await program.methods
      .createGameSession(new anchor.BN(gameDuration), tokenIds.map(id => new PublicKey(id)))
      .accounts({
        game: gameKeypair.publicKey,
        admin: program.provider.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
        gameList: gameListPDA,
      })
      .signers([gameKeypair])
      .rpc();

    console.log("Game created. Transaction signature:", tx);
    return { address: gameKeypair.publicKey, signature: tx };
  } catch (error) {
    console.error("Error creating game:", error);
    throw error;
  }
};

// export const createGameSession = async (wallet: anchor.Wallet, gameDuration: anchor.BN, tokenIds: string[]) => {
//   const program = getProgram(wallet);
//   const gameKeypair = Keypair.generate(); 
//   try {
//     const gameListPDA = PublicKey.findProgramAddressSync(
//       [Buffer.from("game_list")],
//       program.programId
//     )[0];

//     console.log(program)
//     const tx = await program.methods
//       .createGameSession(gameDuration, tokenIds)
//       .accounts({
//         game: gameKeypair.publicKey,
//         admin: program.provider.publicKey,
//         systemProgram: anchor.web3.SystemProgram.programId,
//         gameList: gameListPDA,
//       })
//       .transaction();
//       // add the keypair to the signers
//       tx.feePayer = wallet.publicKey;
//       tx.recentBlockhash = (await program.provider.connection.getLatestBlockhash()).blockhash;
//       tx.sign(gameKeypair);

//       // Sign the transaction with the Dynamic wallet
//       const signedTx = await wallet.signTransaction(tx);
//       // Send the signed transaction
//       console.log(signedTx);
//       // const txid = await program.provider.connection.sendRawTransaction(signedTx);//.serialize());
//       // await program.provider.connection.confirmTransaction(txid);

//       console.log("Game created. Transaction signature:", tx.signature);
//   } catch (error) {
//     console.error("Error creating game:", error);
//   }
// };
