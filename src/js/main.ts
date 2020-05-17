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
import { User, TYPE_USER_ROOT } from '@/models/user';

const node = new Node();
const genesis = createGenesisiForFastTest();
const user = User.create(TYPE_USER_ROOT);
import { Txn } from './models/transaction';

user.setKey(genesis.rootKey.publicKey);
console.log(
    node, genesis,
    user, User.fromBuffer(user.toBuffer()),
    genesis.txn.dbHashList, Txn.fromBuffer(genesis.txn.dbHashList.toBuffer())
);
node.takeBlock(genesis.blockGenesis);

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
