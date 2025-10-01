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

    await tolkContracts.sendReset(provider.sender(), {
        value: toNano('0.05'),
    });

    ui.write('Waiting for counter to reset...');

    let counterAfter = await tolkContracts.getCounter();
    let attempt = 1;
    while (counterAfter !== 0) {
        ui.setActionPrompt(`Attempt ${attempt}`);
        await sleep(2000);
        counterAfter = await tolkContracts.getCounter();
        attempt++;
    }

    ui.clearActionPrompt();
    ui.write('Counter reset successfully!');
}
