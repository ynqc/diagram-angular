import { DiagramPopover } from '../diagram-popover/diagram-popover';
import { NodeEventType } from '../diagram.model';
import { NOTE_TYPE } from './diagram-node-type';
import { DiagramNodesList } from './diagram-nodes-list';

export class DiagramNode {
    guid: string;
    parents: Set<string>;
    children: Set<string>;
    name: string;
    type: string;
    popover: DiagramPopover;
    condition?: string;
    branchs?: Array<any>;
    active?: boolean;
    otherInfo?: any;
    id: string;

    constructor(
        props,
        public getThisNodeList: () => DiagramNodesList
    ) {
        if (!props.guid) {
            return;
        }
        for (const prop in props) {
            if (props.hasOwnProperty(prop)) {
                this[prop] = props[prop];
            }
        }
        this.type = props.type || NOTE_TYPE.PARALLEL_GATEWAY;
        this.popover = props.popover;
        this.children = new Set(props.children as string[]);
        this.parents = new Set(props.parents as string[]);
    }

    addChild(event, condition?) {
        event.stopPropagation();
        this.popover.actions$.next({
            isOpen: true,
            anchor: event.target,
            targetId: this.guid,
            condition
        });
    }

    addCondition(event) {
        event.stopPropagation();
        const nodeList = this.getThisNodeList();
        const branch = nodeList.newBranchNode(this);
        this.branchs.push(branch);
        nodeList.calculateNodeWrapWidth(this);
    }

    isRoot() {
        return this.parents.has('Start');
    }

    destory(event, branch?) {
        event.stopPropagation();
        if (branch) {
            this.getThisNodeList().deleteBranch(this.guid, branch.guid);
        } else {
            this.getThisNodeList().deleteNode(this.guid);
        }
    }

    hasChildren() {
        return !!this.children.size;
    }

    hasParents() {
        return !!this.parents.size;
    }

    getConditionNodes(condition) {
        const conNodes = [];
        this.children.forEach(item => {
            const node = this.getThisNodeList().getNode(item);
            if (node.condition && node.condition === condition) {
                conNodes.push(item);
            }
        });
        return conNodes;
    }

    serializeNode() {
        const branchs = [];
        if (this.branchs && this.branchs.length > 0) {
            this.branchs.forEach(item => {
                branchs.push({
                    id: item.id,
                    guid: item.guid,
                    name: item.name,
                    type: item.type,
                    active: item.active,
                    condition: item.condition,
                    branchs: item.branchs,
                    parents: Array.from(item.parents),
                    children: Array.from(item.children),
                });
            });
        }
        const json = {
            guid: this.guid,
            name: this.name,
            type: this.type,
            id: this.id,
            condition: this.condition,
            branchs: branchs,
            active: this.active,
            otherInfo: this.otherInfo,
            parents: Array.from(this.parents),
            children: Array.from(this.children),
        };
        return json;
    }

    blurNodeEventEmit(service) {
        service.diagramConfig.events$.next({
            type: NodeEventType.blurNode,
            payload: this.serializeNode()
        });
    }

    clickNodeEventEmit(service) {
        service.diagramConfig.events$.next({
            type: NodeEventType.clickNode,
            payload: this.serializeNode()
        });
    }

    addNodeEventEmit(service, node) {
        service.diagramConfig.events$.next({
            type: NodeEventType.addkNode,
            payload: node
        });
    }
}
