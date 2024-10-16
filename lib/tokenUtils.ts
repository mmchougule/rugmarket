import { PublicKey } from '@solana/web3.js';
import pumpTokensData from '../pages/utils/pumptokens.json';

interface TokenDetails {
  name: string;
  symbol: string;
  mintAddress: string;
  price: number;
  change24h: number;
}

export const fetchTokenDetails = async (tokenIds: string[]): Promise<TokenDetails[]> => {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("X-API-KEY", "BQYJlh42HrAt6WlhTEKfK6qNsDidBazO");
  myHeaders.append("Authorization", "Bearer ory_at_D2hf175IJis0myK1icYu2Wnx2e-dLTUUXE_wIrHK8RQ.xYbXy7upHmx2hz4E_CFPNQdAh9N4g79GXrSk2AnjxnM");

  const query = `
    query ($tokenIds: [String!]) {
      Solana {
        DEXTradeByTokens(
          limit: {count: 100}
          orderBy: {descending: Block_Time}
          where: {Trade: {Currency: {MintAddress: {in: $tokenIds}}, Dex: {ProgramAddress: {is: "6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P"}}}, Transaction: {Result: {Success: true}}}
        ) {
          Trade {
            Currency {
              Name
              MintAddress
              Symbol
            }
            Price
            PriceInUSD
          }
        }
      }
    }
  `;

  const variables = { tokenIds };

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: JSON.stringify({ query, variables }),
  };

  try {
    const response = await fetch("https://streaming.bitquery.io/eap", requestOptions);
    const result = await response.json();
    
    const tokenDetails: TokenDetails[] = tokenIds.map(mintAddress => {
      const trade = result.data.Solana.DEXTradeByTokens.find(
        (t: any) => t.Trade.Currency.MintAddress === mintAddress
      );

      if (trade) {
        return {
          name: trade.Trade.Currency.Name,
          symbol: trade.Trade.Currency.Symbol,
          mintAddress: trade.Trade.Currency.MintAddress,
          priceInUSD: trade.Trade.PriceInUSD,
          price: trade.Trade.Price,
          change24h: 0, // You might need to fetch this separately or calculate it
        };
      } else {
        return {
          name: null,
          symbol: null,
          mintAddress,
          price: null,
          change24h: null,
        };
      }
    });

    return tokenDetails;
  } catch (error) {
    console.error("Error fetching token details:", error);
    return tokenIds.map(mintAddress => ({
      name: null,
      symbol: null,
      mintAddress,
      price: null,
      change24h: null,
    }));
  }
};

export type { TokenDetails };

interface UniqueToken {
  name: string;
  symbol: string;
  mintAddress: string;
  priceInUSD: number;
  price: number;
  uri: string;
}

// {
//     "name": "SWANIN",
//     "symbol": "SWANIN",
//     "description": "Hello, I’m SWANIN, your friendly digital assistant!\r\nHere to help, guide, and solve, no matter the task.\r\nLet’s make today smarter together!",
//     "image": "https://ipfs.io/ipfs/QmYaKWub8yG5E4jmibc8SqUT55eq213vWtUpdFYAkLLhKL",
//     "showName": true,
//     "createdOn": "https://pump.fun",
//     "twitter": "https://x.com/swanin",
//     "telegram": "https://t.me/swanin",
//     "website": "https://swanin.live/"
//   }
export const getTokenDetails = async (tokens: string[]): Promise<UniqueToken[]> => {
  // const uniqueTokens = require('./unique_tokens.json');
  // const tokenDetails = uniqueTokens.filter((token: UniqueToken) => tokens.includes(token.mintAddress));
  const tokenDetails = await Promise.all(tokens.map(async (mintAddress: string) => {
    const proxyUrl = `/api/proxy?path=coins/${mintAddress}`;
    const response = await fetch(proxyUrl);
    const data = await response.json();
    return data;
  }));

  // // for each token, get details from the token.uri
  // const tokenDetailsWithDetails = await Promise.all(tokenDetails.map(async (token: UniqueToken) => {
  //   const response = await fetch(token.uri);
  //   const data = await response.json();
  //   return {
  //     ...token,
  //     name: data.name,
  //     symbol: data.symbol,
  //     description: data.description,
  //     image: data.image,
  //     showName: data.showName,
  //     createdOn: data.createdOn,
  //     twitter: data.twitter,
  //     telegram: data.telegram,
  //     website: data.website,
  //   };
  // }));
  return tokenDetails;
}

export const getTopPumpTokens = (count: number = 10): UniqueToken[] => {
  const tokens = new Set<UniqueToken>();
  // read from unique_tokens.json
  const uniqueTokens = require('../pages/utils/unique_tokens.json');
  uniqueTokens.forEach((token: UniqueToken) => {
    tokens.add(token);
  });

  return Array.from(tokens).slice(0, count);
};

