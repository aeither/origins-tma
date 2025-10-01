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

    console.log('📝 Adding mock invoice to TestInvoice contract...');

    try {
        // Get current state
        const initialCount = await testInvoice.getInvoiceCount();
        const nextInvoiceId = await testInvoice.getNextInvoiceId();
        
        console.log(`📊 Initial state:`);
        console.log(`  📝 Invoice count: ${initialCount}`);
        console.log(`  🔢 Next invoice ID: ${nextInvoiceId}`);

        // Mock invoice data
        const mockInvoice = {
            description: BigInt('0x' + Buffer.from('Website Development').toString('hex').padStart(16, '0').slice(0, 16)), // Convert string to uint64
            amount: toNano('7.77'), // 7.77 TON
            wallet: Address.parse('EQBvW8Z5huBkMJYdnfAEM5JqTNkuWX3diqYENkWsIL0XggGG'), // Sample client wallet
        };

        console.log('\n🧪 Creating mock invoice:');
        console.log(`  📝 Description: Website Development (${mockInvoice.description})`);
        console.log(`  💰 Amount: ${Number(mockInvoice.amount) / 1e9} TON`);
        console.log(`  👤 Client Wallet: ${mockInvoice.wallet.toString()}`);

        // Send transaction to add invoice
        console.log('\n📤 Sending transaction...');
        await testInvoice.sendAddInvoice(provider.sender(), {
            value: toNano('0.02'), // Transaction fee
            description: mockInvoice.description,
            amount: mockInvoice.amount,
            wallet: mockInvoice.wallet,
        });

        console.log('⏳ Waiting for transaction to complete...');
        await new Promise(resolve => setTimeout(resolve, 10000));

        // Check updated state
        const newCount = await testInvoice.getInvoiceCount();
        const newNextId = await testInvoice.getNextInvoiceId();
        
        console.log(`\n📊 Updated state:`);
        console.log(`  📝 Invoice count: ${newCount} (${newCount > initialCount ? '✅ Increased' : '❌ Not changed'})`);
        console.log(`  🔢 Next invoice ID: ${newNextId}`);

        // Try to retrieve the created invoice
        if (newCount > initialCount) {
            const createdInvoiceId = nextInvoiceId; // The ID that was used
            console.log(`\n📄 Retrieving created invoice #${createdInvoiceId}:`);
            
            const invoice = await testInvoice.getInvoice(createdInvoiceId);
            if (invoice) {
                console.log(`  ✅ Invoice found:`);
                console.log(`    📋 ID: ${invoice.invoiceId}`);
                console.log(`    📝 Description: ${invoice.description}`);
                console.log(`    💰 Amount: ${Number(invoice.amount) / 1e9} TON`);
                console.log(`    👤 Wallet: ${invoice.wallet.toString()}`);
                console.log(`    💳 Paid: ${invoice.paid ? '✅ Yes' : '❌ No'}`);
            } else {
                console.log(`  ❌ Could not retrieve invoice #${createdInvoiceId}`);
            }
        } else {
            console.log('❌ Invoice count did not increase. Transaction may have failed.');
        }

        // Show all invoices
        console.log('\n📋 All invoices in contract:');
        try {
            const allInvoices = await testInvoice.getAllInvoices();
            if (allInvoices.length === 0) {
                console.log('  📄 No invoices found');
            } else {
                console.log(`  📄 Found ${allInvoices.length} invoice(s):`);
                allInvoices.forEach((invoice, index) => {
                    console.log(`    ${index + 1}. Invoice #${invoice.invoiceId}:`);
                    console.log(`       💰 Amount: ${Number(invoice.amount) / 1e9} TON`);
                    console.log(`       💳 Status: ${invoice.paid ? '✅ Paid' : '⏳ Unpaid'}`);
                    console.log(`       👤 Wallet: ${invoice.wallet.toString()}`);
                });
            }
        } catch (error) {
            console.log('  ❌ Error retrieving all invoices:', error);
        }

    } catch (error) {
        console.error('❌ Error adding mock invoice:', error);
    }

    console.log('\n🎉 Mock invoice addition complete!');
}