import React, { useState, useEffect } from "react";
import {
  TonConnectButton,
  useTonConnectUI,
  useTonWallet,
} from "@tonconnect/ui-react";
import { TonClient, Address, toNano } from "@ton/ton";
import { Link } from "@tanstack/react-router";

// TODO: Replace with actual deployed contract address
const CONTRACT_ADDRESS = "EQBvW8Z5huBkMJYdnfAEM5JqTNkuWX3diqYENkWsIL0XggGG"; // Placeholder

export const RewardContractPage: React.FC = () => {
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();
  const [contractBalance, setContractBalance] = useState<string | null>(null);
  const [rewardAmount, setRewardAmount] = useState<string | null>(null);
  const [ownerAddress, setOwnerAddress] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState("0.1");
  const [status, setStatus] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  // Initialize TON client for reading contract data
  const tonClient = new TonClient({ 
    endpoint: "https://toncenter.com/api/v2/jsonRPC"
  });
  const contractAddress = Address.parse(CONTRACT_ADDRESS);

  const fetchContractData = async () => {
    try {
      setIsLoading(true);
      
      // Get contract balance
      const balance = await tonClient.getBalance(contractAddress);
      setContractBalance((Number(balance) / 1000000000).toFixed(4)); // Convert from nanoton to TON
      
      // Get contract owner
      const ownerResult = await tonClient.runMethod(contractAddress, "getOwner");
      const ownerAddr = ownerResult.stack.readAddress();
      setOwnerAddress(ownerAddr.toString());
      
      // Get reward amount
      const rewardResult = await tonClient.runMethod(contractAddress, "getRewardAmount");
      const reward = rewardResult.stack.readNumber();
      setRewardAmount((Number(reward) / 1000000000).toFixed(4)); // Convert from nanoton to TON
      
      setStatus("Contract data loaded successfully");
    } catch (err) {
      console.error("Failed to fetch contract data:", err);
      setStatus(`Failed to fetch contract data: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContractData();
    // Fetch every 10 seconds for auto-update
    const interval = setInterval(fetchContractData, 10000);
    return () => clearInterval(interval);
  }, []);

  // Helper function to encode ClaimReward message payload
  const encodeClaimRewardMessage = (): string => {
    // ClaimReward opcode: 2151883269 (0x80432205)
    const buffer = new ArrayBuffer(4); // 4 bytes for opcode
    const view = new DataView(buffer);
    
    // Write opcode (big endian)
    view.setUint32(0, 2151883269, false);
    
    // Convert to base64
    const uint8Array = new Uint8Array(buffer);
    const base64 = btoa(String.fromCharCode(...uint8Array));
    
    return base64;
  };

  // Helper function to encode WithdrawAll message payload
  const encodeWithdrawAllMessage = (): string => {
    // WithdrawAll opcode: 3707874860 (0xdd01ae2c)
    const buffer = new ArrayBuffer(4); // 4 bytes for opcode
    const view = new DataView(buffer);
    
    // Write opcode (big endian)
    view.setUint32(0, 3707874860, false);
    
    // Convert to base64
    const uint8Array = new Uint8Array(buffer);
    const base64 = btoa(String.fromCharCode(...uint8Array));
    
    return base64;
  };

  const onDepositClick = async () => {
    if (!wallet) {
      setStatus("Please connect your TON wallet first.");
      return;
    }

    const amount = parseFloat(depositAmount);
    if (amount <= 0) {
      setStatus("Please enter a valid amount greater than 0");
      return;
    }

    try {
      setIsLoading(true);
      setStatus("Preparing deposit transaction...");

      // Simple deposit transaction - just send TON to contract
      const tx = {
        validUntil: Math.floor(Date.now() / 1000) + 600, // 10 minutes
        messages: [
          {
            address: CONTRACT_ADDRESS,
            amount: toNano(depositAmount).toString(),
            payload: "", // Empty payload for deposit
          },
        ],
      };

      setStatus("Sending deposit transaction...");
      await tonConnectUI.sendTransaction(tx);
      setStatus("Deposit transaction sent! Waiting for confirmation...");
      
      // Refresh contract data after a short delay
      setTimeout(() => {
        fetchContractData();
      }, 3000);
      
    } catch (e) {
      console.error("Deposit failed:", e);
      setStatus("Deposit failed: " + (e as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const onClaimRewardClick = async () => {
    if (!wallet) {
      setStatus("Please connect your TON wallet first.");
      return;
    }

    try {
      setIsLoading(true);
      setStatus("Preparing claim reward transaction...");

      // Create ClaimReward message payload
      // ClaimReward opcode: 2151883269 (0x80432205)
      const payload = encodeClaimRewardMessage();

      const tx = {
        validUntil: Math.floor(Date.now() / 1000) + 600, // 10 minutes
        messages: [
          {
            address: CONTRACT_ADDRESS,
            amount: toNano("0.05").toString(), // Small amount for gas
            payload: payload,
          },
        ],
      };

      setStatus("Sending claim reward transaction...");
      await tonConnectUI.sendTransaction(tx);
      setStatus("Claim reward transaction sent! Waiting for confirmation...");
      
      // Refresh contract data after a short delay
      setTimeout(() => {
        fetchContractData();
      }, 3000);
      
    } catch (e) {
      console.error("Claim reward failed:", e);
      setStatus("Claim reward failed: " + (e as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const onWithdrawAllClick = async () => {
    if (!wallet) {
      setStatus("Please connect your TON wallet first.");
      return;
    }

    if (wallet.account.address !== ownerAddress) {
      setStatus("Only the contract owner can withdraw all funds.");
      return;
    }

    try {
      setIsLoading(true);
      setStatus("Preparing withdraw all transaction...");

      // Create WithdrawAll message payload
      // WithdrawAll opcode: 3707874860 (0xdd01ae2c)
      const payload = encodeWithdrawAllMessage();

      const tx = {
        validUntil: Math.floor(Date.now() / 1000) + 600, // 10 minutes
        messages: [
          {
            address: CONTRACT_ADDRESS,
            amount: toNano("0.05").toString(), // Small amount for gas
            payload: payload,
          },
        ],
      };

      setStatus("Sending withdraw all transaction...");
      await tonConnectUI.sendTransaction(tx);
      setStatus("Withdraw all transaction sent! Waiting for confirmation...");
      
      // Refresh contract data after a short delay
      setTimeout(() => {
        fetchContractData();
      }, 3000);
      
    } catch (e) {
      console.error("Withdraw all failed:", e);
      setStatus("Withdraw all failed: " + (e as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const isOwner = wallet && ownerAddress && wallet.account.address === ownerAddress;

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
          <h1 className="text-2xl font-bold mb-4">Reward Contract</h1>
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
              <div className="flex items-center gap-2">
                <p className="font-mono text-sm break-all flex-1">{CONTRACT_ADDRESS}</p>
                <a
                  href={`https://tonscan.org/address/${CONTRACT_ADDRESS}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 text-sm bg-blue-600/20 px-2 py-1 rounded"
                >
                  Explorer
                </a>
              </div>
            </div>
            <div>
              <span className="text-gray-400">Contract Balance:</span>
              <p className="text-xl font-bold">{contractBalance !== null ? `${contractBalance} TON` : "Loading..."}</p>
            </div>
            <div>
              <span className="text-gray-400">Reward Amount:</span>
              <p className="text-lg font-bold">{rewardAmount !== null ? `${rewardAmount} TON` : "Loading..."}</p>
            </div>
            <div>
              <span className="text-gray-400">Owner:</span>
              <p className="font-mono text-sm break-all">{ownerAddress || "Loading..."}</p>
              {isOwner && (
                <p className="text-green-400 text-sm">You are the owner</p>
              )}
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

        {/* Deposit TON */}
        <div className="bg-[#3a3f47] rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Deposit TON</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onDepositClick();
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Amount (TON):
              </label>
              <input
                type="number"
                step="0.01"
                value={depositAmount}
                min="0.01"
                onChange={(e) => setDepositAmount(e.target.value)}
                className="w-full bg-[#2a2d34] border border-gray-600 rounded px-3 py-2 text-white"
                placeholder="0.1"
              />
            </div>
            <button
              type="submit"
              disabled={!wallet || isLoading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-semibold py-2 px-4 rounded transition-colors"
            >
              {isLoading ? "Processing..." : "Deposit TON"}
            </button>
          </form>
        </div>

        {/* Claim Reward */}
        <div className="bg-[#3a3f47] rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Claim Reward</h2>
          <p className="text-gray-300 text-sm mb-4">
            Click to claim your reward of {rewardAmount || "0.01"} TON
          </p>
          <button
            onClick={onClaimRewardClick}
            disabled={!wallet || isLoading}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-semibold py-2 px-4 rounded transition-colors"
          >
            {isLoading ? "Processing..." : "Claim Reward"}
          </button>
        </div>

        {/* Withdraw All (Owner Only) */}
        {isOwner && (
          <div className="bg-[#3a3f47] rounded-lg p-6 mb-6 border-2 border-red-500/50">
            <h2 className="text-lg font-semibold mb-4">Owner Actions</h2>
            <p className="text-gray-300 text-sm mb-4">
              As the owner, you can withdraw all TON from the contract
            </p>
            <button
              onClick={onWithdrawAllClick}
              disabled={!wallet || isLoading}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white font-semibold py-2 px-4 rounded transition-colors"
            >
              {isLoading ? "Processing..." : "Withdraw All TON"}
            </button>
          </div>
        )}

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