import { toNano } from '@ton/core';
import { TolkContracts } from '../wrappers/TolkContracts';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const tolkContracts = provider.open(
        TolkContracts.createFromConfig(
            {
                id: Math.floor(Math.random() * 10000),
                counter: 0,
            },
            await compile('TolkContracts')
        )
    );

    await tolkContracts.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(tolkContracts.address);

    console.log('ID', await tolkContracts.getID());
}
