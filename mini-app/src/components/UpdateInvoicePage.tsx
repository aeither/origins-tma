import React, { useState } from "react";
import {
  TonConnectButton,
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

        {/* Fetch Invoice Form */}
        <div className="bg-[#3a3f47] rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Step 1: Fetch Invoice Details</h2>
          
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
              onChange={(e) => {
                setInvoiceId(e.target.value);
                setInvoice(null); // Clear previous invoice when ID changes
              }}
              placeholder="Enter invoice ID (e.g., 0, 1, 2...)"
              className="w-full px-4 py-2 bg-[#282c34] border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-white"
              disabled={isLoading}
            />
            <p className="mt-1 text-xs text-gray-400">
              Enter the ID of the invoice you want to mark as paid
            </p>
          </div>

          <button
            onClick={handleFetchInvoice}
            disabled={isLoading || !invoiceId}
            className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
              isLoading || !invoiceId
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isLoading ? "Fetching..." : "Fetch Invoice Details"}
          </button>
        </div>

        {/* Invoice Details */}
        {invoice && (
          <div className="bg-[#3a3f47] rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Invoice Details</h2>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-400">Invoice ID</p>
                <p className="text-lg font-bold text-blue-400">#{invoice.invoiceId}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Amount</p>
                <p className="text-2xl font-bold text-green-400">
                  {Number(invoice.amount) / 1e9} TON
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Recipient Wallet</p>
                <p className="font-mono text-xs break-all text-gray-300">
                  {invoice.wallet.toString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Status</p>
                <span className={`inline-block px-3 py-1 rounded text-sm font-semibold ${
                  invoice.paid ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                }`}>
                  {invoice.paid ? '✅ PAID' : '⏳ UNPAID'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Payment Form */}
        {invoice && (
          <div className="bg-[#3a3f47] rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Step 2: Send Payment</h2>
            
            <div className="bg-[#282c34] rounded-lg p-4 mb-4">
              <h3 className="text-sm font-semibold mb-2 text-gray-400">Payment Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Invoice Amount:</span>
                  <span className="text-sm font-bold">{Number(invoice.amount) / 1e9} TON</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Transaction Fee:</span>
                  <span className="text-sm font-bold">0.1 TON</span>
                </div>
                <div className="border-t border-gray-600 pt-2 flex justify-between">
                  <span className="font-bold">Total:</span>
                  <span className="font-bold text-green-400">
                    {(Number(invoice.amount) / 1e9 + 0.1).toFixed(2)} TON
                  </span>
                </div>
              </div>
            </div>

            <form onSubmit={handleUpdateInvoice}>
              <button
                type="submit"
                disabled={isLoading || !wallet}
                className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                  isLoading || !wallet
                    ? "bg-gray-600 cursor-not-allowed"
                    : "bg-yellow-600 hover:bg-yellow-700"
                }`}
              >
                {isLoading ? "Processing..." : "Mark as Paid & Send Payment"}
              </button>
            </form>
          </div>
        )}

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
