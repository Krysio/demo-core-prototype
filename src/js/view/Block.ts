import * as React from 'react';
import $, { JsonNode } from 'react-json-syntax';
import { Block } from '@/models/block';
import $$ from '@/models/structure';
import rTxn from "@/view/Txn";

/******************************/

export default class rBlock extends React.Component<{ block: Block }> {
    render() {
        const block = this.props.block;

        return $(
            ['div', { 'className': 'block' }, [
                ['span', { 'className': 'block-version', 'title': 'version' }, [
                    block.get('version').toBuffer().toString('hex')
                ]],
                ['span', { 'className': 'block-index', 'title': 'index' }, [
                    block.get('index').toBuffer().toString('hex')
                ]],
                ['span', { 'className': 'block-time', 'title': 'time' }, [
                    block.get('time').toBuffer().toString('hex')
                ]],
                ['span', { 'className': 'block-prevHash', 'title': 'prevHash' }, [
                    block.get('previousBlockHash').toBuffer().toString('hex')
                ]],
                ['span', { 'className': 'block-txnCount', 'title': 'txnCount' }, [
                    block.get('transactionCount').toBuffer().toString('hex')
                ]],
                ...(() => {
                    const count = block.getValue('transactionCount');
                    const body = block.get('body').getValue().seek(0);

                    const txnList = [];
                    for (let i = 0; i < count; i++) {
                        const txn = $$.create('TxnInternal').fromBuffer(body);

                        txnList.push([rTxn, { txn }]);
                    }
                    return txnList;
                })(),
                // ['span', [
                //     block.get('body').toBuffer().toString('hex')
                // ]],
            ]] as JsonNode
        );
    }
}
