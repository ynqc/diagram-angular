/**
 * Created by Ella Ma on 2020/09/11.
 * ------ maintenance history ------
 */

import { Component, OnInit, Input } from '@angular/core';
import { DiagramNode } from '../diagram-service';
import { DiagramService } from '../diagram.service';

@Component({
    selector: 'tam-diagram-node',
    templateUrl: './diagram-node.component.html',
    styleUrls: ['./diagram-node.component.scss']
})
export class DiagramNodeComponent implements OnInit {

    @Input() set nodeId(guid) {
        this.node = this._nodesService.getNode(guid);
    }

    node: DiagramNode;

    constructor(
        private _nodesService: DiagramService,
    ) { }

    ngOnInit() {
    }
}
