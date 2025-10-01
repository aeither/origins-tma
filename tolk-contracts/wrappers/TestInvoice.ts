import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode, toNano, Tuple, TupleItem } from '@ton/core';

export type TestInvoiceConfig = {
    nextInvoiceId?: number;
    invoiceCount?: number;
};

export function testInvoiceConfigToCell(config: TestInvoiceConfig): Cell {
    return beginCell()
        .storeUint(config.nextInvoiceId ?? 0, 32)  // next_invoice_id
        .storeUint(config.invoiceCount ?? 0, 32)   // invoice_count
        .storeDict(null)                           // empty invoices dictionary
        .endCell();
}

// Invoice type
export type Invoice = {
    invoiceId: number;
    description: bigint;
    amount: bigint;
    wallet: Address;
    paid: boolean;
};

// Message opcodes
export const Opcodes = {
    addInvoice: 0x1,
    updateInvoice: 0x2,
};

export class TestInvoice implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new TestInvoice(address);
    }

    static createFromConfig(config: TestInvoiceConfig, code: Cell, workchain = 0) {
        const data = testInvoiceConfigToCell(config);
        const init = { code, data };
        return new TestInvoice(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    // Add new invoice
    async sendAddInvoice(
        provider: ContractProvider,
        via: Sender,
        opts: {
            value: bigint;
            queryId?: number;
            description: bigint;
            amount: bigint;
            wallet: Address;
        }
    ) {
        await provider.internal(via, {
            value: opts.value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(Opcodes.addInvoice, 32)
                .storeUint(opts.queryId ?? 0, 64)
                .storeUint(opts.description, 64)
                .storeCoins(opts.amount)
                .storeAddress(opts.wallet)
                .endCell(),
        });
    }

    // Update invoice (mark as paid)
    async sendUpdateInvoice(
        provider: ContractProvider,
        via: Sender,
        opts: {
            value: bigint;
            queryId?: number;
            invoiceId: number;
        }
    ) {
        await provider.internal(via, {
            value: opts.value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(Opcodes.updateInvoice, 32)
                .storeUint(opts.queryId ?? 0, 64)
                .storeUint(opts.invoiceId, 32)
                .endCell(),
        });
    }

    // Get invoice by ID
    async getInvoice(provider: ContractProvider, invoiceId: number): Promise<Invoice | null> {
        try {
            const result = await provider.get('get_invoice', [{ type: 'int', value: BigInt(invoiceId) }]);
            const invoice = result.stack;
            
            return {
                invoiceId: invoice.readNumber(),
                description: invoice.readBigNumber(),
                amount: invoice.readBigNumber(),
                wallet: invoice.readAddress(),
                paid: invoice.readNumber() === 1,
            };
        } catch (error) {
            // Invoice not found
            return null;
        }
    }

    // Get all invoices
    async getAllInvoices(provider: ContractProvider): Promise<Invoice[]> {
        try {
            const result = await provider.get('get_all_invoices', []);
            const invoices: Invoice[] = [];
            
            // Check if there's anything to read
            if (result.stack.remaining === 0) {
                console.log('Stack is empty - no invoices');
                return invoices; // Empty list
            }
            
            // Debug: Let's see what we actually get
            console.log(`Stack has ${result.stack.remaining} items`);
            
            // Try to read the result - it should be a tuple of tuples
            let mainTuple;
            try {
                mainTuple = result.stack.readTuple();
                console.log(`Main tuple has ${mainTuple.remaining} items`);
            } catch (error) {
                console.log('Contract returned non-tuple result:', error);
                return invoices;
            }
            
            // Iterate through each item in the main tuple
            while (mainTuple.remaining > 0) {
                try {
                    // First, let's see what type of item this is
                    const item = mainTuple.peek();
                    console.log(`Next item type: ${item?.type}`);
                    
                    if (item?.type === 'tuple') {
                        const invoiceTuple = mainTuple.readTuple();
                        console.log(`Invoice tuple has ${invoiceTuple.remaining} items`);
                        
                        if (invoiceTuple.remaining >= 5) {
                            const invoiceId = invoiceTuple.readNumber();
                            const description = invoiceTuple.readBigNumber();
                            const amount = invoiceTuple.readBigNumber();
                            const wallet = invoiceTuple.readAddress();
                            const paid = invoiceTuple.readNumber() === 1;
                            
                            invoices.push({
                                invoiceId,
                                description,
                                amount,
                                wallet,
                                paid,
                            });
                            
                            console.log(`Successfully parsed invoice #${invoiceId}`);
                        } else {
                            console.log(`Invoice tuple has insufficient items: ${invoiceTuple.remaining}`);
                            break;
                        }
                    } else {
                        console.log(`Unexpected item type: ${item?.type}, skipping`);
                        // Try to read it anyway to advance the pointer
                        try {
                            mainTuple.readCell();
                        } catch {
                            try {
                                mainTuple.readNumber();
                            } catch {
                                break; // Can't read it, stop
                            }
                        }
                    }
                } catch (error) {
                    console.log('Error reading individual invoice item:', error);
                    break;
                }
            }
            
            console.log(`Parsed ${invoices.length} invoices total`);
            return invoices;
        } catch (error) {
            console.log('Error in getAllInvoices:', error);
            return [];
        }
    }

    // Get invoice count
    async getInvoiceCount(provider: ContractProvider): Promise<number> {
        const result = await provider.get('get_invoice_count', []);
        return result.stack.readNumber();
    }

    // Get next invoice ID
    async getNextInvoiceId(provider: ContractProvider): Promise<number> {
        const result = await provider.get('get_next_invoice_id', []);
        return result.stack.readNumber();
    }
}
