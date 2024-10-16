import * as anchor from "@coral-xyz/anchor";
import { Connection, PublicKey, SystemProgram, Keypair } from "@solana/web3.js";
import fs from 'fs';
import { getProgram } from "../lib/anchor-client";
async function main() {
    const wallet = new anchor.Wallet(Keypair.fromSecretKey(
        Buffer.from(JSON.parse(fs.readFileSync('/Users/mayurchougule/rugroulette/keypair.json', 'utf-8')))
    ));
    console.log(wallet);
    await listActiveGames(wallet);
}

export const listActiveGames = async (wallet: anchor.Wallet) => {
  const program = getProgram(wallet);
  const gameListPDA = PublicKey.findProgramAddressSync(
    [Buffer.from("game_list")],
    program.programId
  )[0];

  try {
    const gameList = await program.account.gameList.fetch(gameListPDA);
    console.log(gameList?.games, typeof gameList?.games);
    if (gameList?.games) {
      return gameList.games as any[];
    }
    return [];
  } catch (error) {
    console.error("Error listing active games:", error);
    throw error;
  }
};
main().then(() => process.exit(0)).catch(error => {
    console.error(error);
    process.exit(1);
});