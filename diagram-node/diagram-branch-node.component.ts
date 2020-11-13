/**
 * Created by Ella Ma on 2020/09/11.
 * ------ maintenance history ------
 */

import { Component, Input, OnInit } from '@angular/core';
import { DiagramNode } from '../diagram-service';
import { DiagramService } from '../diagram.service';

@Component({
    selector: 'tam-diagram-branch-node',
    templateUrl: './diagram-branch-node.component.html',
    styleUrls: ['./diagram-node.component.scss']
})
export class DiagramBranchNodeComponent implements OnInit {

    @Input() set nodeId(guid) {
        this.node = this._nodesService.getNode(guid);
    }

    node: DiagramNode;

    constructor(
        private _nodesService: DiagramService,
    ) { }

    ngOnInit() { }

    onClickEvent(event, branch) {
        event.stopPropagation();
        this.node.branchs.forEach(item => {
            item.active = item.guid === branch.guid;
        });
        this.node.clickNodeEventEmit(this._nodesService);
    }
}
