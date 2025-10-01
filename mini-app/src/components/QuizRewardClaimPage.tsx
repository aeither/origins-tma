import React, { useState, useEffect } from "react";
import {
  TonConnectButton,
  useTonConnectUI,
  useTonWallet,
} from "@tonconnect/ui-react";
import { TonClient, Address, toNano } from "@ton/ton";
import { Link } from "@tanstack/react-router";
import { getQuizById } from "../data/quizzes";
import type { Quiz, UserQuizProgress } from "../types/quiz";

// TODO: Replace with actual deployed reward contract address
const REWARD_CONTRACT_ADDRESS = "EQBvW8Z5huBkMJYdnfAEM5JqTNkuWX3diqYENkWsIL0XggGG";

interface QuizRewardClaimPageProps {
  quizId: string;
}

export const QuizRewardClaimPage: React.FC<QuizRewardClaimPageProps> = ({ quizId }) => {
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [userProgress, setUserProgress] = useState<UserQuizProgress | null>(null);
  const [contractBalance, setContractBalance] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [canClaim, setCanClaim] = useState(false);

  // Initialize TON client for reading contract data
  const tonClient = new TonClient({ 
    endpoint: "https://toncenter.com/api/v2/jsonRPC"
  });
  const contractAddress = Address.parse(REWARD_CONTRACT_ADDRESS);

  useEffect(() => {
    const foundQuiz = getQuizById(quizId);
    if (foundQuiz) {
      setQuiz(foundQuiz);
      loadUserProgress(foundQuiz.id);
    }
  }, [quizId]);

  useEffect(() => {
    if (quiz && userProgress) {
      // User can claim if they completed the quiz perfectly and haven't claimed yet
      setCanClaim(userProgress.completed && userProgress.bestScore === quiz.questions.length && !userProgress.rewardClaimed);
    }
  }, [quiz, userProgress]);

  const loadUserProgress = (quizId: string) => {
    const savedProgress = localStorage.getItem('quiz-progress');
    if (savedProgress) {
      try {
        const progress: Record<string, UserQuizProgress> = JSON.parse(savedProgress);
        setUserProgress(progress[quizId] || null);
      } catch (error) {
        console.error('Failed to load quiz progress:', error);
      }
    }
  };

  const fetchContractData = async () => {
    try {
      setIsLoading(true);
      
      // Get contract balance
      const balance = await tonClient.getBalance(contractAddress);
      setContractBalance((Number(balance) / 1000000000).toFixed(4)); // Convert from nanoton to TON
      
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
  }, []);

  // Helper function to encode ClaimReward message payload
  const encodeClaimRewardMessage = (): string => {
    try {
      // ClaimReward opcode: 2151883269 (0x80432205)
      const buffer = new ArrayBuffer(4); // 4 bytes for opcode
      const view = new DataView(buffer);
      
      // Write opcode (big endian)
      view.setUint32(0, 2151883269, false);
      
      // Convert to base64
      const uint8Array = new Uint8Array(buffer);
      const base64 = btoa(String.fromCharCode(...uint8Array));
      
      console.log('[Quiz Reward Debug] Payload encoding:', {
        opcode: 2151883269,
        opcodeHex: '0x80432205',
        bufferLength: buffer.byteLength,
        uint8Array: Array.from(uint8Array),
        base64
      });
      
      return base64;
    } catch (error) {
      console.error('[Quiz Reward Debug] Payload encoding failed:', error);
      throw new Error(`Failed to encode payload: ${error}`);
    }
  };

  const onClaimRewardClick = async () => {
    console.log('[Quiz Reward Debug] onClaimRewardClick called');
    console.log('[Quiz Reward Debug] Wallet state:', {
      connected: !!wallet,
      address: wallet?.account?.address,
      chain: wallet?.account?.chain
    });
    
    if (!wallet) {
      const errorMsg = "Please connect your TON wallet first.";
      console.log('[Quiz Reward Debug] No wallet connected:', errorMsg);
      setStatus(errorMsg);
      return;
    }

    if (!canClaim) {
      const errorMsg = "You are not eligible to claim this reward.";
      console.log('[Quiz Reward Debug] Cannot claim:', errorMsg);
      setStatus(errorMsg);
      return;
    }

    try {
      setIsLoading(true);
      setStatus("Preparing claim reward transaction...");
      console.log('[Quiz Reward Debug] Starting transaction preparation');

      // Validate contract address
      try {
        Address.parse(REWARD_CONTRACT_ADDRESS);
      } catch (addrError) {
        throw new Error(`Invalid contract address: ${REWARD_CONTRACT_ADDRESS}`);
      }

      // Create ClaimReward message payload
      const payload = encodeClaimRewardMessage();
      console.log('[Quiz Reward Debug] Encoded payload:', payload);

      // Prepare transaction for TonConnect
      const gasAmount = toNano("0.05");
      const tx = {
        validUntil: Math.floor(Date.now() / 1000) + 600, // 10 minutes
        messages: [
          {
            address: REWARD_CONTRACT_ADDRESS,
            amount: gasAmount.toString(), // Small amount for gas
            payload: payload,
          },
        ],
      };
      
      console.log('[Quiz Reward Debug] Gas amount calculation:', {
        gasAmountTON: '0.05',
        gasAmountNano: gasAmount.toString(),
        contractAddress: REWARD_CONTRACT_ADDRESS,
        payloadLength: payload.length
      });
      
      console.log('[Quiz Reward Debug] Transaction object:', JSON.stringify(tx, null, 2));
      console.log('[Quiz Reward Debug] TonConnect UI state:', {
        connected: tonConnectUI?.connected,
        account: tonConnectUI?.account,
        wallet: tonConnectUI?.wallet
      });

      setStatus("Sending claim reward transaction...");
      console.log('[Quiz Reward Debug] Calling tonConnectUI.sendTransaction...');
      
      if (!tonConnectUI) {
        throw new Error("TonConnect UI not initialized");
      }
      
      const result = await tonConnectUI.sendTransaction(tx);
      console.log('[Quiz Reward Debug] Transaction result:', result);
      
      setStatus("Claim reward transaction sent! Waiting for confirmation...");
      
      // Update user progress to mark reward as claimed
      if (userProgress && quiz) {
        const savedProgress = localStorage.getItem('quiz-progress');
        const progress: Record<string, UserQuizProgress> = savedProgress ? JSON.parse(savedProgress) : {};
        
        progress[quiz.id] = {
          ...userProgress,
          rewardClaimed: true
        };
        
        localStorage.setItem('quiz-progress', JSON.stringify(progress));
        setUserProgress(progress[quiz.id]);
        setCanClaim(false);
      }
      
      // Refresh contract data after a short delay
      setTimeout(() => {
        fetchContractData();
      }, 3000);
      
    } catch (e) {
      console.error('[Quiz Reward Debug] Transaction failed with error:', e);
      console.error('[Quiz Reward Debug] Error details:', {
        name: (e as Error).name,
        message: (e as Error).message,
        stack: (e as Error).stack,
        cause: (e as any).cause,
        toString: e?.toString(),
        valueOf: e?.valueOf?.()
      });
      
      // Check if it's a TonConnect specific error
      if (e && typeof e === 'object') {
        console.error('[Quiz Reward Debug] Error object keys:', Object.keys(e));
        console.error('[Quiz Reward Debug] Full error object:', JSON.stringify(e, null, 2));
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
      
      console.log('[Quiz Reward Debug] Setting error status:', errorMessage);
      setStatus(errorMessage);
    } finally {
      setIsLoading(false);
      console.log('[Quiz Reward Debug] Transaction attempt completed');
    }
  };

  if (!quiz) {
    return (
      <div className="min-h-screen bg-[#282c34] text-white p-4">
        <div className="max-w-2xl mx-auto text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Quiz Not Found</h1>
          <Link to="/" className="text-blue-400 hover:text-blue-300">
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#58cc02] to-[#37a500] text-white p-4">
      <div className="max-w-md mx-auto">
        {/* Navigation */}
        <div className="mb-6">
          <Link 
            to="/" 
            className="text-white/80 hover:text-white text-sm flex items-center gap-2"
          >
            ← Back to Home
          </Link>
        </div>

        {/* Header */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 mb-6 shadow-xl border border-white/50">
          <div className="text-center">
            <div className="text-4xl mb-2">{quiz.icon}</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Claim Quiz Reward</h1>
            <h2 className="text-lg text-gray-600">{quiz.title}</h2>
          </div>
          <div className="mt-4">
            <TonConnectButton />
          </div>
        </div>

        {/* Quiz Performance */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 mb-6 shadow-xl border border-white/50">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Your Performance</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Score:</span>
              <span className="font-semibold text-gray-800">
                {userProgress?.bestScore || 0}/{quiz.questions.length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Percentage:</span>
              <span className="font-semibold text-gray-800">
                {userProgress ? Math.round((userProgress.bestScore / quiz.questions.length) * 100) : 0}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Attempts:</span>
              <span className="font-semibold text-gray-800">{userProgress?.attempts || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className={`font-semibold ${userProgress?.completed ? 'text-green-600' : 'text-red-600'}`}>
                {userProgress?.completed ? 'Completed' : 'Not Completed'}
              </span>
            </div>
          </div>
        </div>

        {/* Reward Information */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 mb-6 shadow-xl border border-white/50">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Reward Details</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Reward Amount:</span>
              <span className="font-semibold text-purple-600">{quiz.rewardAmount} TON</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Contract Balance:</span>
              <span className="font-semibold text-gray-800">{contractBalance || "Loading..."} TON</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Reward Status:</span>
              <span className={`font-semibold ${userProgress?.rewardClaimed ? 'text-green-600' : 'text-yellow-600'}`}>
                {userProgress?.rewardClaimed ? '✓ Claimed' : 'Available'}
              </span>
            </div>
          </div>
        </div>

        {/* Contract Info */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 mb-6 shadow-xl border border-white/50">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Contract Information</h2>
          <div className="space-y-2">
            <div>
              <span className="text-gray-600">Connected Wallet:</span>
              <p className="font-mono text-sm break-all text-gray-800">
                {wallet?.account.address || "None"}
              </p>
            </div>
            <div>
              <span className="text-gray-600">Reward Contract:</span>
              <div className="flex items-center gap-2">
                <p className="font-mono text-sm break-all flex-1 text-gray-800">{REWARD_CONTRACT_ADDRESS}</p>
                <a
                  href={`https://tonscan.org/address/${REWARD_CONTRACT_ADDRESS}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 text-sm bg-blue-100 px-2 py-1 rounded"
                >
                  Explorer
                </a>
              </div>
            </div>
          </div>
          
          <button
            onClick={fetchContractData}
            disabled={isLoading}
            className="mt-4 w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100"
          >
            {isLoading ? "Loading..." : "🔄 Refresh Data"}
          </button>
        </div>

        {/* Claim Reward */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 mb-6 shadow-xl border border-white/50">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Claim Your Reward</h2>
          
          {!wallet && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
              <p className="text-yellow-700 text-sm">
                💡 Please connect your wallet to claim rewards.
              </p>
            </div>
          )}

          {!canClaim && wallet && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
              <p className="text-red-700 text-sm">
                {userProgress?.rewardClaimed 
                  ? "✅ You have already claimed the reward for this quiz."
                  : !userProgress?.completed 
                    ? "📝 Complete the quiz with a perfect score to claim the reward."
                    : userProgress?.bestScore !== quiz.questions.length
                      ? "🎯 You need a perfect score to claim the reward."
                      : "❌ You are not eligible to claim this reward."
                }
              </p>
            </div>
          )}

          {canClaim && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
              <p className="text-green-700 text-sm">
                🎊 Congratulations! You can claim {quiz.rewardAmount} TON for completing this quiz perfectly!
              </p>
            </div>
          )}

          <button
            onClick={onClaimRewardClick}
            disabled={!wallet || isLoading || !canClaim}
            className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 disabled:text-gray-500 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100 shadow-lg"
          >
            {isLoading ? "⏳ Processing..." : `💰 Claim ${quiz.rewardAmount} TON Reward`}
          </button>
        </div>

        {/* Status */}
        {status && (
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-white/50">
            <h3 className="text-sm font-semibold text-gray-800 mb-2">Status:</h3>
            <p className="text-sm text-gray-600">{status}</p>
          </div>
        )}
      </div>
    </div>
  );
};