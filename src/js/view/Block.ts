import * as React from 'react';
import $, { JsonNode } from 'react-json-syntax';
import BufferWrapper from '@/libs/BufferWrapper';
import { Block } from '@/models/block';
import { Txn } from '@/models/transaction';
import rTxn from "@/view/Txn";
import { Blob } from '@/models/structure';

/******************************/

export default class rBlock extends React.Component<{ block: Block }> {
    render() {
        const block = this.props.block;

        return $(
            ['div', { 'className': 'block' }, [
                ['span', { 'className': 'block-version' }, [
                    block.get('version').toBuffer().toString('hex')
                ]],
                ['span', { 'className': 'block-index' }, [
                    block.get('index').toBuffer().toString('hex')
                ]],
                ['span', { 'className': 'block-time' }, [
                    block.get('time').toBuffer().toString('hex')
                ]],
                ['span', { 'className': 'block-prevHash' }, [
                    block.get('previousBlockHash').toBuffer().toString('hex')
                ]],
                ['span', { 'className': 'block-bodySize' }, [
                    block.get('transactionCount').toBuffer().toString('hex')
                ]],
                // ...block.getBody().map((txnData) => {
                //     const txn = Txn.fromBuffer(txnData);
                //     const size = txnData.length;

                //     return [rTxn, { txn, size }];
                // })
                ['span', [
                    block.get('body').toBuffer().toString('hex')
                ]],
            ]] as JsonNode
        );
    }
}
