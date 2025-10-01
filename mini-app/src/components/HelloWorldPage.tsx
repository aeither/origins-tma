import React, { useState, useEffect } from "react";
import {
  TonConnectButton,
  useTonConnectUI,
  useTonWallet,
} from "@tonconnect/ui-react";
import { TonClient, Address, toNano } from "@ton/ton";
import { Link } from "@tanstack/react-router";

const CONTRACT_ADDRESS = "EQDmj9bqTleRjqQ2PpuLEwhFzNJPL2_4SxPQF2l3AkAwGEtn";

export const HelloWorldPage: React.FC = () => {
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();
  const [counter, setCounter] = useState<number | null>(null);
  const [id, setId] = useState<number | null>(null);
  const [addAmount, setAddAmount] = useState(1);
  const [status, setStatus] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  // Initialize TON client for reading contract data
  const tonClient = new TonClient({ 
    endpoint: "https://toncenter.com/api/v2/jsonRPC"
  });
  const contractAddress = Address.parse(CONTRACT_ADDRESS);

  const fetchContractData = async () => {
    console.log('[HelloWorld Debug] Fetching contract data...');
    try {
      setIsLoading(true);
      
      console.log('[HelloWorld Debug] Calling contract methods on address:', CONTRACT_ADDRESS);
      
      // Use TonClient to call contract get methods
      const counterResult = await tonClient.runMethod(contractAddress, "counter");
      console.log('[HelloWorld Debug] Counter result:', counterResult);
      
      const idResult = await tonClient.runMethod(contractAddress, "id");
      console.log('[HelloWorld Debug] ID result:', idResult);
      
      const counterValue = Number(counterResult.stack.readNumber());
      const idValue = Number(idResult.stack.readNumber());
      
      console.log('[HelloWorld Debug] Parsed values:', { counter: counterValue, id: idValue });
      
      setCounter(counterValue);
      setId(idValue);
      setStatus("Contract data loaded successfully");
    } catch (err) {
      console.error('[HelloWorld Debug] Failed to fetch contract data:', err);
      const errorMessage = `Failed to fetch contract data: ${err instanceof Error ? err.message : 'Unknown error'}`;
      console.log('[HelloWorld Debug] Error message:', errorMessage);
      setStatus(errorMessage);
    } finally {
      setIsLoading(false);
      console.log('[HelloWorld Debug] Contract data fetch completed');
    }
  };

  useEffect(() => {
    fetchContractData();
    // Fetch every 10 seconds for auto-update
    const interval = setInterval(fetchContractData, 10000);
    return () => clearInterval(interval);
  }, []);

  // Helper function to encode Add message payload
  const encodeAddMessage = (amount: number): string => {
    try {
      // Create a simple payload for Add message
      // Add message opcode: 2278832834 (0x87ea83e2)
      const buffer = new ArrayBuffer(8); // 4 bytes for opcode + 4 bytes for amount
      const view = new DataView(buffer);
      
      // Write opcode (big endian)
      view.setUint32(0, 2278832834, false);
      // Write amount (big endian)  
      view.setUint32(4, amount, false);
      
      // Convert to base64
      const uint8Array = new Uint8Array(buffer);
      const base64 = btoa(String.fromCharCode(...uint8Array));
      
      console.log('[HelloWorld Debug] Payload encoding:', {
        amount,
        opcode: 2278832834,
        opcodeHex: '0x87ea83e2',
        bufferLength: buffer.byteLength,
        uint8Array: Array.from(uint8Array),
        base64
      });
      
      return base64;
    } catch (error) {
      console.error('[HelloWorld Debug] Payload encoding failed:', error);
      throw new Error(`Failed to encode payload: ${error}`);
    }
  };

  const onAddClick = async () => {
    console.log('[HelloWorld Debug] onAddClick called');
    console.log('[HelloWorld Debug] Wallet state:', {
      connected: !!wallet,
      address: wallet?.account?.address,
      chain: wallet?.account?.chain
    });
    
    if (!wallet) {
      const errorMsg = "Please connect your TON wallet first.";
      console.log('[HelloWorld Debug] No wallet connected:', errorMsg);
      setStatus(errorMsg);
      return;
    }

    if (addAmount <= 0 || addAmount > 0xffffffff) {
      const errorMsg = "Please enter a valid amount (1 to 4294967295)";
      console.log('[HelloWorld Debug] Invalid amount:', { addAmount, errorMsg });
      setStatus(errorMsg);
      return;
    }

    try {
      setIsLoading(true);
      setStatus("Preparing transaction...");
      console.log('[HelloWorld Debug] Starting transaction preparation');

      // Encode the Add message payload
      const payload = encodeAddMessage(addAmount);
      console.log('[HelloWorld Debug] Encoded payload:', payload);

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
      
      console.log('[HelloWorld Debug] Gas amount calculation:', {
        gasAmountTON: '0.05',
        gasAmountNano: gasAmount.toString(),
        contractAddress: CONTRACT_ADDRESS,
        payloadLength: payload.length
      });
      
      console.log('[HelloWorld Debug] Transaction object:', JSON.stringify(tx, null, 2));
      console.log('[HelloWorld Debug] TonConnect UI state:', {
        connected: tonConnectUI?.connected,
        account: tonConnectUI?.account,
        wallet: tonConnectUI?.wallet
      });

      setStatus("Sending transaction...");
      console.log('[HelloWorld Debug] Calling tonConnectUI.sendTransaction...');
      
      if (!tonConnectUI) {
        throw new Error("TonConnect UI not initialized");
      }
      
      const result = await tonConnectUI.sendTransaction(tx);
      console.log('[HelloWorld Debug] Transaction result:', result);
      
      setStatus("Transaction sent! Waiting for confirmation...");
      
      // Refresh contract data after a short delay
      setTimeout(() => {
        fetchContractData();
      }, 3000);
      
    } catch (e) {
      console.error('[HelloWorld Debug] Transaction failed with error:', e);
      console.error('[HelloWorld Debug] Error details:', {
        name: (e as Error).name,
        message: (e as Error).message,
        stack: (e as Error).stack,
        cause: (e as any).cause,
        toString: e?.toString(),
        valueOf: e?.valueOf?.()
      });
      
      // Check if it's a TonConnect specific error
      if (e && typeof e === 'object') {
        console.error('[HelloWorld Debug] Error object keys:', Object.keys(e));
        console.error('[HelloWorld Debug] Full error object:', JSON.stringify(e, null, 2));
      }
      
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
      
      console.log('[HelloWorld Debug] Setting error status:', errorMessage);
      setStatus(errorMessage);
    } finally {
      setIsLoading(false);
      console.log('[HelloWorld Debug] Transaction attempt completed');
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
          <h1 className="text-2xl font-bold mb-4">HelloWorld Contract</h1>
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
              <span className="text-gray-400">Contract ID:</span>
              <p className="text-xl font-bold">{id !== null ? id : "Loading..."}</p>
            </div>
            <div>
              <span className="text-gray-400">Contract Counter:</span>
              <p className="text-xl font-bold">{counter !== null ? counter : "Loading..."}</p>
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

        {/* Add Transaction */}
        <div className="bg-[#3a3f47] rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Add to Counter</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onAddClick();
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Amount to Add:
              </label>
              <input
                type="number"
                value={addAmount}
                min={1}
                max={0xffffffff}
                onChange={(e) => setAddAmount(Number(e.target.value))}
                className="w-full bg-[#2a2d34] border border-gray-600 rounded px-3 py-2 text-white"
                placeholder="Enter amount"
              />
            </div>
            <button
              type="submit"
              disabled={!wallet || isLoading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-semibold py-2 px-4 rounded transition-colors"
            >
              {isLoading ? "Processing..." : "Send Add Transaction"}
            </button>
          </form>
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