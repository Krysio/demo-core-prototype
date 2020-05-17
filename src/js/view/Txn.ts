import * as React from 'react';
import $, { JsonNode } from 'react-json-syntax';
import BufferWrapper from '@/libs/BufferWrapper';
import { Transaction } from '@/models/transaction';

/******************************/

export default class rTxn extends React.Component<{txn: Transaction}> {
    render() {
        const txn = this.props.txn;
        const data = txn.getData('buffer');
        const txnData = txn.toBuffer();

        return $(
            ['div', {'className': 'txn pl-4'}, [
                ['span', {'className': 'txn-size'}, [
                    BufferWrapper.numberToUleb128Buffer(txnData.length).toString('hex')
                ]],
                ['span', {'className': 'txn-type'}, [
                    txn.getType('buffer').toString('hex')
                ]],
                ['span', {'className': 'txn-blockHash'}, [
                    txn.getBlockHash('buffer').toString('hex')
                ]],
                ['span', {'className': 'txn-dataSize'}, [
                    BufferWrapper.numberToUleb128Buffer(data.length).toString('hex')
                ]],
                ['span', {'className': 'txn-data'}, [
                    data.toString('hex')
                ]],
            ]]
        );
    }
}
