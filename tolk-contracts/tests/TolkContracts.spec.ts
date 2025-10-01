import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Cell, toNano } from '@ton/core';
import { TolkContracts } from '../wrappers/TolkContracts';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';

describe('TolkContracts', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('TolkContracts');
    });

    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let tolkContracts: SandboxContract<TolkContracts>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        tolkContracts = blockchain.openContract(
            TolkContracts.createFromConfig(
                {
                    id: 0,
                    counter: 0,
                },
                code
            )
        );

        deployer = await blockchain.treasury('deployer');

        const deployResult = await tolkContracts.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: tolkContracts.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and tolkContracts are ready to use
    });

    it('should increase counter', async () => {
        const increaseTimes = 3;
        for (let i = 0; i < increaseTimes; i++) {
            console.log(`increase ${i + 1}/${increaseTimes}`);

            const increaser = await blockchain.treasury('increaser' + i);

            const counterBefore = await tolkContracts.getCounter();

            console.log('counter before increasing', counterBefore);

            const increaseBy = Math.floor(Math.random() * 100);

            console.log('increasing by', increaseBy);

            const increaseResult = await tolkContracts.sendIncrease(increaser.getSender(), {
                increaseBy,
                value: toNano('0.05'),
            });

            expect(increaseResult.transactions).toHaveTransaction({
                from: increaser.address,
                to: tolkContracts.address,
                success: true,
            });

            const counterAfter = await tolkContracts.getCounter();

            console.log('counter after increasing', counterAfter);

            expect(counterAfter).toBe(counterBefore + increaseBy);
        }
    });

    it('should reset counter', async () => {
        const increaser = await blockchain.treasury('increaser');

        expect(await tolkContracts.getCounter()).toBe(0);

        const increaseBy = 5;
        await tolkContracts.sendIncrease(increaser.getSender(), {
            increaseBy,
            value: toNano('0.05'),
        });

        expect(await tolkContracts.getCounter()).toBe(increaseBy);

        await tolkContracts.sendReset(increaser.getSender(), {
            value: toNano('0.05'),
        });

        expect(await tolkContracts.getCounter()).toBe(0);
    });

    it('should create and manage invoices', async () => {
        const invoiceCreator = await blockchain.treasury('invoiceCreator');
        const clientWallet = await blockchain.treasury('client');

        // Check initial invoice count
        const initialCount = await tolkContracts.getInvoiceCount();
        expect(initialCount).toBe(0);

        const initialNextId = await tolkContracts.getNextInvoiceId();
        expect(initialNextId).toBe(0);

        // Create an invoice
        const createResult = await tolkContracts.sendAddInvoice(invoiceCreator.getSender(), {
            description: "Test Invoice",
            amount: toNano('1.5'),
            wallet: clientWallet.address,
            value: toNano('0.05'),
        });

        expect(createResult.transactions).toHaveTransaction({
            from: invoiceCreator.address,
            to: tolkContracts.address,
            success: true,
        });

        // Check updated counts
        const newCount = await tolkContracts.getInvoiceCount();
        expect(newCount).toBe(1);

        const newNextId = await tolkContracts.getNextInvoiceId();
        expect(newNextId).toBe(1);

        // Get the latest invoice
        const latestInvoice = await tolkContracts.getLatestInvoice();
        expect(latestInvoice).toBeTruthy();
        if (latestInvoice) {
            expect(latestInvoice.invoice_id).toBe(0);
            expect(latestInvoice.amount).toBe(toNano('1.5'));
            expect(latestInvoice.wallet.toString()).toBe(clientWallet.address.toString());
            expect(latestInvoice.paid).toBe(false);
        }

        // Update invoice status
        const updateResult = await tolkContracts.sendUpdateInvoice(invoiceCreator.getSender(), {
            invoiceId: 0,
            value: toNano('0.05'),
        });

        expect(updateResult.transactions).toHaveTransaction({
            from: invoiceCreator.address,
            to: tolkContracts.address,
            success: true,
        });

        // Check if invoice was marked as paid
        const updatedInvoice = await tolkContracts.getLatestInvoice();
        expect(updatedInvoice).toBeTruthy();
        if (updatedInvoice) {
            expect(updatedInvoice.paid).toBe(true);
        }
    });
});
