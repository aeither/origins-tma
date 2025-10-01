import { toNano, Address } from '@ton/core';
import { TestInvoice } from '../wrappers/TestInvoice';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const ui = provider.ui();
    const address = Address.parse(await ui.input('TestInvoice address'));
    
    if (!(await provider.isContractDeployed(address))) {
        ui.write(`Error: Contract at address ${address} is not deployed!`);
        return;
    }

    const testInvoice = provider.open(TestInvoice.createFromAddress(address));

    console.log('📝 Updating invoice in TestInvoice contract...');

    try {
        // Get current state
        const initialCount = await testInvoice.getInvoiceCount();
        const nextInvoiceId = await testInvoice.getNextInvoiceId();
        
        console.log(`📊 Current state:`);
        console.log(`  📝 Invoice count: ${initialCount}`);
        console.log(`  🔢 Next invoice ID: ${nextInvoiceId}`);

        if (initialCount === 0) {
            console.log('\n❌ No invoices found in contract. Please create an invoice first.');
            return;
        }

        // Ask for invoice ID to update
        const invoiceIdStr = await ui.input(`Enter invoice ID to mark as paid (0 to ${nextInvoiceId - 1})`);
        const invoiceId = parseInt(invoiceIdStr);

        if (isNaN(invoiceId) || invoiceId < 0 || invoiceId >= nextInvoiceId) {
            console.log(`❌ Invalid invoice ID. Must be between 0 and ${nextInvoiceId - 1}`);
            return;
        }

        // Get the invoice before updating
        console.log(`\n📄 Fetching invoice #${invoiceId}...`);
        const invoice = await testInvoice.getInvoice(invoiceId);
        
        if (!invoice) {
            console.log(`❌ Invoice #${invoiceId} not found`);
            return;
        }

        console.log(`\n📋 Invoice #${invoiceId} details:`);
        console.log(`  📝 Description hash: ${invoice.description}`);
        console.log(`  💰 Amount: ${Number(invoice.amount) / 1e9} TON`);
        console.log(`  👤 Wallet: ${invoice.wallet.toString()}`);
        console.log(`  💳 Status: ${invoice.paid ? '✅ Already Paid' : '⏳ Unpaid'}`);

        if (invoice.paid) {
            console.log('\n⚠️  This invoice is already marked as paid.');
            const confirm = await ui.input('Do you still want to send the update transaction? (yes/no)');
            if (confirm.toLowerCase() !== 'yes') {
                console.log('❌ Update cancelled');
                return;
            }
        }

        // Send transaction to update invoice
        console.log('\n📤 Sending transaction to mark invoice as paid...');
        await testInvoice.sendUpdateInvoice(provider.sender(), {
            value: toNano('0.05'), // Transaction fee
            invoiceId: invoiceId,
        });

        console.log('⏳ Waiting for transaction to complete...');
        await new Promise(resolve => setTimeout(resolve, 10000));

        // Check updated invoice
        console.log('\n📄 Fetching updated invoice...');
        const updatedInvoice = await testInvoice.getInvoice(invoiceId);
        
        if (updatedInvoice) {
            console.log(`\n📋 Updated Invoice #${invoiceId}:`);
            console.log(`  📝 Description hash: ${updatedInvoice.description}`);
            console.log(`  💰 Amount: ${Number(updatedInvoice.amount) / 1e9} TON`);
            console.log(`  👤 Wallet: ${updatedInvoice.wallet.toString()}`);
            console.log(`  💳 Status: ${updatedInvoice.paid ? '✅ Paid' : '⏳ Unpaid'}`);
            
            if (updatedInvoice.paid && !invoice.paid) {
                console.log('\n✅ Invoice successfully marked as paid!');
            } else if (!updatedInvoice.paid) {
                console.log('\n❌ Invoice was not marked as paid. Transaction may have failed.');
            }
        } else {
            console.log('❌ Could not retrieve updated invoice');
        }

        // Show summary
        console.log('\n📊 Contract state after update:');
        const finalCount = await testInvoice.getInvoiceCount();
        console.log(`  📝 Total invoices: ${finalCount}`);

    } catch (error) {
        console.error('❌ Error updating invoice:', error);
        if (error instanceof Error) {
            console.error('Error details:', error.message);
        }
    }

    console.log('\n🎉 Update process complete!');
}
