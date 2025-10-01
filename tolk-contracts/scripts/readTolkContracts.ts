import { Address } from '@ton/core';
import { TolkContracts } from '../wrappers/TolkContracts';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider, args: string[]) {
    const ui = provider.ui();

    const address = Address.parse(args.length > 0 ? args[0] : await ui.input('TolkContracts address'));

    if (!(await provider.isContractDeployed(address))) {
        ui.write(`Error: Contract at address ${address} is not deployed!`);
        return;
    }

    const tolkContracts = provider.open(TolkContracts.createFromAddress(address));

    ui.write('Reading contract data...');

    const counter = await tolkContracts.getCounter();
    const id = await tolkContracts.getID();

    ui.write('\n=== Contract Data ===');
    ui.write(`Contract Address: ${address.toString()}`);
    ui.write(`Initial ID: ${id}`);
    ui.write(`Current Counter: ${counter}`);
    ui.write('====================\n');
}

