import { Subject } from 'rxjs';

export enum NodeEventType {
    blurNode,
    clickNode,
    addkNode
}

export class DiagramConfig {
    nodes: Array<any>;
    actions$: Subject<any>;
    events$: Subject<{ type: NodeEventType, payload: any }>;
    constructor() {
        this.nodes = [];
        this.events$ = new Subject();
        this.actions$ = new Subject();
    }
}
