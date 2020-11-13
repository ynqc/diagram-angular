import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DiagramComponent } from './diagram.component';
import { DiagramTextBoxNodeComponent } from './diagram-node/diagram-textbox-node.component';
import { DiagramService } from './diagram.service';
import { DiagramPopoverComponent } from './diagram-popover/diagram-popover.component';
import { DiagramBranchNodeComponent } from './diagram-node/diagram-branch-node.component';
import { PopupModule } from '@progress/kendo-angular-popup';
import { DiagramNodeComponent } from './diagram-node/diagram-node.component';
import { WidgetsModule } from '../widgets.module';
import { TooltipModule } from '@progress/kendo-angular-tooltip';

@NgModule({
    declarations: [
        DiagramComponent,
        DiagramTextBoxNodeComponent,
        DiagramPopoverComponent,
        DiagramBranchNodeComponent,
        DiagramNodeComponent
    ],
    imports: [
        CommonModule,
        WidgetsModule,
        PopupModule,
        TooltipModule
    ],
    providers: [
        DiagramService
    ],
    exports: [
        DiagramComponent,
        DiagramPopoverComponent
    ],
})
export class DiagramModule { }
