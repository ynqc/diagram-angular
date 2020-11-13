import { Subject } from 'rxjs';

export enum PopoverEventType {
    nodeAdd,
    resetWidth
}

export class DiagramPopover {
    actions$: Subject<any>;
    events$: Subject<{ type: PopoverEventType, payload: any }>;
    constructor() {
        this.events$ = new Subject();
        this.actions$ = new Subject();
    }
}
