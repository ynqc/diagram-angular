/**
 * Created by Ella Ma on 2020/09/11.
 * ------ maintenance history ------
 */

import { AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { DiagramNode } from '../diagram-service';
import { DiagramService } from '../diagram.service';

@Component({
    selector: 'tam-diagram-textbox-node',
    templateUrl: './diagram-textbox-node.component.html',
    styleUrls: ['./diagram-node.component.scss']
})
export class DiagramTextBoxNodeComponent implements OnInit, AfterViewInit, OnDestroy {

    @Input() set nodeId(guid) {
        this.node = this._nodesService.getNode(guid);
    }
    @ViewChild('valueInput', { static: false }) valueInputEl: ElementRef;

    node: DiagramNode;
    showInput;

    private _defaultName;
    private _destroySubscriptions: Array<Subscription> = [];

    constructor(
        private _nodesService: DiagramService,
    ) { }

    ngOnInit() {
        this._defaultName = this.node.name.trim();
        if (this._defaultName.length > 64) {
            this.showInput = true;
        } else {
            this.showInput = !this.node.name.trim();
        }
    }

    ngAfterViewInit() {
        this._setInputFocus();
    }

    ngOnDestroy() {
        this._destroySubscriptions.forEach(subscription => subscription.unsubscribe());
    }

    onClickEvent(event) {
        event.stopPropagation();
        this.node.clickNodeEventEmit(this._nodesService);
    }

    onDblclick() {
        // this.showInput = true;
        // this._setInputFocus();
    }

    onkeydown(event) {
        if (event.keyCode === 13) {
            this.showInput = false;
            this.onBlur(event);
        }
    }

    onBlur($event) {
        const name = this.node.name.trim();
        if (name.length > 64) {
            return;
        }
        if (name) {
            this.showInput = false;
            this.node.blurNodeEventEmit(this._nodesService);
            this._defaultName = this.node.name.trim();
        } else {
            if (this.node.id) {
                this.node.blurNodeEventEmit(this._nodesService);
            }
            this.node.destory($event);
        }
    }

    private _setInputFocus() {
        setTimeout(() => {
            if (this.valueInputEl) {
                this.valueInputEl.nativeElement.focus();
            }
        });
    }
}
