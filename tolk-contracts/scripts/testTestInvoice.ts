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

    console.log('🔍 Testing TestInvoice contract functionality...');

    try {
        // Get current state
        const invoiceCount = await testInvoice.getInvoiceCount();
        //const nextInvoiceId = await testInvoice.getNextInvoiceId();
        
        console.log(`📊 Current state:`);
        console.log(`  📝 Invoice count: ${invoiceCount}`);
        /*
        console.log(`  🔢 Next invoice ID: ${nextInvoiceId}`);

        // Create a new test invoice
        console.log('\n🧪 Creating test invoice...');
        const testWallet = Address.parse('EQD__________________________________________0');
        const testDescription = BigInt(Date.now()); // Use timestamp as description hash
        const testAmount = toNano('2.5'); // 2.5 TON

        await testInvoice.sendAddInvoice(provider.sender(), {
            value: toNano('0.02'),
            description: testDescription,
            amount: testAmount,
            wallet: testWallet,
        });

        console.log('⏳ Waiting for transaction to complete...');
        await new Promise(resolve => setTimeout(resolve, 10000));

        // Check updated state
        const newInvoiceCount = await testInvoice.getInvoiceCount();
        const newNextInvoiceId = await testInvoice.getNextInvoiceId();
        
        console.log(`📊 Updated state:`);
        console.log(`  📝 Invoice count: ${newInvoiceCount}`);
        console.log(`  🔢 Next invoice ID: ${newNextInvoiceId}`);

        // Get the created invoice
        if (newInvoiceCount > invoiceCount) {
            const invoiceId = nextInvoiceId; // The ID of the invoice we just created
            console.log(`\n📄 Retrieving invoice #${invoiceId}:`);
            
            const invoice = await testInvoice.getInvoice(invoiceId);
            if (invoice) {
                console.log(`  📋 Invoice ID: ${invoice.invoiceId}`);
                console.log(`  📝 Description: ${invoice.description}`);
                console.log(`  💰 Amount: ${invoice.amount} nano-TON (${Number(invoice.amount) / 1e9} TON)`);
                console.log(`  👤 Wallet: ${invoice.wallet.toString()}`);
                console.log(`  ❌ Paid: ${invoice.paid}`);

                // Test updating the invoice (mark as paid)
                console.log(`\n💳 Marking invoice #${invoiceId} as paid...`);
                await testInvoice.sendUpdateInvoice(provider.sender(), {
                    value: toNano('0.02'),
                    invoiceId: invoiceId,
                });

                console.log('⏳ Waiting for update transaction...');
                await new Promise(resolve => setTimeout(resolve, 10000));

                // Get the updated invoice
                const updatedInvoice = await testInvoice.getInvoice(invoiceId);
                if (updatedInvoice) {
                    console.log(`📄 Updated invoice #${invoiceId}:`);
                    console.log(`  📋 Invoice ID: ${updatedInvoice.invoiceId}`);
                    console.log(`  📝 Description: ${updatedInvoice.description}`);
                    console.log(`  💰 Amount: ${updatedInvoice.amount} nano-TON`);
                    console.log(`  👤 Wallet: ${updatedInvoice.wallet.toString()}`);
                    console.log(`  ✅ Paid: ${updatedInvoice.paid}`);
                }
            } else {
                console.log(`❌ Could not retrieve invoice #${invoiceId}`);
            }
        }*/

            
        // Get all invoices
        console.log('\n📋 All invoices:');
        const allInvoices = await testInvoice.getAllInvoices();
        console.log(`Found ${allInvoices.length} invoices:`);
        
        allInvoices.forEach((invoice, index) => {
            console.log(`  ${index + 1}. Invoice #${invoice.invoiceId}:`);
            console.log(`     Amount: ${Number(invoice.amount) / 1e9} TON`);
            console.log(`     Paid: ${invoice.paid ? '✅' : '❌'}`);
            console.log(`     Wallet: ${invoice.wallet.toString()}`);
        });

    } catch (error) {
        console.error('❌ Error testing contract:', error);
    }

    console.log('\n🎉 Test complete!');
}