import * as React from 'react';
import $, { JsonNode } from 'react-json-syntax';
import BufferWrapper from '@/libs/BufferWrapper';
import $$, { TxnInternal } from '@/models/structure';

/******************************/

export default class rTxn extends React.Component<{
    txn: TxnInternal
}> {
    render() {
        const txn = this.props.txn;

        return $(
            ['span', {'className': 'txn'}, [
                ...(() => {
                    const fieldList = [];
                    for (let key in txn['structure']) {
                        const field = txn.get(key as any);

                        fieldList.push(
                            ['span', {'className': `txn-${ key }`, 'title': key}, [
                                field.toBuffer().toString('hex')
                            ]]
                        );
                    }
                    return fieldList as JsonNode[];
                })()
            ]]
        );
    }
}
