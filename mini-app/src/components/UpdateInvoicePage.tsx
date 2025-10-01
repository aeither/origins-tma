import React, { useState } from "react";
import {
  useTonConnectUI,
  useTonWallet,
} from "@tonconnect/ui-react";
import { toNano, beginCell, TonClient, Address } from "@ton/ton";
import { Link } from "@tanstack/react-router";
import { CONTRACT_ADDRESS, NETWORK, TON_CENTER_ENDPOINTS } from "../config/consts";

// TestInvoice contract opcodes
const Opcodes = {
  updateInvoice: 0x2,
};

interface Invoice {
  invoiceId: number;
  description: bigint;
  amount: bigint;
  wallet: Address;
  paid: boolean;
}

export const UpdateInvoicePage: React.FC = () => {
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();
  const [invoiceId, setInvoiceId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [invoice, setInvoice] = useState<Invoice | null>(null);

  const handleFetchInvoice = async () => {
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
    setStatus("🔍 Fetching invoice details...");
    setInvoice(null);

    try {
      const tonClient = new TonClient({
        endpoint: TON_CENTER_ENDPOINTS[NETWORK],
      });

      const contractAddress = Address.parse(CONTRACT_ADDRESS);
      const result = await tonClient.runMethod(contractAddress, "get_invoice", [
        { type: "int", value: BigInt(invoiceIdNum) }
      ]);

      if (result.stack.remaining >= 5) {
        const fetchedInvoice: Invoice = {
          invoiceId: Number(result.stack.readNumber()),
          description: result.stack.readBigNumber(),
          amount: result.stack.readBigNumber(),
          wallet: result.stack.readAddress(),
          paid: result.stack.readNumber() === 1
        };

        setInvoice(fetchedInvoice);
        setStatus(`✅ Invoice #${invoiceIdNum} found!`);
      } else {
        setStatus(`❌ Invoice #${invoiceIdNum} not found`);
      }
    } catch (error) {
      console.error("Error fetching invoice:", error);
      setStatus(`❌ Error fetching invoice: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!wallet) {
      setStatus("❌ Please connect your wallet first!");
      return;
    }

    if (!invoice) {
      setStatus("❌ Please fetch the invoice first by clicking 'Fetch Invoice Details'");
      return;
    }

    if (invoice.paid) {
      const proceed = window.confirm("⚠️ This invoice is already marked as paid. Do you still want to proceed?");
      if (!proceed) {
        return;
      }
    }

    // Calculate total: invoice amount + transaction fee
    const transactionFee = toNano("0.1");
    const totalAmount = invoice.amount + transactionFee;
    const invoiceAmountTON = Number(invoice.amount) / 1e9;
    const totalAmountTON = Number(totalAmount) / 1e9;

    const confirmMessage = `Confirm payment:\n\n` +
      `Invoice Amount: ${invoiceAmountTON} TON\n` +
      `Transaction Fee: 0.1 TON\n` +
      `Total: ${totalAmountTON} TON\n\n` +
      `Payment will be sent to:\n${invoice.wallet.toString()}`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    setIsLoading(true);
    setStatus("📤 Preparing transaction...");

    try {
      // Build the message body
      const body = beginCell()
        .storeUint(Opcodes.updateInvoice, 32) // op code for updateInvoice
        .storeUint(0, 64) // query id
        .storeUint(invoice.invoiceId, 32) // invoice ID
        .endCell();

      const message = {
        address: CONTRACT_ADDRESS,
        amount: totalAmount.toString(), // Invoice amount + transaction fee
        payload: body.toBoc().toString("base64"),
      };

      setStatus("⏳ Waiting for wallet approval...");

      await tonConnectUI.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 300, // 5 minutes
        messages: [message],
      });

      setStatus(`✅ Payment sent! ${invoiceAmountTON} TON has been transferred to ${invoice.wallet.toString().slice(0, 8)}...`);
      setInvoiceId(""); // Clear the form
      setInvoice(null); // Clear the invoice
      
      console.log(`[Update Invoice] Sent payment for invoice #${invoice.invoiceId}`);
    } catch (error) {
      console.error("Error sending transaction:", error);
      setStatus(`❌ Error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#002952] via-[#003c71] to-[#004a8f] text-white p-6">
      <div className="max-w-3xl mx-auto">
        {/* Navigation */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center text-[#20d9c5] hover:text-[#60e8d8] transition-colors font-medium"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
        </div>

        {/* Header */}
        <div className="glass-card rounded-2xl p-8 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="text-5xl">💼</div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-[#20d9c5] to-[#60e8d8] bg-clip-text text-transparent">
                Client Payment Portal
              </h1>
              <p className="text-gray-400 text-sm mt-1">Step 2: Pay your invoices</p>
            </div>
          </div>
          <p className="text-gray-300 text-lg">
            Enter the invoice ID you received from your freelancer to review and pay
          </p>
        </div>

        {/* Wallet Connection Status */}
        {wallet && (
          <div className="glass-card rounded-2xl p-6 mb-8">
            <div className="flex items-center text-[#20d9c5]">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="font-semibold">Wallet Connected: {wallet.account.address.slice(0, 8)}...{wallet.account.address.slice(-6)}</span>
            </div>
          </div>
        )}

        {/* Fetch Invoice Form */}
        <div className="glass-card rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Step 1: Fetch Invoice Details</h2>
          
          <div className="mb-6">
            <label htmlFor="invoiceId" className="block text-sm font-medium text-gray-300 mb-2">
              Invoice ID
            </label>
            <input
              id="invoiceId"
              type="number"
              min="0"
              step="1"
              value={invoiceId}
              onChange={(e) => {
                setInvoiceId(e.target.value);
                setInvoice(null); // Clear previous invoice when ID changes
              }}
              placeholder="Enter invoice ID (e.g., 0, 1, 2...)"
              className="w-full glass-input text-white px-4 py-3 rounded-xl transition-all"
              disabled={isLoading}
            />
            <p className="mt-2 text-xs text-gray-400">
              Enter the ID of the invoice you want to mark as paid
            </p>
          </div>

          <button
            onClick={handleFetchInvoice}
            disabled={isLoading || !invoiceId}
            className={`w-full py-4 px-6 rounded-xl font-semibold transition-all ${
              isLoading || !invoiceId
                ? "bg-white/10 cursor-not-allowed opacity-50"
                : "glass-button"
            }`}
          >
            {isLoading ? "Fetching..." : "Fetch Invoice Details"}
          </button>
        </div>

        {/* Invoice Details */}
        {invoice && (
          <div className="glass-card rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6">Invoice Details</h2>
            <div className="space-y-5">
              <div>
                <p className="text-xs text-gray-400 mb-1">Invoice ID</p>
                <p className="text-2xl font-bold text-[#20d9c5]">#{invoice.invoiceId}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Amount</p>
                <p className="text-4xl font-bold text-[#20d9c5]">
                  {Number(invoice.amount) / 1e9} TON
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Recipient Wallet</p>
                <p className="font-mono text-xs break-all text-gray-300 bg-white/5 p-3 rounded-lg">
                  {invoice.wallet.toString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Status</p>
                <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
                  invoice.paid ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}>
                  {invoice.paid ? '✓ PAID' : '○ UNPAID'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Payment Form */}
        {invoice && (
          <div className="glass-card rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6">Step 2: Send Payment</h2>
            
            <div className="glass-card rounded-xl p-6 mb-6">
              <h3 className="text-sm font-semibold mb-4 text-gray-300">Payment Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Invoice Amount:</span>
                  <span className="font-bold text-lg">{Number(invoice.amount) / 1e9} TON</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Transaction Fee:</span>
                  <span className="font-bold text-lg">0.1 TON</span>
                </div>
                <div className="border-t border-white/10 pt-3 flex justify-between items-center">
                  <span className="font-bold text-lg">Total:</span>
                  <span className="font-bold text-2xl text-[#20d9c5]">
                    {(Number(invoice.amount) / 1e9 + 0.1).toFixed(2)} TON
                  </span>
                </div>
              </div>
            </div>

            <form onSubmit={handleUpdateInvoice}>
              <button
                type="submit"
                disabled={isLoading || !wallet}
                className={`w-full py-4 px-6 rounded-xl font-semibold transition-all ${
                  isLoading || !wallet
                    ? "bg-white/10 cursor-not-allowed opacity-50"
                    : "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg hover:shadow-amber-500/30"
                }`}
              >
                {isLoading ? "Processing..." : "Mark as Paid & Send Payment"}
              </button>
            </form>
          </div>
        )}

        {/* Status Message */}
        {status && (
          <div className="glass-card rounded-2xl p-6 mb-8">
            <h3 className="text-sm font-semibold mb-2 text-[#20d9c5]">Status</h3>
            <p className="text-sm whitespace-pre-wrap break-words text-gray-300">{status}</p>
          </div>
        )}

        {/* Instructions */}
        <div className="glass-card rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-6">How to Use</h2>
          <ol className="space-y-4 text-gray-300">
            <li className="flex items-start">
              <span className="flex-shrink-0 w-8 h-8 bg-[#20d9c5] rounded-full flex items-center justify-center font-bold text-white mr-4">1</span>
              <span className="pt-1">Connect your wallet using the button above</span>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 w-8 h-8 bg-[#20d9c5] rounded-full flex items-center justify-center font-bold text-white mr-4">2</span>
              <span className="pt-1">Enter the invoice ID shared by your freelancer (e.g., #0, #1, #2, etc.)</span>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 w-8 h-8 bg-[#20d9c5] rounded-full flex items-center justify-center font-bold text-white mr-4">3</span>
              <span className="pt-1">Click "Mark as Paid" and approve the transaction in your wallet</span>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 w-8 h-8 bg-[#20d9c5] rounded-full flex items-center justify-center font-bold text-white mr-4">4</span>
              <span className="pt-1">Wait a few seconds for the transaction to be processed on the blockchain</span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
};
