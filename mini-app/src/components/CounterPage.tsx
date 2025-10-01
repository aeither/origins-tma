import React, { useState, useEffect, useRef } from "react";
import {
  useTonConnectUI,
  useTonWallet,
} from "@tonconnect/ui-react";
import { TonClient, Address, toNano, beginCell } from "@ton/ton";
import { Link } from "@tanstack/react-router";
import { CONTRACT_ADDRESS, NETWORK, TON_CENTER_ENDPOINTS, API_CONFIG } from "../config/consts";

interface Invoice {
  invoiceId: number;
  description: bigint; // Hash of the original description string (uint64) - stored on blockchain
  descriptionText?: string; // Original description text (stored locally for UI display)
  amount: bigint;
  wallet: Address;
  paid: boolean;
}

// TestInvoice contract opcodes (matching the FunC contract)
const Opcodes = {
  addInvoice: 0x1,
  updateInvoice: 0x2,
};

export const CounterPage: React.FC = () => {
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();
  const [status, setStatus] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Invoice-related state
  const [allInvoices, setAllInvoices] = useState<Invoice[]>([]);
  const [invoiceCount, setInvoiceCount] = useState<number>(0);
  const [nextInvoiceId, setNextInvoiceId] = useState<number>(0);
  // Map to store original descriptions by hash (for UI display)
  const [descriptionMap, setDescriptionMap] = useState<Map<string, string>>(new Map());
  
  // Form state for new invoice
  const [newInvoiceDescription, setNewInvoiceDescription] = useState("");
  const [newInvoiceAmount, setNewInvoiceAmount] = useState("");
  const [newInvoiceWallet, setNewInvoiceWallet] = useState("");

  // Track if a fetch is in progress to prevent overlapping requests
  const isFetchingRef = useRef(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastFetchTimeRef = useRef<number>(0);

  // Initialize TON client for reading contract data
  const tonClient = new TonClient({
    endpoint: TON_CENTER_ENDPOINTS[NETWORK],
  });
  const contractAddress = Address.parse(CONTRACT_ADDRESS);

  // Rate limiting helper using config constants
  const { RATE_LIMIT_DELAY, MAX_RETRIES, RETRY_DELAY, POLLING_INTERVAL } = API_CONFIG;

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const fetchContractDataWithRetry = async (retryCount = 0): Promise<void> => {
    try {
      console.log('[Contract Debug] Calling TestInvoice contract methods on address:', CONTRACT_ADDRESS);
      console.log('[Contract Debug] Contract address details:', {
        raw: CONTRACT_ADDRESS,
        parsed: contractAddress.toString(),
        workchain: contractAddress.workChain,
        hash: contractAddress.hash.toString('hex')
      });
      
      // Clear previous data
      setAllInvoices([]);
      
      // Fetch invoice data from TestInvoice FunC contract
      let invoiceCountValue = 0;
      let nextInvoiceIdValue = 0;
      let latestInvoice = null;
      let fetchedInvoicesCount = 0;

      try {
        // Step 1: Get invoice count
        console.log('[Contract Debug] Fetching invoice count...');
        const invoiceCountResult = await tonClient.runMethod(contractAddress, "get_invoice_count");
        invoiceCountValue = Number(invoiceCountResult.stack.readNumber());
        console.log('[Contract Debug] Found', invoiceCountValue, 'invoices');
        
        // Debug: Check if this is a new contract or if it has any existing data
        if (invoiceCountValue === 0) {
          console.log('[Contract Debug] Contract has no invoices - this might be a fresh deployment or the add_invoice method is not working');
        }
        
        await delay(RATE_LIMIT_DELAY);

        // Step 2: Get next invoice ID to know the range
        if (invoiceCountValue > 0) {
          console.log('[Contract Debug] Fetching next invoice ID...');
          const nextInvoiceIdResult = await tonClient.runMethod(contractAddress, "get_next_invoice_id");
          nextInvoiceIdValue = Number(nextInvoiceIdResult.stack.readNumber());
          console.log('[Contract Debug] Next invoice ID:', nextInvoiceIdValue);
          await delay(RATE_LIMIT_DELAY);
        }

        // Step 3: Fetch all invoices individually from last to first (most recent first)
        if (invoiceCountValue > 0) {
          console.log('[Contract Debug] Fetching invoices from last to first...');
          const allInvoices: Invoice[] = [];
          
          // Fetch from (nextInvoiceId - 1) down to 0 to get newest first
          let consecutiveErrors = 0;
          const maxConsecutiveErrors = 3;
          
          for (let i = nextInvoiceIdValue - 1; i >= 0; i--) {
            try {
              console.log(`[Contract Debug] Fetching invoice ID ${i}...`);
              setStatus(`Loading invoices... (${nextInvoiceIdValue - i}/${invoiceCountValue}) - newest first`);
              
              const invoiceResult = await tonClient.runMethod(contractAddress, "get_invoice", [
                { type: "int", value: BigInt(i) }
              ]);
              
              if (invoiceResult.stack.remaining >= 5) {
                // Read in correct order: invoiceId, description, amount, wallet, paid
                const invoiceId = Number(invoiceResult.stack.readNumber());
                const descriptionHash = invoiceResult.stack.readBigNumber();
                const hashKey = descriptionHash.toString(16);
                
                const invoice: Invoice = {
                  invoiceId: invoiceId,
                  description: descriptionHash,
                  descriptionText: descriptionMap.get(hashKey), // Include original text if available
                  amount: invoiceResult.stack.readBigNumber(),
                  wallet: invoiceResult.stack.readAddress(),
                  paid: invoiceResult.stack.readNumber() === 1
                };
                
                allInvoices.push(invoice);
                console.log(`[Contract Debug] Successfully fetched invoice ID ${i}:`, invoice);
                consecutiveErrors = 0; // Reset error count on success
                
                // Set the first (newest) invoice as the displayed invoice
                if (allInvoices.length === 1) {
                  latestInvoice = invoice;
                }
              }
              
              // Wait between each invoice fetch to avoid rate limiting
              if (i > 0) {
                await delay(RATE_LIMIT_DELAY);
              }
              
            } catch (invoiceError) {
              console.log(`[Contract Debug] Error getting invoice ${i}:`, invoiceError);
              consecutiveErrors++;
              
              // If too many consecutive errors, break to avoid wasting API calls
              if (consecutiveErrors >= maxConsecutiveErrors) {
                console.log(`[Contract Debug] Too many consecutive errors (${consecutiveErrors}), stopping fetch`);
                setStatus(`Stopped fetching after ${consecutiveErrors} consecutive errors. Got ${allInvoices.length} invoices.`);
                break;
              }
              
              // If we hit rate limits, extend the delay
              const errorStr = String(invoiceError);
              if ((invoiceError as any)?.response?.status === 429 || errorStr.includes('429')) {
                console.log(`[Contract Debug] Rate limited at invoice ${i}, extending delay...`);
                setStatus(`Rate limited while fetching invoice ${i}. Waiting longer...`);
                await delay(RATE_LIMIT_DELAY * 2); // Double the delay for rate limits
              } else {
                // Continue fetching other invoices even if one fails
                if (i > 0) {
                  await delay(RATE_LIMIT_DELAY);
                }
              }
            }
          }
          
          // Update state with all invoices (newest first)
          if (allInvoices.length > 0) {
            fetchedInvoicesCount = allInvoices.length;
            console.log('[Contract Debug] All invoices fetched (newest first):', allInvoices);
            setAllInvoices(allInvoices);
          }
        }
      } catch (invoiceMethodError) {
        console.log('[Contract Debug] TestInvoice methods error:', invoiceMethodError);
      }

      console.log('[Contract Debug] Parsed values:', { 
        invoiceCount: invoiceCountValue,
        nextInvoiceId: nextInvoiceIdValue,
        latestInvoice
      });

      setInvoiceCount(invoiceCountValue);
      setNextInvoiceId(nextInvoiceIdValue);
      
      if (invoiceCountValue > 0) {
        setStatus(`Successfully loaded ${fetchedInvoicesCount}/${invoiceCountValue} invoices (newest first) using individual get_invoice calls`);
      } else {
        setStatus('Contract data loaded - No invoices found');
      }

    } catch (err: any) {
      console.error('[Counter Debug] Failed to fetch contract data:', err);
      
      // Handle rate limiting with exponential backoff
      if (err?.response?.status === 429 || err?.message?.includes('429')) {
        if (retryCount < MAX_RETRIES) {
          const retryDelay = RETRY_DELAY * Math.pow(2, retryCount); // Exponential backoff
          console.log(`[Counter Debug] Rate limited, retrying in ${retryDelay}ms... (attempt ${retryCount + 1}/${MAX_RETRIES})`);
          setStatus(`Rate limited, retrying in ${retryDelay / 1000}s...`);
          await delay(retryDelay);
          return fetchContractDataWithRetry(retryCount + 1);
        } else {
          setStatus("Rate limited. Please wait before refreshing.");
        }
      } else {
        const errorMessage = `Failed to fetch contract data: ${err instanceof Error ? err.message : 'Unknown error'}`;
        console.log('[Counter Debug] Error message:', errorMessage);
        setStatus(errorMessage);
      }
    }
  };

  const fetchContractData = async () => {
    // Prevent overlapping requests
    if (isFetchingRef.current) {
      console.log('[Counter Debug] Fetch already in progress, skipping...');
      return;
    }

    // Rate limiting  
    const now = Date.now();
    if (now - lastFetchTimeRef.current < RATE_LIMIT_DELAY) {
      const waitTime = Math.ceil((RATE_LIMIT_DELAY - (now - lastFetchTimeRef.current)) / 1000);
      console.log('[Counter Debug] Rate limit: too soon since last request');
      setStatus(`Please wait ${waitTime} more seconds before refreshing to avoid rate limits`);
      return;
    }
    
    isFetchingRef.current = true;
    lastFetchTimeRef.current = now;
    console.log('[Counter Debug] Fetching contract data...');
    
    try {
      setIsLoading(true);
      await fetchContractDataWithRetry();
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
      console.log('[Counter Debug] Contract data fetch completed');
    }
  };

  useEffect(() => {
    // Visibility handler for tab/window
    const handleVisibility = () => {
      if (!document.hidden) {
        console.log('[Counter Debug] Tab became visible, resuming polling');
        // Small delay before fetching to avoid immediate rate limits
        setTimeout(fetchContractData, 1000);
        // Start polling when visible with longer interval
        if (!intervalRef.current) {
          intervalRef.current = setInterval(fetchContractData, POLLING_INTERVAL);
        }
      } else {
        console.log('[Counter Debug] Tab hidden, pausing polling');
        // Pause polling when not visible
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    // Initial fetch with delay
    setTimeout(fetchContractData, 500);
    // Set up polling with configured interval to reduce rate limiting
    intervalRef.current = setInterval(fetchContractData, POLLING_INTERVAL);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);





  // Helper function to encode AddInvoice message payload for FunC contract
  const encodeAddInvoiceMessage = (description: string, amount: bigint, walletAddr: Address): string => {
    try {
      // Create a hash of the description string for uint64
      // Using a simple but effective hash function since FunC expects uint64
      let hash = 0n;
      const descriptionBytes = new TextEncoder().encode(description);
      
      // Simple FNV-1a inspired hash for uint64
      hash = 14695981039346656037n; // FNV offset basis for 64-bit
      for (let i = 0; i < descriptionBytes.length; i++) {
        hash = hash ^ BigInt(descriptionBytes[i]);
        hash = (hash * 1099511628211n) & 0xFFFFFFFFFFFFFFFFn; // FNV prime for 64-bit, mask to 64 bits
      }
      
      const body = beginCell()
        .storeUint(Opcodes.addInvoice, 32) // AddInvoice opcode: 0x1
        .storeUint(0, 64) // query_id
        .storeUint(hash, 64) // description as uint64 hash
        .storeCoins(amount) // amount in nanotons
        .storeAddress(walletAddr) // wallet address (this should match load_msg_addr() in FunC)
        .endCell();
      
      console.log('[Invoice Debug] Message cell structure:', {
        opcode: Opcodes.addInvoice,
        queryId: 0,
        descriptionHash: hash.toString(16),
        amountNano: amount.toString(),
        walletAddress: walletAddr.toString(),
        cellSize: body.bits.toString() + ' bits'
      });

      const base64 = body.toBoc().toString('base64');
      console.log('[Invoice Debug] AddInvoice payload encoding:', {
        opcode: Opcodes.addInvoice,
        description,
        descriptionHash: hash.toString(16),
        amount: amount.toString(),
        walletAddr: walletAddr.toString(),
        base64
      });

      return base64;
    } catch (error) {
      console.error('[Invoice Debug] AddInvoice payload encoding failed:', error);
      throw new Error(`Failed to encode AddInvoice payload: ${error}`);
    }
  };



  const onAddInvoiceClick = async () => {
    if (!wallet) {
      setStatus("Please connect your TON wallet first.");
      return;
    }

    if (!newInvoiceDescription || !newInvoiceAmount || !newInvoiceWallet) {
      setStatus("Please fill in all invoice fields.");
      return;
    }

    if (newInvoiceDescription.length > 50) {
      setStatus("Description too long (max 50 characters for better hashing).");
      return;
    }

    try {
      setIsLoading(true);
      setStatus("Creating invoice...");

      // Convert string inputs to proper types for FunC contract
      const amountInNano = toNano(newInvoiceAmount);
      
      // Validate and parse wallet address
      let walletAddress;
      try {
        walletAddress = Address.parse(newInvoiceWallet);
        console.log('[Invoice Debug] Parsed wallet address:', walletAddress.toString());
      } catch (addrError) {
        throw new Error(`Invalid wallet address: ${newInvoiceWallet}`);
      }
      
      const payload = encodeAddInvoiceMessage(newInvoiceDescription, amountInNano, walletAddress);
      
      // Store the original description for UI display (by calculating the same hash)
      const descriptionBytes = new TextEncoder().encode(newInvoiceDescription);
      let hash = 14695981039346656037n;
      for (let i = 0; i < descriptionBytes.length; i++) {
        hash = hash ^ BigInt(descriptionBytes[i]);
        hash = (hash * 1099511628211n) & 0xFFFFFFFFFFFFFFFFn;
      }
      const hashKey = hash.toString(16);
      
      // Update the description map
      setDescriptionMap(prevMap => {
        const newMap = new Map(prevMap);
        newMap.set(hashKey, newInvoiceDescription);
        return newMap;
      });
      
      const tx = {
        validUntil: Math.floor(Date.now() / 1000) + 600,
        messages: [{
          address: CONTRACT_ADDRESS,
          amount: toNano("0.1").toString(), // Increased gas to 0.1 TON in case 0.05 wasn't enough
          payload: payload,
        }],
      };
      
      console.log('[Invoice Debug] Full transaction object:', JSON.stringify(tx, null, 2));

      const result = await tonConnectUI.sendTransaction(tx);
      console.log('[Invoice Debug] AddInvoice transaction result:', result);
      console.log('[Invoice Debug] Transaction payload details:', {
        contractAddress: CONTRACT_ADDRESS,
        gasAmount: toNano("0.05").toString(),
        payloadBase64: payload,
        description: newInvoiceDescription,
        amount: newInvoiceAmount,
        wallet: newInvoiceWallet
      });
      
      setStatus("Invoice created! Waiting for confirmation...");
      
      // Clear form
      setNewInvoiceDescription("");
      setNewInvoiceAmount("");
      setNewInvoiceWallet("");

      // Refresh contract data after delay to avoid rate limits
      setTimeout(() => {
        setStatus("Refreshing contract data to check if invoice was added...");
        fetchContractData();
      }, 8000);
      
      // Also try a quicker refresh to see immediate changes
      setTimeout(() => {
        console.log('[Invoice Debug] Quick refresh to check invoice count...');
        fetchContractData();
      }, 3000);

    } catch (e) {
      console.error('[Invoice Debug] AddInvoice transaction failed:', e);
      console.error('[Invoice Debug] Full error object:', {
        name: (e as Error)?.name,
        message: (e as Error)?.message,
        stack: (e as Error)?.stack
      });
      
      let errorMessage = 'Unknown error';
      if (e instanceof Error) {
        errorMessage = e.message;
      } else if (typeof e === 'string') {
        errorMessage = e;
      }
      
      setStatus(`Failed to create invoice: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

    const onUpdateInvoiceClick = async (invoiceId: number) => {
    if (!wallet) {
      alert("Please connect your wallet first!");
      return;
    }

    // Find the invoice to get the amount
    const invoice = allInvoices.find(inv => inv.invoiceId === invoiceId);
    if (!invoice) {
      alert("Invoice not found!");
      return;
    }

    if (invoice.paid) {
      const confirmPay = window.confirm("This invoice is already marked as paid. Do you want to proceed anyway?");
      if (!confirmPay) {
        return;
      }
    }

    // Calculate total: invoice amount + transaction fee
    const transactionFee = toNano("0.1");
    const totalAmount = invoice.amount + transactionFee;
    const invoiceAmountTON = Number(invoice.amount) / 1e9;
    const totalAmountTON = Number(totalAmount) / 1e9;

    const confirmMessage = `Mark invoice #${invoiceId} as paid?\n\n` +
      `Invoice Amount: ${invoiceAmountTON} TON\n` +
      `Transaction Fee: 0.1 TON\n` +
      `Total: ${totalAmountTON} TON\n\n` +
      `The invoice amount will be sent to:\n${invoice.wallet.toString()}`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    setIsLoading(true);

    try {
      const body = beginCell()
        .storeUint(Opcodes.updateInvoice, 32) // op code for updateInvoice
        .storeUint(0, 64) // query id
        .storeUint(invoiceId, 32) // Pass the invoice ID as number
        .endCell();

      const message = {
        address: CONTRACT_ADDRESS,
        amount: totalAmount.toString(), // Invoice amount + transaction fee
        payload: body.toBoc().toString("base64"),
      };

      await tonConnectUI.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 300, // 5 minutes
        messages: [message],
      });

      alert(`Invoice update sent! ${invoiceAmountTON} TON will be transferred to the wallet.`);
      // Refresh data after update
      setTimeout(() => fetchContractData(), 3000);
    } catch (error) {
      console.error("Error sending transaction:", error);
      alert(`Error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#002952] via-[#003c71] to-[#004a8f] text-white p-6">
      <div className="max-w-4xl mx-auto">
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
            <div className="text-5xl">👨‍💻</div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-[#20d9c5] to-[#60e8d8] bg-clip-text text-transparent">
                Freelancer Dashboard
              </h1>
              <p className="text-gray-400 text-sm mt-1">Step 1: Create your invoices</p>
            </div>
          </div>
          <p className="text-gray-300 mb-6 text-lg">
            Create and manage invoices for your clients on TON blockchain
          </p>
        </div>

        {/* Contract Info */}
        <div className="glass-card rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Contract Information</h2>
          <div className="space-y-5">
            <div>
              <span className="text-gray-400 text-sm block mb-1">Connected Wallet</span>
              <p className="font-mono text-sm break-all bg-white/5 p-3 rounded-lg">
                {wallet?.account.address || "None"}
              </p>
            </div>
            <div>
              <span className="text-gray-400 text-sm block mb-1">Contract Address</span>
              <p className="font-mono text-sm break-all bg-white/5 p-3 rounded-lg">{CONTRACT_ADDRESS}</p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="glass-card p-5 rounded-xl">
                <span className="text-gray-400 text-sm block mb-2">Total Invoices</span>
                <p className="text-3xl font-bold text-[#20d9c5]">
                  {invoiceCount}
                </p>
              </div>
              <div className="glass-card p-5 rounded-xl">
                <span className="text-gray-400 text-sm block mb-2">Next Invoice ID</span>
                <p className="text-3xl font-bold text-[#20d9c5]">
                  {nextInvoiceId}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={fetchContractData}
            disabled={isLoading}
            className="mt-6 w-full glass-button disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl"
          >
            {isLoading ? "Loading Contract Data..." : "Refresh All Data"}
          </button>
          <p className="text-xs text-gray-400 mt-3 text-center">
            Auto-refreshes every {POLLING_INTERVAL / 1000}s (pauses when tab is hidden)<br/>
            Fetches invoices individually from newest to oldest with proper delays
          </p>
        </div>

        {/* Create Invoice */}
        <div id="create-invoice-section">
        </div>
        <div className="glass-card rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">Create New Invoice</h2>
          <div className="bg-[#20d9c5]/10 border border-[#20d9c5]/30 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-[#20d9c5] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-[#20d9c5] font-semibold text-sm">Share Invoice ID with Your Client</p>
                <p className="text-gray-300 text-sm mt-1">After creating an invoice, share the Invoice ID (e.g., #0, #1) with your client so they can pay it in the Client Payment Portal.</p>
              </div>
            </div>
          </div>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
              <input
                type="text"
                value={newInvoiceDescription}
                onChange={(e) => setNewInvoiceDescription(e.target.value)}
                placeholder="Invoice description (max 50 characters)"
                maxLength={32}
                className="w-full glass-input text-white px-4 py-3 rounded-xl transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Amount (TON)</label>
              <input
                type="number"
                value={newInvoiceAmount}
                onChange={(e) => setNewInvoiceAmount(e.target.value)}
                placeholder="0.1"
                step="0.001"
                min="0"
                className="w-full glass-input text-white px-4 py-3 rounded-xl transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Client Wallet Address</label>
              <input
                type="text"
                value={newInvoiceWallet}
                onChange={(e) => setNewInvoiceWallet(e.target.value)}
                placeholder="EQD..."
                className="w-full glass-input text-white px-4 py-3 rounded-xl font-mono text-sm transition-all"
              />
            </div>
            <button
              onClick={onAddInvoiceClick}
              disabled={!wallet || isLoading || !newInvoiceDescription || !newInvoiceAmount || !newInvoiceWallet}
              className="w-full glass-button disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl"
            >
              {isLoading ? "Processing..." : "Create Invoice"}
            </button>
            <p className="text-xs text-gray-400 text-center">
              Gas fee: ~0.05 TON
            </p>
          </div>
        </div>

        {/* All Invoices List */}
        {allInvoices.length > 0 && (
          <div className="glass-card rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6">All Invoices ({allInvoices.length})</h2>
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {allInvoices.map((invoiceItem) => (
                <div key={invoiceItem.invoiceId} className="glass-card rounded-xl p-5 hover:border-[#20d9c5] transition-all duration-300">
                  <div className="flex justify-between items-start mb-4">
                    <p className="font-bold text-xl text-[#20d9c5]">#{invoiceItem.invoiceId}</p>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      invoiceItem.paid ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}>
                      {invoiceItem.paid ? '✓ PAID' : '○ UNPAID'}
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Description</p>
                      {invoiceItem.descriptionText ? (
                        <p className="break-words text-sm text-gray-200">{invoiceItem.descriptionText}</p>
                      ) : (
                        <p className="break-words text-sm font-mono text-gray-500">
                          Hash: 0x{invoiceItem.description.toString(16)}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Wallet Address</p>
                      <p className="font-mono text-xs break-all text-gray-300 bg-white/5 p-2 rounded">{invoiceItem.wallet.toString()}</p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Amount</p>
                      <p className="font-bold text-2xl text-[#20d9c5]">{Number(invoiceItem.amount) / 1e9} TON</p>
                    </div>
                  </div>
                  
                  {!invoiceItem.paid && (
                    <button
                      className="mt-4 w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white py-3 px-4 rounded-xl transition-all duration-300 font-semibold shadow-lg hover:shadow-amber-500/30"
                      onClick={() => onUpdateInvoiceClick(invoiceItem.invoiceId)}
                      disabled={isLoading}
                    >
                      Mark as Paid
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Status */}
        {status && (
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-sm font-semibold mb-2 text-[#20d9c5]">Status</h3>
            <p className="text-sm text-gray-300">{status}</p>
          </div>
        )}
      </div>
    </div>
  );
};
