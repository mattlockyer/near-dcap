import test from 'ava';
import fs from 'fs';
import * as dotenv from 'dotenv';
dotenv.config();
const { accountId, REACT_APP_contractId: contractId } = process.env;
import * as nearAPI from 'near-api-js';

import {
    getAccount,
    contractView,
    contractCall,
    keyPair,
} from './near-provider.js';

// tests

// delete the contract account to clear storage state and re-run tests

test('delete, create contract account', async (t) => {
    try {
        const account = getAccount(contractId);
        await account.deleteAccount(accountId);
    } catch (e) {
        console.log('error deleteAccount', e);
    }

    try {
        const account = getAccount(accountId);
        await account.createAccount(
            contractId,
            keyPair.getPublicKey(),
            nearAPI.utils.format.parseNearAmount('10'),
        );
    } catch (e) {
        console.log('error createAccount', e);
    }
    t.pass();
});

test('deploy contract', async (t) => {
    const file = fs.readFileSync('./contract/target/near/contract.wasm');
    const account = getAccount(contractId);
    await account.deployContract(file);
    console.log('deployed bytes', file.byteLength);
    const balance = await account.getAccountBalance();
    console.log('contract balance', balance);

    t.pass();
});

test('init contract', async (t) => {
    await contractCall({
        contractId,
        methodName: 'init',
        args: {
            owner_id: accountId,
        },
    });

    t.pass();
});

test('call verify', async (t) => {
    const res = await contractCall({
        contractId,
        methodName: 'verify_quote',
        args: {
            hash: 'foo',
        },
    });

    console.log(res);

    t.pass();
});
