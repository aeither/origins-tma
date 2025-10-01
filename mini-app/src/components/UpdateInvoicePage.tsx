import React, { useState } from "react";
import {
  TonConnectButton,
  useTonConnectUI,
  useTonWallet,
} from "@tonconnect/ui-react";
import { toNano, beginCell } from "@ton/ton";
import { Link } from "@tanstack/react-router";
import { CONTRACT_ADDRESS } from "../config/consts";

// TestInvoice contract opcodes
const Opcodes = {
  updateInvoice: 0x2,
};

export const UpdateInvoicePage: React.FC = () => {
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();
  const [invoiceId, setInvoiceId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<string>("");

  const handleUpdateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!wallet) {
      setStatus("❌ Please connect your wallet first!");
      return;
    }

    if (!invoiceId || invoiceId.trim() === "") {
      setStatus("❌ Please enter an invoice ID");
      return;
    }

    const invoiceIdNum = parseInt(invoiceId);
    if (isNaN(invoiceIdNum) || invoiceIdNum < 0) {
      setStatus("❌ Please enter a valid invoice ID (positive number)");
      return;
    }

    setIsLoading(true);
    setStatus("📤 Preparing transaction...");

    try {
      // Build the message body
      const body = beginCell()
        .storeUint(Opcodes.updateInvoice, 32) // op code for updateInvoice
        .storeUint(0, 64) // query id
        .storeUint(invoiceIdNum, 32) // invoice ID
        .endCell();

      const message = {
        address: CONTRACT_ADDRESS,
        amount: toNano("0.05").toString(),
        payload: body.toBoc().toString("base64"),
      };

      setStatus("⏳ Waiting for wallet approval...");

      await tonConnectUI.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 300, // 5 minutes
        messages: [message],
      });

      setStatus("✅ Invoice update request sent successfully! Transaction will be processed in a few seconds.");
      setInvoiceId(""); // Clear the form
      
      console.log(`[Update Invoice] Sent update request for invoice #${invoiceIdNum}`);
    } catch (error) {
      console.error("Error sending transaction:", error);
      setStatus(`❌ Error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#282c34] text-white p-4">
      <div className="max-w-md mx-auto">
        {/* Navigation */}
        <div className="mb-6">
          <Link
            to="/counter"
            className="text-blue-400 hover:text-blue-300 text-sm"
          >
            ← Back to Invoice Contract
          </Link>
        </div>

        {/* Header */}
        <div className="bg-[#3a3f47] rounded-lg p-6 mb-6">
          <h1 className="text-2xl font-bold mb-2">Update Invoice</h1>
          <p className="text-gray-400 text-sm">
            Mark an invoice as paid by entering its ID
          </p>
        </div>

        {/* Wallet Connection */}
        <div className="bg-[#3a3f47] rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3">Wallet Connection</h2>
          <TonConnectButton />
          {wallet && (
            <div className="mt-3 text-sm text-green-400">
              ✓ Connected: {wallet.account.address.slice(0, 8)}...{wallet.account.address.slice(-6)}
            </div>
          )}
        </div>

        {/* Update Invoice Form */}
        <div className="bg-[#3a3f47] rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Mark Invoice as Paid</h2>
          
          <form onSubmit={handleUpdateInvoice}>
            <div className="mb-4">
              <label htmlFor="invoiceId" className="block text-sm font-medium mb-2">
                Invoice ID
              </label>
              <input
                id="invoiceId"
                type="number"
                min="0"
                step="1"
                value={invoiceId}
                onChange={(e) => setInvoiceId(e.target.value)}
                placeholder="Enter invoice ID (e.g., 0, 1, 2...)"
                className="w-full px-4 py-2 bg-[#282c34] border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-white"
                disabled={isLoading}
              />
              <p className="mt-1 text-xs text-gray-400">
                Enter the ID of the invoice you want to mark as paid
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading || !wallet}
              className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                isLoading || !wallet
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-yellow-600 hover:bg-yellow-700"
              }`}
            >
              {isLoading ? "Processing..." : "Mark as Paid"}
            </button>
          </form>
        </div>

        {/* Status Message */}
        {status && (
          <div className="bg-[#3a3f47] rounded-lg p-4 mb-6">
            <h3 className="text-sm font-semibold mb-2">Status</h3>
            <p className="text-sm whitespace-pre-wrap break-words">{status}</p>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-[#3a3f47] rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-3">How to Use</h2>
          <ol className="space-y-2 text-sm text-gray-300">
            <li className="flex">
              <span className="font-bold mr-2">1.</span>
              <span>Connect your wallet using the button above</span>
            </li>
            <li className="flex">
              <span className="font-bold mr-2">2.</span>
              <span>Enter the invoice ID you want to mark as paid (you can find invoice IDs on the Invoice Contract page)</span>
            </li>
            <li className="flex">
              <span className="font-bold mr-2">3.</span>
              <span>Click "Mark as Paid" and approve the transaction in your wallet</span>
            </li>
            <li className="flex">
              <span className="font-bold mr-2">4.</span>
              <span>Wait a few seconds for the transaction to be processed on the blockchain</span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
};
