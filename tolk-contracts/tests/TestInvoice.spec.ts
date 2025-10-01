import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Cell, toNano } from '@ton/core';
import { TestInvoice } from '../wrappers/TestInvoice';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';

describe('TestInvoice', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('TestInvoice');
    });

    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let testInvoice: SandboxContract<TestInvoice>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        testInvoice = blockchain.openContract(TestInvoice.createFromConfig({}, code));

        deployer = await blockchain.treasury('deployer');

        const deployResult = await testInvoice.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: testInvoice.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and testInvoice are ready to use
    });
});
