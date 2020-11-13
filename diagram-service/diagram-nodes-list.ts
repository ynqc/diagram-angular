import { DiagramNode } from './diagram-node';
import * as _ from 'lodash';
import { NOTE_TYPE } from './diagram-node-type';
import { PopoverEventType } from '../diagram-popover/diagram-popover';

export const START_NODE = 'Start';

export class DiagramNodesList {
    private nodesList: Map<string, DiagramNode>;
    private nodeTemplate = {
        name: '',
        children: [],
        guid: '',
        parents: [],
        type: NOTE_TYPE.INPUT_TASK,
        popover: null,
        condition: '',
        branchs: [],
        active: true
    };
    roots: DiagramNode[];

    constructor(nodes: any[]) {
        this.nodesList = new Map();
        nodes.forEach(treeNode => {
            this.nodesList.set(
                treeNode.guid,
                new DiagramNode(treeNode, this.getThisNodeList.bind(this))
            );
        });
        this._makeRoots();
    }

    deleteNode(guid: string) {
        const target = this.getNode(guid);
        if (target.hasParents()) {
            target.parents.forEach(item => {
                const parent = this.getNode(item);
                if (parent) {
                    parent.children.delete(guid);
                    if (target.hasChildren()) {
                        target.children.forEach((child: string) => {
                            parent.children.add(child);
                        });
                    }
                }
            });
        }
        if (target.hasChildren()) {
            target.children.forEach((item) => {
                const child = this.getNode(item);
                child.condition = target.condition;
                child.parents.delete(guid);
                if (target.hasParents()) {
                    target.parents.forEach(parent => {
                        child.parents.add(parent);
                    });
                }
            });
        }
        this.nodesList.delete(guid);
        this._makeRoots();
        this.calculateNodeWrapWidth(target);
    }

    deleteBranch(nodeGuid, branchGuid) {
        const target = this.getNode(nodeGuid);
        const branchIndex = target.branchs.findIndex(item => item.guid === branchGuid);
        const deleteNodes = [];
        if (target.hasChildren()) {
            target.children.forEach(item => {
                const tempNode = this.getNode(item);
                if (tempNode.condition === branchGuid) {
                    deleteNodes.push(item);
                    this._getAllChildrenNode(deleteNodes, item);
                }
            });
        }
        // delete branch
        target.branchs.splice(branchIndex, 1);
        // delete all branch node
        deleteNodes.forEach(guid => {
            target.children.delete(guid);
            this.nodesList.delete(guid);
        });
        // if only has one branch, the node will change input type
        if (target.branchs.length === 1) {
            let branchChildNode;
            // update target node - child node, branch node
            if (target.hasChildren()) {
                // set branch node is parent node
                target.children.forEach(item => {
                    const tempNode = this.getNode(item);
                    if (tempNode.condition === target.branchs[0].guid) {
                        tempNode.condition = target.condition;
                        tempNode.parents.delete(target.guid);
                        target.parents.forEach(parent => {
                            tempNode.parents.add(parent);
                        });
                        branchChildNode = tempNode;
                    }
                });
                if (!branchChildNode) { // if the branch has not branch child, set other child parents
                    target.children.forEach(item => {
                        const tempNode = this.getNode(item);
                        tempNode.parents.delete(target.guid);
                        target.parents.forEach(parent => {
                            tempNode.parents.add(parent);
                        });
                    });
                } else {
                    // if the branch has branch child, set other child parents is lastest branch node
                    if (target.children.size !== 1) {
                        const newParentNode = this._getLastChildNode(branchChildNode.guid);
                        target.children.forEach(item => {
                            const tempNode = this.getNode(item);
                            if (tempNode.condition === 'none' && item !== newParentNode.guid) {
                                tempNode.parents.delete(target.guid);
                                tempNode.parents.add(newParentNode.guid);
                                newParentNode.children.add(item);
                            }
                        });
                    }
                }
            }
            // update targer parent node
            if (target.hasParents()) {
                target.parents.forEach(item => {
                    const parent = this.getNode(item);
                    if (parent) {
                        parent.children.delete(nodeGuid);
                        if (branchChildNode) {
                            parent.children.add(branchChildNode.guid);
                        } else {
                            if (target.hasChildren()) {
                                target.children.forEach((child: string) => {
                                    parent.children.add(child);
                                });
                            }
                        }
                    }
                });
            }
            // delete the node directly
            this.nodesList.delete(nodeGuid);
        }
        this._makeRoots();
        this.calculateNodeWrapWidth(target);
    }

    destory() {
        const nodes = Array.from(this.values());
        nodes.forEach(node => {
            this.nodesList.delete(node.guid);
        });
        this._makeRoots();
    }

    getRootNote() {
        let node;
        this.nodesList.forEach(item => {
            if (item.parents.has(START_NODE)) {
                node = item;
            }
        });
        return node;
    }

    getNode(guid: string): DiagramNode {
        return this.nodesList.get(guid);
    }

    getThisNodeList() {
        return this;
    }

    serialize() {
        const out = [];
        this.nodesList.forEach((node: DiagramNode) => {
            const branchs = [];
            if (node.branchs && node.branchs.length > 0) {
                node.branchs.forEach(item => {
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
            const json: any = {
                id: node.id,
                guid: node.guid,
                name: node.name,
                type: node.type,
                condition: node.condition,
                branchs: branchs,
                otherInfo: node.otherInfo,
                parents: Array.from(node.parents),
                children: Array.from(node.children),
            };
            out.push(json);
        });
        return out;
    }

    values() {
        return this.nodesList.values();
    }

    setNodeId(guid, id) {
        const target = this.getNode(guid);
        target.id = id;
    }

    updateNode(guid, data) {
        let target = this.getNode(guid);
        target = Object.assign(target, data);
    }

    newNode(data, service) {
        const newNodeTemplate = Object.assign({}, this.nodeTemplate);
        newNodeTemplate.guid = this._uuidv4();
        newNodeTemplate.type = data.type;
        newNodeTemplate.branchs = [];
        if (data.condition) {
            newNodeTemplate.condition = data.condition;
        }
        newNodeTemplate.popover = data.popover;
        this.nodesList.set(
            newNodeTemplate.guid,
            new DiagramNode(
                newNodeTemplate,
                this.getThisNodeList.bind(this)
            )
        );
        const newNode = this.getNode(newNodeTemplate.guid);
        const targertNodeId = data.targetId;
        let effectNotes = [];
        if (targertNodeId === START_NODE) {
            this.nodesList.forEach(item => {
                if (item.parents.has(START_NODE)) {
                    effectNotes.push(item.guid);
                }
            });
            if (newNode.type === NOTE_TYPE.PARALLEL_GATEWAY) {
                effectNotes.forEach(item => {
                    const tempNode = this.getNode(item);
                    tempNode.condition = 'none';
                });
            }
        } else {
            const targetNode = this.getNode(targertNodeId);
            if (targetNode.type === NOTE_TYPE.INPUT_TASK) {
                effectNotes = Array.from(targetNode.children);
                effectNotes.forEach(item => {
                    const tempNode = this.getNode(item);
                    tempNode.condition = 'none';
                });
                targetNode.children.clear();
            } else if (targetNode.type === NOTE_TYPE.PARALLEL_GATEWAY) {
                targetNode.children.forEach(item => {
                    const tempNode = this.getNode(item);
                    if (tempNode.condition === newNode.condition) {
                        tempNode.condition = 'none';
                        effectNotes.push(item);
                    }
                });
                effectNotes.forEach(item => {
                    targetNode.children.delete(item);
                });
            }
            targetNode.children.add(newNodeTemplate.guid);
        }
        newNode.parents.add(targertNodeId);
        effectNotes.forEach(element => {
            newNode.children.add(element);
            const tempNode = this.getNode(element);
            tempNode.parents.delete(targertNodeId);
            tempNode.parents.add(newNodeTemplate.guid);
        });
        if (data.type === NOTE_TYPE.PARALLEL_GATEWAY) {
            const branch_1 = this.newBranchNode(newNode);
            const branch_2 = this.newBranchNode(newNode);
            newNode.branchs.push(branch_1, branch_2);
        }
        this.nodesList.forEach(item => {
            item.active = item.guid === newNodeTemplate.guid;
        });
        this._makeRoots();
        this.calculateNodeWrapWidth(newNode);
        newNode.addNodeEventEmit(service, newNode);
    }

    calculateNodeWrapWidth(node) {
        if (node.popover) {
            node.popover.events$.next({
                type: PopoverEventType.resetWidth
            });
        }
    }

    newBranchNode(node) {
        const newNodeTemplate = Object.assign({}, this.nodeTemplate);
        newNodeTemplate.guid = this._uuidv4();
        newNodeTemplate.type = NOTE_TYPE.INPUT_TASK;
        newNodeTemplate.popover = node.popover;
        newNodeTemplate.parents = node.parents;
        newNodeTemplate.branchs = [];
        newNodeTemplate.active = true;
        node.branchs.forEach(item => {
            item.active = item.guid === newNodeTemplate.guid;
        });
        return newNodeTemplate;
    }

    private _uuidv4() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            // tslint:disable-next-line:one-variable-per-declaration no-bitwise
            const r = (Math.random() * 16) | 0;
            // tslint:disable-next-line:triple-equals no-bitwise
            const v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }

    private _makeRoots() { // refresh diagram page
        this.roots = Array.from(this.values()).filter((node: DiagramNode) =>
            node.isRoot()
        );
    }

    private _getAllChildrenNode(children = [], guid) {
        const node = this.getNode(guid);
        if (node.hasChildren()) {
            node.children.forEach(item => {
                children.push(item);
                this._getAllChildrenNode(children, item);
            });
        }
        return children;
    }

    private _getLastChildNode(guid, tempNode = null) {
        const node = this.getNode(guid);
        if (node.hasChildren()) {
            node.children.forEach(item => {
                const child = this.getNode(item);
                if (!child.condition || child.condition === 'none') {
                    tempNode = this._getLastChildNode(item, tempNode);
                } else {
                    tempNode = node;
                }
            });
        } else {
            tempNode = node;
        }
        return tempNode;
    }
}
