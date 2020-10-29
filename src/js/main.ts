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
    
    const activeUserList = [];
    const activeDocumentList = [];

    root.documentList(activeDocumentList);
    root.startRandomBehaviors();

    await new Promise((r) => setTimeout(r, 1e3));
    while (node.getCurrentTopBlock().getIndex() % 2) {
        await new Promise((r) => setTimeout(r, 1e2));
    }

    for (let i = 0; i < 100; i++) {
        setTimeout(async () => {
            const user = root.createUser();

            user.userList(activeUserList);
            user.documentList(activeDocumentList);

            while (node.getCurrentTopBlock().getIndex() % 2) {
                await new Promise((r) => setTimeout(r, 1e2));
            }

            root.insertUser(user);

            await new Promise((r) => setTimeout(r, Math.random() * 10e3));
            
            activeUserList.push(user);
            user.startRandomBehaviors();
        }, Math.random() * 100e3)
    }

    await new Promise((r) => setTimeout(r, 5e3));

    //user3.txnInsertDocument(1, 'President candidate');
});

//#region React

import * as React from 'react';
import * as ReactDom from 'react-dom';
import $ from 'react-json-syntax';
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