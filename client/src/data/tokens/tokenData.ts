import gql from "graphql-tag";
import { ApolloClient, NormalizedCacheObject } from "@apollo/client";

export type TokenData = {
  // token is in some pool on uniswap
  exists: boolean;

  // basic token info
  name: string;
  symbol: string;
  address: string;

  // volume
  volumeUSD: number;
  volumeUSDChange: number;
  volumeUSDWeek: number;
  txCount: number;

  //fees
  feesUSD: number;

  // tvl
  tvlToken: number;
  tvlUSD: number;
  tvlUSDChange: number;

  priceUSD: number;
  priceUSDChange: number;
  priceUSDChangeWeek: number;
};

export const TOKENS_BULK = (block: number | undefined, tokens: string[]) => {
  let tokenString = `[`;
  tokens.map((address) => {
    return (tokenString += `"${address}",`);
  });
  tokenString += "]";
  const queryString =
    `
    query tokens {
      tokens(where: {id_in: ${tokenString}},` +
    (block ? `block: {number: ${block}} ,` : ``) +
    ` orderBy: totalValueLockedUSD, orderDirection: desc, subgraphError: allow) {
        id
        symbol
        name
        derivedETH
        volumeUSD
        volume
        txCount
        totalValueLocked
        feesUSD
        totalValueLockedUSD
      }
    }
    `;
  return gql(queryString);
};

export interface TokenFields {
  id: string;
  symbol: string;
  name: string;
  derivedETH: string;
  volumeUSD: string;
  volume: string;
  feesUSD: string;
  txCount: string;
  totalValueLocked: string;
  totalValueLockedUSD: string;
}

interface TokenDataResponse {
  tokens: TokenFields[];
}

/**
 * Fetch top addresses by volume
 */
export async function fetchTokenDatas(
  tokenAddresses: string[],
  client: ApolloClient<NormalizedCacheObject>
): Promise<{
  data:
    | {
        [address: string]: TokenFields;
      }
    | undefined
}> {
  var data: TokenDataResponse;
  const parsed = await client
    .query<any>({ query: TOKENS_BULK(undefined, tokenAddresses) })
    .then((res) => {
      data = res.data;

      const parsed = data?.tokens
        ? data.tokens.reduce(
            (accum: { [address: string]: TokenFields }, poolData) => {
              accum[poolData.id] = poolData;
              return accum;
            },
            {}
          )
        : undefined;

      return parsed;
    })
    .catch((e) => {
      console.log(e);
    });
  
  return parsed? { data: parsed } : {data: undefined}
}
