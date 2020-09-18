import * as React from 'react';
import $, { JsonNode } from 'react-json-syntax';
import Node from '@/models/node';
import { Block } from '@/models/block';
import rBlock from "@/view/Block";
import BufferWrapper from '@/libs/BufferWrapper';

/******************************/

export default class rNode extends React.Component<{node: Node}> {
    blockList = [] as Block[];

    componentDidMount() {
        this.props.node.context.events.on("node/topBlock/changed", (block) => {
            this.blockList.push(block);
            this.forceUpdate();
        });
    }

    render() {
        const node = this.props.node;

        return $(
            ['div', {'className': 'row'}, [
                ['div', {'className': 'col-9'}, [
                    ['div', {'className': 'node text-white p-5'}, this.blockList.map((block) => (
                        [rBlock, { block }] as JsonNode
                    ))]
                ]],
                ['div', {'className': 'col-3'}, [
                    ['pre', {'className': 'p-1 text-white'}, [
                        JSON.stringify(node.context.state, null, ' ')
                    ]]
                ]]
            ]]
        );
    }
}
