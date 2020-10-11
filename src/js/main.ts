import debug from 'debug';

// debug logging

if (process.env.NODE_ENV === 'development') {
    debug.enable('app,app:*');
}
if (process.env.NODE_ENV === 'development') {
    window['dev'] = window['dev'] || {};
}

/******************************/

// import * as dd from '@/models/test';
// console.log(dd);

import * as React from 'react';
import * as ReactDom from 'react-dom';
import $, { JsonNode } from 'react-json-syntax';

/******************************/

import Node from '@/models/node';
import { createGenesisiForFastTest } from '@/factories/block';
import {
    createAdmin, createUser, createPublicUser,
    removeUser, insertDocument
} from '@/factories/txn';
import { TestUser } from "@/factories/TestUser";

const node = new Node();
const genesis = createGenesisiForFastTest();

Object.assign(global, {
    dev_node: node
});


node.takeBlock(genesis.blockGenesis);

node.context.events.once('node/topBlock/changed', async function () {
    let topBlock = node.getCurrentTopBlock();

    const txnCreateAdmin1 = createAdmin({
        userId: 1,
        level: 1,
        targetBlockIndex: topBlock.getIndex(),
        parentId: 0,
        parentPrivateKey: genesis.rootKey.privateKey
    });

    const txnCreateAdmin2 = createAdmin({
        userId: 2,
        level: 1,
        targetBlockIndex: topBlock.getIndex(),
        parentId: 0,
        parentPrivateKey: genesis.rootKey.privateKey
    });
    const txnCreateUser1 = createUser({
        userId: 100,
        targetBlockIndex: topBlock.getIndex(),
        parentId: 0,
        parentPrivateKey: genesis.rootKey.privateKey,
        timeEnd: Date.now() + 1e3 * 60 * 5,
        timeStart: Date.now()
    });
    const txnCreateUser2 = createUser({
        userId: 101,
        targetBlockIndex: topBlock.getIndex(),
        parentId: 0,
        parentPrivateKey: genesis.rootKey.privateKey,
        timeEnd: Date.now() + 1e3 * 60 * 5,
        timeStart: Date.now()
    });
    const txnCreatePublicUser1 = createPublicUser({
        userId: 200,
        targetBlockIndex: topBlock.getIndex(),
        parentId: 0,
        parentPrivateKey: genesis.rootKey.privateKey
    });

    node.takeTransaction(txnCreateAdmin1.transaction);
    node.takeTransaction(txnCreateAdmin2.transaction);
    node.takeTransaction(txnCreateUser1.transaction);
    node.takeTransaction(txnCreateUser2.transaction);
    node.takeTransaction(txnCreatePublicUser1.transaction);

    await new Promise((r) => setTimeout(r, 5e3));

    topBlock = node.getCurrentTopBlock();

    const txnCreateUser3 = createUser({
        userId: 102,
        targetBlockIndex: topBlock.getIndex(),
        parentId: txnCreateAdmin1.id,
        parentPrivateKey: txnCreateAdmin1.privateKey,
        timeEnd: Date.now() + 1e3 * 60 * 5,
        timeStart: Date.now()
    });

    const testUser3 = (new TestUser(node))
        .id(102)
        .privateKey(txnCreateUser3.privateKey)
        .publicKey(txnCreateUser3.publicKey);

    const txnRemoveUser = removeUser({
        userId: 2,
        parentId: 0,
        parentPrivateKey: genesis.rootKey.privateKey,
        targetBlockIndex: topBlock.getIndex()
    });

    node.takeTransaction(txnCreateUser3.transaction);
    node.takeTransaction(txnRemoveUser.transaction);

    await new Promise((r) => setTimeout(r, 5e3));

    testUser3.txnInsertDocument(1, 'President candidate');
});

//#region React

import rNode from "@/view/Node";

(function () {
    window.document.getElementById('loader').remove();

    // view;
    const appView: React.ReactElement = $([rNode, { node }]);

    ReactDom.render(
        appView,
        window.document.getElementById('root')
    );
})();

//#endregion

//*/