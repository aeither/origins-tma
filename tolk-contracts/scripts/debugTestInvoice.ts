import { toNano, Address } from '@ton/core';
import { TestInvoice } from '../wrappers/TestInvoice';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const ui = provider.ui();
    const address = Address.parse(await ui.input('TestInvoice address'));
    
    console.log(`🔗 Checking if contract is deployed at: ${address.toString()}`);
    
    let isDeployed = false;
    let retries = 3;
    
    while (retries > 0 && !isDeployed) {
        try {
            isDeployed = await provider.isContractDeployed(address);
            if (!isDeployed) {
                console.log(`❌ Contract not deployed at address ${address.toString()}`);
                return;
            }
            console.log(`✅ Contract is deployed`);
            break;
        } catch (error) {
            retries--;
            console.log(`⚠️  Network error checking deployment (${retries} retries left):`, (error as Error).message);
            if (retries > 0) {
                console.log(`⏳ Waiting 3 seconds before retry...`);
                await new Promise(resolve => setTimeout(resolve, 3000));
            } else {
                console.log(`❌ Failed to check contract deployment after multiple attempts`);
                console.log(`🔄 Continuing anyway - assuming contract is deployed...`);
                break;
            }
        }
    }

    const testInvoice = provider.open(TestInvoice.createFromAddress(address));

    console.log('🔍 Debug TestInvoice contract...');

    // Helper function for retrying network calls
    async function retryCall<T>(fn: () => Promise<T>, description: string, maxRetries = 3): Promise<T | null> {
        for (let i = 0; i < maxRetries; i++) {
            try {
                return await fn();
            } catch (error) {
                console.log(`⚠️  ${description} failed (attempt ${i + 1}/${maxRetries}):`, (error as Error).message);
                if (i < maxRetries - 1) {
                    console.log(`⏳ Waiting 2 seconds before retry...`);
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }
            }
        }
        return null;
    }

    try {
        // Get current state
        console.log('📊 Getting basic contract state...');
        
        const invoiceCount = await retryCall(
            () => testInvoice.getInvoiceCount(),
            'Getting invoice count'
        );
        
        const nextInvoiceId = await retryCall(
            () => testInvoice.getNextInvoiceId(),
            'Getting next invoice ID'
        );
        
        if (invoiceCount === null || nextInvoiceId === null) {
            console.log('❌ Failed to get basic contract state');
            return;
        }
        
        console.log(`  📝 Invoice count: ${invoiceCount}`);
        console.log(`  🔢 Next invoice ID: ${nextInvoiceId}`);

        // Try to get individual invoices if any exist
        if (invoiceCount > 0) {
            console.log('\n📄 Trying to get individual invoices:');
            for (let i = 0; i < nextInvoiceId; i++) {
                console.log(`  🔍 Checking invoice ID ${i}...`);
                const invoice = await retryCall(
                    () => testInvoice.getInvoice(i),
                    `Getting invoice #${i}`
                );
                
                if (invoice) {
                    console.log(`    ✅ Found invoice #${invoice.invoiceId}:`);
                    console.log(`      📝 Description: ${invoice.description}`);
                    console.log(`      💰 Amount: ${Number(invoice.amount) / 1e9} TON`);
                    console.log(`      👤 Wallet: ${invoice.wallet.toString()}`);
                    console.log(`      💳 Paid: ${invoice.paid ? '✅' : '❌'}`);
                } else {
                    console.log(`    ❌ Invoice #${i} not found or failed to retrieve`);
                }
            }
        }

        // Test the get_all_invoices method through the contract wrapper
        console.log('\n📋 Testing get_all_invoices method directly:');
        try {
            // We'll use the contract instance to call the method directly
            const contractProvider = testInvoice as any;
            if (contractProvider.provider) {
                const result = await contractProvider.provider.get('get_all_invoices', []);
                console.log(`  📊 Raw result stack remaining: ${result.stack.remaining}`);
                
                if (result.stack.remaining > 0) {
                    console.log(`  🔍 Stack has content, attempting to read...`);
                } else {
                    console.log(`  📄 Stack is empty - no invoices returned`);
                }
            } else {
                console.log('  ❌ Cannot access provider directly');
            }
        } catch (error) {
            console.log(`  ❌ Error calling get_all_invoices:`, (error as Error).message || error);
        }

        // Try the wrapper method
        console.log('\n🔧 Testing wrapper getAllInvoices method:');
        const allInvoices = await retryCall(
            () => testInvoice.getAllInvoices(),
            'Getting all invoices'
        );
        
        if (allInvoices !== null) {
            console.log(`  ✅ Successfully got ${allInvoices.length} invoices`);
            
            if (allInvoices.length > 0) {
                allInvoices.forEach((invoice, index) => {
                    console.log(`    ${index + 1}. Invoice #${invoice.invoiceId}:`);
                    console.log(`       💰 Amount: ${Number(invoice.amount) / 1e9} TON`);
                    console.log(`       💳 Paid: ${invoice.paid ? '✅' : '❌'}`);
                    console.log(`       👤 Wallet: ${invoice.wallet.toString()}`);
                });
            } else {
                console.log(`    📄 No invoices found in the contract`);
            }
        } else {
            console.log(`  ❌ Failed to get invoices after multiple attempts`);
        }

    } catch (error) {
        console.error('❌ Error in debug script:', error);
    }

    console.log('\n🎉 Debug complete!');
}