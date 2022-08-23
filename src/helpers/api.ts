import axios, { AxiosInstance } from "axios";

import { SUPPORTED_CHAINS } from "./chains";
import { IAssetData, IGasPrices, IParsedTx } from "./types";

const api: AxiosInstance = axios.create({
  baseURL: "https://ethereum-api.xyz",
  timeout: 30000, // 30 secs
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

export async function apiGetAccountAssets(address: string, chainId: number): Promise<IAssetData[]> {
  const response = await api.get(`/account-assets?address=${address}&chainId=${chainId}`);
  const { result } = response.data;
  return result;
}

export async function apiGetAccountTransactions(
  address: string,
  chainId: number,
): Promise<IParsedTx[]> {
  const response = await api.get(`/account-transactions?address=${address}&chainId=${chainId}`);
  const { result } = response.data;
  return result;
}

export const apiGetAccountNonce = async (address: string, chainId: number): Promise<string> => {
  let nonce = "0x0";
  try {
    const response = await api.get(`/account-nonce?address=${address}&chainId=${chainId}`);
    nonce = response.data.result;
  } catch (error) {
    // fallback to rpc call
    const supportedChain = SUPPORTED_CHAINS.find(item => item.chain_id === chainId);
    const rpc = supportedChain ? supportedChain.rpc_url : "";
    if (rpc) {
      const data = {
        id: Date.now(),
        jsonrpc: "2.0",
        method: "eth_getTransactionCount",
        params: [address, "pending"],
      };
      const rs = await axios({
        method: "post",
        url: rpc,
        headers: {
          "Content-Type": "application/json",
        },
        data: JSON.stringify(data),
      });
      // @ts-ignore
      nonce = rs.data.result;
      console.log("🚀 ~ file: api.ts ~ line 56 ~ apiGetAccountNonce ~ nonce", nonce);
    }
  }

  return nonce;
};

export const apiGetGasPrices = async (): Promise<IGasPrices> => {
  const response = await api.get(`/gas-prices`);
  const { result } = response.data;
  return result;
};
