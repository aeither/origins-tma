import { Address, toNano } from '@ton/core';
import { TolkContracts } from '../wrappers/TolkContracts';
import { NetworkProvider, sleep } from '@ton/blueprint';

export async function run(provider: NetworkProvider, args: string[]) {
    const ui = provider.ui();

    const address = Address.parse(args.length > 0 ? args[0] : await ui.input('TolkContracts address'));

    if (!(await provider.isContractDeployed(address))) {
        ui.write(`Error: Contract at address ${address} is not deployed!`);
        return;
    }

    const tolkContracts = provider.open(TolkContracts.createFromAddress(address));

    ui.write('=== Create New Invoice ===\n');

    // Get invoice parameters from user
    const description = await ui.input('Invoice description (max 32 chars)');
    if (description.length > 32) {
        ui.write('❌ Description too long. Maximum 32 characters allowed.');
        return;
    }

    const amountStr = await ui.input('Invoice amount (in TON)');
    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) {
        ui.write('❌ Invalid amount. Please enter a positive number.');
        return;
    }

    const walletStr = await ui.input('Client wallet address');
    let clientAddress: Address;
    try {
        clientAddress = Address.parse(walletStr);
    } catch (error) {
        ui.write('❌ Invalid wallet address format.');
        return;
    }

    // Show summary
    ui.write('\n=== Invoice Summary ===');
    ui.write(`Description: ${description}`);
    ui.write(`Amount: ${amount} TON`);
    ui.write(`Client: ${clientAddress.toString()}`);
    ui.write(`Gas fee: ~0.05 TON`);

    const confirm = await ui.choose('Create this invoice?', ['Yes', 'No'], (c) => c);
    if (confirm === 'No') {
        ui.write('Invoice creation cancelled.');
        return;
    }

    // Check current state
    try {
        const currentCount = await tolkContracts.getInvoiceCount();
        const nextId = await tolkContracts.getNextInvoiceId();
        ui.write(`\nCurrent invoice count: ${currentCount}`);
        ui.write(`Next invoice ID: ${nextId}`);
    } catch (error) {
        ui.write(`Warning: Could not read current state: ${error}`);
    }

    // Create the invoice
    try {
        ui.write('\n⏳ Creating invoice...');

        const result = await tolkContracts.sendAddInvoice(provider.sender(), {
            description: description,
            amount: toNano(amount.toString()),
            wallet: clientAddress,
            value: toNano('0.05'),
        });

        ui.write('✅ Invoice creation transaction sent!');
        ui.write('⏳ Waiting for transaction to be processed...');

        // Wait for transaction processing
        await sleep(5000);

        // Check the created invoice
        try {
            const latestInvoice = await tolkContracts.getLatestInvoice();
            const newCount = await tolkContracts.getInvoiceCount();
            const newNextId = await tolkContracts.getNextInvoiceId();

            ui.write('\n=== Invoice Created Successfully! ===');
            ui.write(`New invoice count: ${newCount}`);
            ui.write(`Next invoice ID: ${newNextId}`);

            if (latestInvoice) {
                ui.write('\n=== Invoice Details ===');
                ui.write(`ID: ${latestInvoice.invoice_id}`);
                ui.write(`Description: ${latestInvoice.description}`);
                ui.write(`Amount: ${(Number(latestInvoice.amount) / 1e9).toFixed(3)} TON`);
                ui.write(`Client: ${latestInvoice.wallet.toString()}`);
                ui.write(`Status: ${latestInvoice.paid ? '✅ Paid' : '⏳ Unpaid'}`);
            }

            ui.write('\n💡 Use the "updateInvoice" script to mark this invoice as paid.');

        } catch (readError) {
            ui.write(`⚠️  Invoice created but could not read details: ${readError}`);
        }

    } catch (error) {
        ui.write(`❌ Failed to create invoice: ${error}`);
        
        if (error instanceof Error) {
            if (error.message.includes('insufficient')) {
                ui.write('💡 Make sure your wallet has enough TON for the gas fee (0.05 TON)');
            } else if (error.message.includes('rejected')) {
                ui.write('💡 Transaction was cancelled by user');
            }
        }
    }

    ui.write('\n📋 Invoice creation process completed.');
}