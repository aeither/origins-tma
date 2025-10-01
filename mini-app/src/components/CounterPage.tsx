import React, { useState, useEffect } from "react";
import {
  TonConnectButton,
  useTonConnectUI,
  useTonWallet,
} from "@tonconnect/ui-react";
import { TonClient, Address, toNano, beginCell } from "@ton/ton";
import { Link } from "@tanstack/react-router";
import { CONTRACT_ADDRESS } from "../config/consts";

export const CounterPage: React.FC = () => {
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();
  const [counter, setCounter] = useState<number | null>(null);
  const [version, setVersion] = useState<number | null>(null);
  const [status, setStatus] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  // Initialize TON client for reading contract data
  const tonClient = new TonClient({
    endpoint: "https://toncenter.com/api/v2/jsonRPC"
  });
  const contractAddress = Address.parse(CONTRACT_ADDRESS);

  const fetchContractData = async () => {
    console.log('[Counter Debug] Fetching contract data...');
    try {
      setIsLoading(true);

      console.log('[Counter Debug] Calling contract methods on address:', CONTRACT_ADDRESS);

      // Use TonClient to call contract get methods (matching TolkContracts wrapper)
      const counterResult = await tonClient.runMethod(contractAddress, "currentCounter");
      console.log('[Counter Debug] Counter result:', counterResult);

      const versionResult = await tonClient.runMethod(contractAddress, "initialId");
      console.log('[Counter Debug] Version result:', versionResult);

      const counterValue = Number(counterResult.stack.readNumber());
      const versionValue = Number(versionResult.stack.readNumber());

      console.log('[Counter Debug] Parsed values:', { counter: counterValue, version: versionValue });

      setCounter(counterValue);
      setVersion(versionValue);
      setStatus("Contract data loaded successfully");
    } catch (err) {
      console.error('[Counter Debug] Failed to fetch contract data:', err);
      const errorMessage = `Failed to fetch contract data: ${err instanceof Error ? err.message : 'Unknown error'}`;
      console.log('[Counter Debug] Error message:', errorMessage);
      setStatus(errorMessage);
    } finally {
      setIsLoading(false);
      console.log('[Counter Debug] Contract data fetch completed');
    }
  };

  useEffect(() => {
    fetchContractData();
    // Fetch every 10 seconds for auto-update
    const interval = setInterval(fetchContractData, 10000);
    return () => clearInterval(interval);
  }, []);

  // Helper function to encode Increment message payload
  const encodeIncrementMessage = (): string => {
    try {
      // Create a cell with OP_INCREASE opcode (matching TolkContracts wrapper)
      const body = beginCell()
        .storeUint(0x7e8764ef, 32) // OP_INCREASE opcode
        .storeUint(0, 64) // query_id
        .storeUint(1, 32) // increaseBy amount
        .endCell();

      const base64 = body.toBoc().toString('base64');

      console.log('[Counter Debug] Increment payload encoding:', {
        opcode: '0x7e8764ef',
        queryId: 0,
        increaseBy: 1,
        base64
      });

      return base64;
    } catch (error) {
      console.error('[Counter Debug] Payload encoding failed:', error);
      throw new Error(`Failed to encode payload: ${error}`);
    }
  };

  const onIncrementClick = async () => {
    console.log('[Counter Debug] onIncrementClick called');
    console.log('[Counter Debug] Wallet state:', {
      connected: !!wallet,
      address: wallet?.account?.address,
      chain: wallet?.account?.chain
    });

    if (!wallet) {
      const errorMsg = "Please connect your TON wallet first.";
      console.log('[Counter Debug] No wallet connected:', errorMsg);
      setStatus(errorMsg);
      return;
    }

    try {
      setIsLoading(true);
      setStatus("Preparing transaction...");
      console.log('[Counter Debug] Starting transaction preparation');

      // Encode the Increment message payload
      const payload = encodeIncrementMessage();
      console.log('[Counter Debug] Encoded payload:', payload);

      // Validate contract address
      try {
        Address.parse(CONTRACT_ADDRESS);
      } catch (addrError) {
        throw new Error(`Invalid contract address: ${CONTRACT_ADDRESS}`);
      }

      // Prepare transaction for TonConnect
      const gasAmount = toNano("0.05");
      const tx = {
        validUntil: Math.floor(Date.now() / 1000) + 600, // 10 minutes
        messages: [
          {
            address: CONTRACT_ADDRESS,
            amount: gasAmount.toString(), // 0.05 TON for gas
            payload: payload,
          },
        ],
      };

      console.log('[Counter Debug] Gas amount calculation:', {
        gasAmountTON: '0.05',
        gasAmountNano: gasAmount.toString(),
        contractAddress: CONTRACT_ADDRESS,
        payloadLength: payload.length
      });

      console.log('[Counter Debug] Transaction object:', JSON.stringify(tx, null, 2));
      console.log('[Counter Debug] TonConnect UI state:', {
        connected: tonConnectUI?.connected,
        account: tonConnectUI?.account,
        wallet: tonConnectUI?.wallet
      });

      setStatus("Sending transaction...");
      console.log('[Counter Debug] Calling tonConnectUI.sendTransaction...');

      if (!tonConnectUI) {
        throw new Error("TonConnect UI not initialized");
      }

      const result = await tonConnectUI.sendTransaction(tx);
      console.log('[Counter Debug] Transaction result:', result);

      setStatus("Transaction sent! Waiting for confirmation...");

      // Refresh contract data after a short delay
      setTimeout(() => {
        fetchContractData();
      }, 3000);

    } catch (e) {
      console.error('[Counter Debug] Transaction failed with error:', e);
      console.error('[Counter Debug] Error details:', {
        name: (e as Error).name,
        message: (e as Error).message,
        stack: (e as Error).stack,
        cause: (e as any).cause,
      });

      // Try to extract meaningful error message
      let errorMessage = "Transaction failed";
      if (e instanceof Error) {
        errorMessage = `Transaction failed: ${e.message}`;
      } else if (typeof e === 'string') {
        errorMessage = `Transaction failed: ${e}`;
      } else if (e && typeof e === 'object' && 'message' in e) {
        errorMessage = `Transaction failed: ${e.message}`;
      } else {
        errorMessage = `Transaction failed: ${String(e)}`;
      }

      // Check for specific error types
      if (errorMessage.includes('User rejected')) {
        errorMessage = "Transaction was cancelled by user";
      } else if (errorMessage.includes('insufficient')) {
        errorMessage = "Insufficient funds for transaction";
      } else if (errorMessage.includes('network')) {
        errorMessage = "Network error - please try again";
      }

      console.log('[Counter Debug] Setting error status:', errorMessage);
      setStatus(errorMessage);
    } finally {
      setIsLoading(false);
      console.log('[Counter Debug] Transaction attempt completed');
    }
  };

  return (
    <div className="min-h-screen bg-[#282c34] text-white p-4">
      <div className="max-w-md mx-auto">
        {/* Navigation */}
        <div className="mb-6">
          <Link
            to="/"
            className="text-blue-400 hover:text-blue-300 text-sm"
          >
            ← Back to Home
          </Link>
        </div>

        {/* Header */}
        <div className="bg-[#3a3f47] rounded-lg p-6 mb-6">
          <h1 className="text-2xl font-bold mb-4">Counter Contract (Tolk)</h1>
          <p className="text-sm text-gray-300 mb-4">
            A simple counter smart contract written in Tolk language
          </p>
          <TonConnectButton />
        </div>

        {/* Contract Info */}
        <div className="bg-[#3a3f47] rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Contract Information</h2>
          <div className="space-y-2">
            <div>
              <span className="text-gray-400">Connected Wallet:</span>
              <p className="font-mono text-sm break-all">
                {wallet?.account.address || "None"}
              </p>
            </div>
            <div>
              <span className="text-gray-400">Contract Address:</span>
              <p className="font-mono text-sm break-all">{CONTRACT_ADDRESS}</p>
            </div>
            <div>
              <span className="text-gray-400">Contract Version:</span>
              <p className="text-xl font-bold">{version !== null ? version : "Loading..."}</p>
            </div>
            <div>
              <span className="text-gray-400">Current Counter:</span>
              <p className="text-4xl font-bold text-blue-400 my-4">
                {counter !== null ? counter : "Loading..."}
              </p>
            </div>
          </div>

          <button
            onClick={fetchContractData}
            disabled={isLoading}
            className="mt-4 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold py-2 px-4 rounded transition-colors"
          >
            {isLoading ? "Loading..." : "Refresh Data"}
          </button>
        </div>

        {/* Increment Transaction */}
        <div className="bg-[#3a3f47] rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Increment Counter</h2>
          <p className="text-sm text-gray-400 mb-4">
            Click the button below to increment the counter by 1. This will send a transaction to the blockchain.
          </p>
          <button
            onClick={onIncrementClick}
            disabled={!wallet || isLoading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-semibold py-3 px-4 rounded transition-colors"
          >
            {isLoading ? "Processing..." : "Increment Counter (+1)"}
          </button>
          <p className="text-xs text-gray-500 mt-2">
            Gas fee: ~0.05 TON
          </p>
        </div>

        {/* Status */}
        {status && (
          <div className="bg-[#3a3f47] rounded-lg p-4">
            <h3 className="text-sm font-semibold mb-2">Status:</h3>
            <p className="text-sm text-gray-300">{status}</p>
          </div>
        )}
      </div>
    </div>
  );
};
