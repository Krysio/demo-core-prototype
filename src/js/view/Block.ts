import * as React from 'react';
import $, { JsonNode } from 'react-json-syntax';
import BufferWrapper from '@/libs/BufferWrapper';
import { Block } from '@/models/block';
import { Txn } from '@/models/transaction';
import rTxn from "@/view/Txn";

/******************************/

export default class rBlock extends React.Component<{block: Block}> {
    render() {
        const block = this.props.block;

        return $(
            ['div', {'className': 'block'}, [
                ['span', {'className': 'block-index'}, [
                    block.getIndex('buffer').toString('hex')
                ]],
                ['span', {'className': 'block-time'}, [
                    block.getTime('buffer').toString('hex')
                ]],
                ['span', {'className': 'block-prevHash'}, [
                    block.getPreviousBlockHash('buffer').toString('hex')
                ]],
                ['span', {'className': 'block-bodySize'}, [
                    BufferWrapper.numberToUleb128Buffer(block.getBody().length).toString('hex')
                ]],
                ...block.getBody().map((txnData) => {
                    const txn = Txn.fromBuffer(txnData);
                    const size = txnData.length;

                    return [rTxn, { txn, size }];
                })
            ]] as JsonNode
        );
    }
}
