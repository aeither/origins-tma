import { toNano, Address } from '@ton/core';
import { TestInvoice } from '../wrappers/TestInvoice';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    console.log('🚀 Deploying TestInvoice contract...');

    // Create contract instance with initial configuration
    const testInvoice = provider.open(
        TestInvoice.createFromConfig(
            {
                nextInvoiceId: 0,
                invoiceCount: 0,
            },
            await compile('TestInvoice')
        )
    );

    console.log('📍 Contract address:', testInvoice.address.toString());

    // Deploy the contract
    console.log('💰 Deploying with 0.05 TON...');
    await testInvoice.sendDeploy(provider.sender(), toNano('0.05'));

    console.log('⏳ Waiting for deployment...');
    await provider.waitForDeploy(testInvoice.address);

    console.log('✅ Contract deployed successfully!');

    // Test initial state
    console.log('\n📊 Testing initial contract state...');
    try {
        const invoiceCount = await testInvoice.getInvoiceCount();
        const nextInvoiceId = await testInvoice.getNextInvoiceId();
        
        console.log(`📝 Initial invoice count: ${invoiceCount}`);
        console.log(`🔢 Next invoice ID: ${nextInvoiceId}`);
        
        // Test creating a sample invoice
        console.log('\n🧪 Creating a test invoice...');
        await testInvoice.sendAddInvoice(provider.sender(), {
            value: toNano('0.05'),
            description: BigInt(12345), // Sample description hash
            amount: toNano('5.5'), // 1.5 TON
            wallet: Address.parse('EQDr9DIuhFXzwWcH_HtSlVcqCJo4NYYvf25QsGET4rY3n8oL'), 
        });

        console.log('⏳ Waiting for invoice creation...');
        // Wait a bit for the transaction to be processed
        await new Promise(resolve => setTimeout(resolve, 5000));

        // Check updated state
        const newInvoiceCount = await testInvoice.getInvoiceCount();
        const newNextInvoiceId = await testInvoice.getNextInvoiceId();
        
        console.log(`📝 Updated invoice count: ${newInvoiceCount}`);
        console.log(`🔢 Updated next invoice ID: ${newNextInvoiceId}`);

        // Try to get the created invoice
        if (newInvoiceCount > 0) {
            console.log('\n📄 Retrieving created invoice...');
            const invoice = await testInvoice.getInvoice(0);
            if (invoice) {
                console.log(`📋 Invoice ID: ${invoice.invoiceId}`);
                console.log(`📝 Description: ${invoice.description}`);
                console.log(`💰 Amount: ${invoice.amount} nano-TON`);
                console.log(`👤 Wallet: ${invoice.wallet.toString()}`);
                console.log(`✅ Paid: ${invoice.paid}`);
            } else {
                console.log('❌ Could not retrieve invoice');
            }
        }

    } catch (error) {
        console.error('❌ Error testing contract:', error);
    }

    console.log('\n🎉 Deployment and initialization complete!');
    console.log(`📍 Contract deployed at: ${testInvoice.address.toString()}`);
}
