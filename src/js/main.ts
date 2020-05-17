import debug from 'debug';

// debug logging

if (process.env.NODE_ENV === 'development') {
    debug.enable('app,app:*');
}
if (process.env.NODE_ENV === 'development') {
    window['dev'] = window['dev'] || {};
}

/******************************/

import * as React from 'react';
import * as ReactDom from 'react-dom';
import $, { JsonNode } from 'react-json-syntax';

/******************************/

import Node from '@/models/node';
import { createGenesisiForFastTest } from '@/factories/block';
import { createAdmin } from '@/factories/txn';
import { User, TYPE_USER_ROOT } from '@/models/user';

const node = new Node();
const genesis = createGenesisiForFastTest();
const user = User.create(TYPE_USER_ROOT);

user.setKey(genesis.rootKey.publicKey);
console.log(
    node, genesis,
    user, User.fromBuffer(user.toBuffer())
);
node.takeBlock(genesis.blockGenesis);
node.context.sync().then(() => {
    const topBlock = node.getCurrentTopBlock();

    const txnCreateAdmin1 = createAdmin({
        level: 1,
        targetBlockIndex: topBlock.getIndex(),
        parentPrivateKey: genesis.rootKey.privateKey
    });
    const txnCreateAdmin2 = createAdmin({
        level: 1,
        targetBlockIndex: topBlock.getIndex(),
        parentPrivateKey: genesis.rootKey.privateKey
    });

    node.takeTransaction(txnCreateAdmin1.txn);
    node.takeTransaction(txnCreateAdmin2.txn);
});

/******************************/

import rNode from "@/view/Node";

(function(){
    window.document.getElementById('loader').remove();

    // view;
    const appView: React.ReactElement = $([rNode, { node }]);

    /******************************/

    ReactDom.render(
        appView,
        window.document.getElementById('root')
    );
})();

/******************************/
