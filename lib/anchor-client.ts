import * as anchor from "@coral-xyz/anchor";
import { Connection, PublicKey, SystemProgram, Keypair, Transaction } from "@solana/web3.js";
import { AnchorProvider, Program } from '@coral-xyz/anchor';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import idl from '../pages/idl/rugged_roulette_sol.json';
import { supabase } from './supabase';

const programID = new PublicKey(process.env.PROGRAM_ID || '5djhviexKdu7EZTEFDftYAd9AgdEwbSi2hXq6U8JVrTW');
const RPC = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';

export const getProgram = (wallet: AnchorWallet) => {
  const connection = new Connection(RPC, 'confirmed');
  const provider = new AnchorProvider(connection, wallet, {
    commitment: 'confirmed',
  });

  return new Program(idl as anchor.Idl, programID, provider);
};

export const fetchGameRoundDetails = async (program: Program, gameAddress: PublicKey) => {
    try {
      const gameAccount = await program.account.game.fetch(gameAddress);
      return gameAccount;
    } catch (error) {
      console.error("Error fetching game details:", error);
      return null;
    }
};

const initializeUser = async (program: Program, wallet: AnchorWallet) => {
  const userAccountPDA = PublicKey.findProgramAddressSync(
    [Buffer.from("user"), wallet.publicKey.toBuffer()],
    program.programId
  )[0];
  try {
    // First, check if the user account exists and is initialized
    const userAccount = await program.account.userAccount.fetch(userAccountPDA)
    if (!userAccount) {
      console.log("User account does not exist");
    }
    return userAccountPDA;
  } catch (error) {
    try {
      console.log("User account does not exist. Initializing...");
      const initUserTx = await program.methods
        .initializeUser(wallet.publicKey.toString()) // default twitter handle for now.
        .accounts({
          user: userAccountPDA,
          // userAccount: userAccountPDA,
          authority: wallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();
        console.log("User initialized. Transaction signature:", initUserTx);
      return userAccountPDA;
    } catch (error) {
      console.error("Error initializing user:", error);
      throw error;
    }
  }
}

export async function initializeUserWithTwitter(
  program: anchor.Program,
  user: anchor.web3.Keypair,
  twitterHandle: string
): Promise<string> {
  try {
      // Verify twitter handle format
      if (!twitterHandle.startsWith("@")) {
          throw new Error("Twitter handle must start with @");
      }

      // Check if twitter handle is already used
      const allUsers = await program.account.userAccount.all();
      const existingHandle = allUsers.find(
          account => account.account.twitterHandle === twitterHandle
      );
      
      if (existingHandle) {
          // throw new Error("Twitter handle already registered");
          console.log("Twitter handle already registered");
          return "Twitter handle already registered";
      }

      // Derive PDA for user account
      const [userPDA] = await PublicKey.findProgramAddress(
          [
              Buffer.from("user"),
              user.publicKey.toBuffer(),
          ],
          program.programId
      );

      const tx = await program.methods
          .initializeUser(twitterHandle)
          .accounts({
              user: userPDA,
              signer: user.publicKey,
              systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([user])
          .rpc();

      return tx;
  } catch (error) {
      console.error("Error initializing user:", error);
      throw error;
  }
}


export const placeBet = async (program: Program, wallet: AnchorWallet, gameAddress: PublicKey, tokenId: PublicKey, amount: number) => {
  // const userAccountPDA = await initializeUser(program, wallet);
  const [userAccountPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("user"), wallet.publicKey.toBuffer()],
    program.programId
  )

  try {
      const tx = await program.methods
        .placeBet(tokenId, new anchor.BN(amount))
        .accounts({
          game: gameAddress,
          user: wallet.publicKey,
          userAccount: userAccountPDA,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();
      console.log("Bet placed successfully. Transaction signature:", tx);
      if (tx) {
        // find game id from game address
        const { data: game, error: gameError } = await supabase
          .from('game_rounds')
          .select('id')
          .eq('address', gameAddress.toString())
          .single()
        const { error: betError } = await supabase
          .from('bets')
          .insert({
            game_id: game.id,
            game_address: gameAddress.toString(),
            user_address: wallet.publicKey.toString(),
            token_id: tokenId.toString(),
            amount: amount
          })

        console.log(betError)

        return tx;
      }
    } catch (error) {
      console.error("Error placing bet:", error);
      throw error;
    }
};
 
export const listActiveGames = async (program: Program) => {
    // get list of games from supabase
    const { data, error } = await supabase
      .from('game_rounds')
      .select('*')
      // .eq('status', 'active')
      .order('end_time', { ascending: false })

    console.log(data);

    return data;
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
