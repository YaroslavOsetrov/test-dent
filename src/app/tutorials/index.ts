import {NgModule} from '@angular/core';

import {TutorialsComponent} from './component';

import {ModalModule} from 'ngx-bootstrap/modal';

import {CommonAppModule} from '@common/index';

@NgModule({
    declarations: [
        TutorialsComponent
    ],
    imports:[
        CommonAppModule,
        ModalModule.forRoot()
    ],
    exports:[
        ModalModule,
        TutorialsComponent
    ]
})
export class TutorialsModule{}