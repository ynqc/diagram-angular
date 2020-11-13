/**
 * Created by Ella Ma on 2020/09/11.
 * ------ maintenance history ------
 */

import { Component, ElementRef, Input, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { Subscription } from 'rxjs';
import { DiagramPopover, PopoverEventType } from './diagram-popover/diagram-popover';
import { DiagramConfig } from './diagram.model';
import { DiagramService } from './diagram.service';

@Component({
    selector: 'tam-diagram',
    templateUrl: './diagram.component.html',
    styleUrls: ['./diagram.component.scss']
})
export class DiagramComponent implements OnInit, OnDestroy {

    @Input() config: DiagramConfig;

    nodes;
    popover = new DiagramPopover();

    private _destroySubscriptions: Array<Subscription> = [];
    private _diagramNodeContainerEl;

    constructor(
        private _elementRef: ElementRef,
        private _r2: Renderer2,
        private _nodesService: DiagramService
    ) { }

    ngOnInit() {
        this._nodesService.setDiagramConfig(this.config);
        this.nodes = this._nodesService.loadNodes(this.config.nodes);
        this._diagramNodeContainerEl = this._elementRef.nativeElement.querySelector('.container');
        this._destroySubscriptions.push(
            this.popover.events$.subscribe((event) => {
                if (event.type === PopoverEventType.nodeAdd) {
                    this._nodesService.newNode({
                        type: event.payload.nodeType,
                        targetId: event.payload.targetId || 'Start',
                        condition: event.payload.condition,
                        popover: this.popover,
                    });
                } else if (event.type === PopoverEventType.resetWidth) {
                    this._calculateNodeWrapWidth();
                }
            })
        );
    }

    openPopover(event, el) {
        event.stopPropagation();
        this.popover.actions$.next({
            isOpen: true,
            anchor: el
        });
    }

    ngOnDestroy() {
        this._nodesService.destory();
        this._destroySubscriptions.forEach(subscription => subscription.unsubscribe());
    }

    /**
     * when add some branch node and input node, the container will show scrollbar, so it's width will be added, the function to align center all nodes
     * node-wrap is text-node, start-node, end-node
     * branch-wrap is branch-node
     * only node width >= page.clientWidth, when page.clientWidth chagne, node width change, if node width < page.clientWidth, page.clientWidth change, node width do not change
     */
    private _calculateNodeWrapWidth() {
        setTimeout(() => {
            const arr = [];
            this._elementRef.nativeElement.querySelectorAll('.branch-box').forEach(element => {
                arr.push(element.clientWidth);
            });
            const scrollWidth = this._diagramNodeContainerEl.scrollWidth;
            const contentWidth = Math.max.apply(null, arr);
            const clientWidth = this._diagramNodeContainerEl.clientWidth;
            const diagramNodeEl = this._elementRef.nativeElement.querySelectorAll('.node-wrap');
            const diagramBranchNodeEl = this._elementRef.nativeElement.querySelectorAll('.branch-wrap');
            if (contentWidth > clientWidth) {
                diagramNodeEl.forEach(element => {
                    if (element.clientWidth >= clientWidth) {
                        this._r2.setStyle(element, 'width', contentWidth + 'px');
                    } else {
                        this._r2.setStyle(element, 'width', '100%');
                    }
                });
                diagramBranchNodeEl.forEach(element => {
                    if (element.clientWidth >= clientWidth) {
                        this._r2.setStyle(element, 'width', contentWidth + 'px');
                    } else {
                        this._r2.setStyle(element, 'width', '100%');
                    }
                });
            } else {
                diagramNodeEl.forEach(element => {
                    this._r2.setStyle(element, 'width', '100%');
                });
                diagramBranchNodeEl.forEach(element => {
                    this._r2.setStyle(element, 'width', '100%');
                });
            }
        }, 0);

    }
}
