import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DiagramComponent } from './diagram.component';

xdescribe('DiagramComponent', () => {
    let component: DiagramComponent;
    let fixture: ComponentFixture<DiagramComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [DiagramComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DiagramComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
