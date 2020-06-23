import debug from 'debug';

// debug logging

if (process.env.NODE_ENV === 'development') {
    debug.enable('app,app:*');
}
if (process.env.NODE_ENV === 'development') {
    window['dev'] = window['dev'] || {};
}

/******************************/

import * as dd from '@/models/test';
console.log(dd);

import * as React from 'react';
import * as ReactDom from 'react-dom';
import $, { JsonNode } from 'react-json-syntax';

/****************************** /

import Node from '@/models/node';
import { createGenesisiForFastTest } from '@/factories/block';
import {
    createAdmin, createUser, createPublicUser,
    removeUser
} from '@/factories/txn';
import { User, TYPE_USER_ROOT } from '@/models/user';


const node = new Node();
const genesis = createGenesisiForFastTest();
const user = User.create(TYPE_USER_ROOT);

Object.assign(global, {
    dev_node: node
});

user.setKey(genesis.rootKey.publicKey);
console.log(
    node, genesis,
    user, User.fromBuffer(user.toBuffer())
);
node.takeBlock(genesis.blockGenesis);

(async function () {
    await node.context.sync();

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
    const txnRemoveUser = removeUser({
        userId: 2,
        parentId: 0,
        parentPrivateKey: genesis.rootKey.privateKey,
        targetBlockIndex: topBlock.getIndex()
    });

    node.takeTransaction(txnCreateUser3.transaction);
    node.takeTransaction(txnRemoveUser.transaction);
})();

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