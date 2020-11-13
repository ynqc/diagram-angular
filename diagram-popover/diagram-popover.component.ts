/**
 * Created by Ella Ma on 2020/09/11.
 * ------ maintenance history ------
 */

import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { fromEvent, Subscription } from 'rxjs';
import { DiagramPopover, PopoverEventType } from './diagram-popover';

@Component({
    selector: 'tam-diagram-popover',
    templateUrl: './diagram-popover.component.html',
    styleUrls: ['./diagram-popover.component.scss']
})
export class DiagramPopoverComponent implements OnInit, OnDestroy {

    @Input() popover: DiagramPopover;

    anchor;
    isOpen;

    private _targetId;
    private _condition;
    private _outsideClick$: Subscription;

    private _destroySubscriptions: Array<Subscription> = [];
    constructor(
    ) { }

    ngOnInit() {
        this._destroySubscriptions.push(
            this.popover.actions$.subscribe((data) => {
                this.isOpen = data['isOpen'];
                this.anchor = data['anchor'];
                this._targetId = data['targetId'];
                this._condition = data['condition'];
            }),
        );
        this._outsideClick$ = fromEvent(document, 'click').subscribe(() => {
            this.isOpen = false;
        });
    }

    ngOnDestroy() {
        this._outsideClick$.unsubscribe();
        this._destroySubscriptions.forEach(subscription => subscription.unsubscribe());
    }

    onClick(event) {
        event.stopPropagation();
    }

    addNode(nodeType) {
        this.popover.events$.next({
            type: PopoverEventType.nodeAdd,
            payload: {
                nodeType: nodeType,
                targetId: this._targetId,
                condition: this._condition
            }
        });
        this.isOpen = false;
        this.anchor = null;
        this._condition = null;
    }
}
