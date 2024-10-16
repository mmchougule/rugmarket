const myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json");
myHeaders.append("X-API-KEY", "BQYJlh42HrAt6WlhTEKfK6qNsDidBazO");
myHeaders.append("Authorization", "Bearer ory_at_D2hf175IJis0myK1icYu2Wnx2e-dLTUUXE_wIrHK8RQ.xYbXy7upHmx2hz4E_CFPNQdAh9N4g79GXrSk2AnjxnM");

const raw = JSON.stringify({
   "query": "query MyQuery {\n  Solana {\n    DEXTradeByTokens(\n      limit: {count: 1}\n      orderBy: {descending: Block_Time}\n      where: {Trade: {Currency: {MintAddress: {is: \"BqhVhjkNC3FXXSBibRvBmDiKP2Fs9Ty4Vk9oHjzYpump\"}}, Dex: {ProgramAddress: {is: \"6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P\"}}}, Transaction: {Result: {Success: true}}}\n    ) {\n      Trade {\n        Currency {\n          Name\n          MintAddress\n          Symbol\n          MetadataAddress\n          Key\n          VerifiedCollection\n          Uri\n        }\n        Amount\n        AmountInUSD\n        Price\n        PriceInUSD\n        Side {\n          AmountInUSD\n        }\n        Dex {\n          ProtocolName\n          ProtocolFamily\n          ProgramAddress\n        }\n      }\n    }\n  }\n}\n",
   "variables": "{}"
});

const requestOptions = {
   method: "POST",
   headers: myHeaders,
   body: raw,
   redirect: "follow"
};

fetch("https://streaming.bitquery.io/eap", requestOptions)
   .then((response) => response.text())
   .then((result) => console.log(result))
   .catch((error) => console.error(error));

//    curl --location 'https://streaming.bitquery.io/eap' \
// --header 'Content-Type: application/json' \
// --header 'X-API-KEY: BQYJlh42HrAt6WlhTEKfK6qNsDidBazO' \
// --header 'Authorization: Bearer ory_at_D2hf175IJis0myK1icYu2Wnx2e-dLTUUXE_wIrHK8RQ.xYbXy7upHmx2hz4E_CFPNQdAh9N4g79GXrSk2AnjxnM' \
// --data '{"query":"query MyQuery {\n  Solana {\n    DEXTradeByTokens(\n      limit: {count: 1}\n      orderBy: {descending: Block_Time}\n      where: {Trade: {Currency: {MintAddress: {is: \"BqhVhjkNC3FXXSBibRvBmDiKP2Fs9Ty4Vk9oHjzYpump\"}}, Dex: {ProgramAddress: {is: \"6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P\"}}}, Transaction: {Result: {Success: true}}}\n    ) {\n      Trade {\n        Currency {\n          Name\n          MintAddress\n          Symbol\n          MetadataAddress\n          Key\n          VerifiedCollection\n          Uri\n        }\n        Amount\n        AmountInUSD\n        Price\n        PriceInUSD\n        Side {\n          AmountInUSD\n        }\n        Dex {\n          ProtocolName\n          ProtocolFamily\n          ProgramAddress\n        }\n      }\n    }\n  }\n}\n","variables":"{}"}'