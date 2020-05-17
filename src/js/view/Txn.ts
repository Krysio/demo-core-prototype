import * as React from 'react';
import $, { JsonNode } from 'react-json-syntax';
import BufferWrapper from '@/libs/BufferWrapper';
import { TxnAny, TxnTypeInternal, TxnTypeAdmin } from '@/models/transaction';

/******************************/

export default class rTxn extends React.Component<{
    txn: TxnAny,
    size: number
}> {
    render() {
        const txn = this.props.txn;
        const data = txn.getData('buffer');

        return $(
            ['div', {'className': 'txn pl-4'}, [
                ['span', {'className': 'txn-size'}, [
                    BufferWrapper.numberToUleb128Buffer(this.props.size).toString('hex')
                ]],
                ...(() => {
                    if (txn instanceof TxnTypeInternal) {
                        return [
                            ['span', {'className': 'txn-type'}, [
                                txn.getType('buffer').toString('hex')
                            ]],
                            ['span', {'className': 'txn-dataSize'}, [
                                BufferWrapper.numberToUleb128Buffer(data.length).toString('hex')
                            ]],
                            ['span', {'className': 'txn-data'}, [
                                data.toString('hex')
                            ]]
                        ] as JsonNode[];
                    }
                    if (txn instanceof TxnTypeAdmin) {
                        const signature = txn.getSignature();

                        return [
                            ['span', {'className': 'txn-type'}, [
                                txn.getType('buffer').toString('hex')
                            ]],
                            ['span', {'className': 'txn-dataSize'}, [
                                BufferWrapper.numberToUleb128Buffer(data.length).toString('hex')
                            ]],
                            ['span', {'className': 'txn-data'}, [
                                data.toString('hex')
                            ]],
                            ['span', {'className': 'txn-signedBlock-index'}, [
                                txn.getSigningBlockIndex('buffer').toString('hex')
                            ]],
                            ['span', {'className': 'txn-authorId'}, [
                                txn.getAuthorId('buffer').toString('hex')
                            ]],
                            ['span', {'className': 'txn-signatureSize'}, [
                                BufferWrapper.numberToUleb128Buffer(signature.length).toString('hex')
                            ]],
                            ['span', {'className': 'txn-signature'}, [
                                signature.toString('hex')
                            ]]
                        ] as JsonNode[];
                    }
                })()
            ]]
        );
    }
}
