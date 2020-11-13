/**
 * Created by Ella Ma on 2020/09/11.
 * ------ maintenance history ------
 */

import { Injectable } from '@angular/core';
import { DiagramNodesList } from './diagram-service';
import { DiagramConfig } from './diagram.model';

@Injectable({
    providedIn: 'root'
})
export class DiagramService {

    private nodesList: DiagramNodesList;
    diagramConfig: DiagramConfig;

    constructor() {
        this.nodesList = new DiagramNodesList([]);
    }

    loadNodes(nodes) {
        this.nodesList = new DiagramNodesList(nodes);
        return this.nodesList;
    }

    getNode(guid) {
        return this.nodesList.getNode(guid);
    }

    destory() {
        return this.nodesList.destory();
    }

    newNode(data) {
        this.nodesList.newNode(data, this);
    }

    getRootNote() {
        return this.nodesList.getRootNote();
    }

    setDiagramConfig(config) {
        this.diagramConfig = config;
    }

    serialize() {
        return this.nodesList.serialize();
    }

    setNodeId(guid, id) {
        return this.nodesList.setNodeId(guid, id);
    }

    updateNode(guid, data) {
        return this.nodesList.updateNode(guid, data);
    }

    deleteNode(guid) {
        return this.nodesList.deleteNode(guid);
    }

    deleteBranch(nodeGuid, branchGuid) {
        return this.nodesList.deleteBranch(nodeGuid, branchGuid);
    }
}
