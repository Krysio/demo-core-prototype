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

/******************************/

import BufferWrapper from "@/libs/BufferWrapper";
import Node from '@/models/node';
import { createGenesis } from "@/test";

const node = new Node();
const root = createGenesis(node);

Object.assign(global, {
    dev_node: node
});

node.context.events.once('node/topBlock/changed', async function () {
    const admin1 = root.createAdmin(1);
    const admin2 = root.createAdmin(1);
    const admin3 = root.createAdmin(2);
    const admin4 = root.createAdmin(2);
    const admin5 = root.createAdmin(2);

    root.insertAdmin(admin1);
    root.insertAdmin(admin2);
    root.insertAdmin(admin3);
    root.insertAdmin(admin4);
    root.insertAdmin(admin5);
    
    const activeUserList = [] as TestUser[];
    const activeDocumentList = [];

    root.documentList(activeDocumentList);
    root.startRandomBehaviors();

    await new Promise((r) => setTimeout(r, 1e3));
    while (node.getCurrentTopBlock().getIndex() % 2) {
        await new Promise((r) => setTimeout(r, 1e2));
    }

    for (let i = 0; i < 160; i++) {
        setTimeout(async () => {
            const user = root.createUser();

            user.userList(activeUserList);
            user.documentList(activeDocumentList);

            while (node.getCurrentTopBlock().getIndex() % 2) {
                await new Promise((r) => setTimeout(r, 1e2));
            }

            root.insertUser(user);
            const timeEnd = Date.now() + 1e3 * 60 * 5;

            await new Promise((r) => setTimeout(r, Math.random() * 1e3 + 5e3));
            
            activeUserList.push(user);
            user.startRandomBehaviors();

            await new Promise((r) => setTimeout(r, timeEnd - Date.now() - 2e3));
            user.stopRandomBehaviors();
            activeUserList.splice(activeUserList.indexOf(user), 1);
        }, Math.random() * 100e3)
    }

    await new Promise((r) => setTimeout(r, 16e3));

    (async function(){
        const testShuffle = (new TxnStandalone()).init().asType(TYPE_TXN_REPLACE_USERS);
        testShuffle.setValue('type', TYPE_TXN_REPLACE_USERS);
    
        const userList = [...activeUserList];
        const protoUserList = [];
        const authorList = [];
        const timeEnd = Date.now() + 60e3;
        const level = 1;
        const prevKeyMap = new Map();

        for (let user of userList) {
            const privateKey = user.privateKey();

            user.stopRandomBehaviors();
            authorList.push(user.id());

            user.createNewIdentity(level, timeEnd);

            prevKeyMap.set(user.id(), privateKey);

            const protoUser = $$.create('ProtoShadowUser')
                .setValue('userId', user.id());
            protoUser.get('key')
                .setValue('type', TYPE_KEY_Secp256k1)
                .setValue('data', BufferWrapper.create(user.publicKey()))

            protoUserList.push(protoUser);
        }

        const shuffleArray = arr => arr
            .map(a => [Math.random(), a])
            .sort((a, b) => a[0] - b[0])
            .map(a => a[1]);

        shuffleArray(protoUserList);
    
        testShuffle
        .setValue('authors', authorList)
        .setValue('signingBlockHash', node.getCurrentTopBlock().getHash())
        .get('data')
            .setValue('timeEnd', timeEnd)
            .setValue('level', level)
            .setValue('users', protoUserList);

        const hash = testShuffle.getHash();
        const signatureList = [];

        for (let user of userList) {
            const signature = $$.create('Signature')
                .setValue(user.sign(hash, prevKeyMap.get(user.id())) as BufferWrapper)

            signatureList.push(signature);
        }

        testShuffle.setValue('signatures', signatureList);

        node.takeTransaction(testShuffle);
        
        await new Promise((r) => setTimeout(r, Math.random() * 10e3));

        for (let user of userList) {
            user.startRandomBehaviors();
        }
    })();

    //user3.txnInsertDocument(1, 'President candidate');
});

//#region React

import * as React from 'react';
import * as ReactDom from 'react-dom';
import $ from 'react-json-syntax';
import rNode from "@/view/Node";
import $$, { TxnStandalone, TYPE_KEY_Secp256k1, TYPE_TXN_REPLACE_USERS } from './models/structure';
import { TestUser } from './test/User';

if (true) (function () {
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