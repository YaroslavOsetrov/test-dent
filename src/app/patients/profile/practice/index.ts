import {NgModule, Component} from '@angular/core'
import {RouterModule} from '@angular/router'

import {TabsModule} from 'ngx-bootstrap/tabs';


import {ChartingModule} from './charting';
import {NotesModule} from './notes';
import {BillingModule} from './billing';
import {FilesModule} from './storage';

import {PracticeComponent} from './component';

import {CommonAppModule} from './../../../common';
import {CommonModule} from '@angular/common';


@NgModule({
    declarations: [
        PracticeComponent
    ],
    imports: [
        CommonModule,
        CommonAppModule,
        ChartingModule,
        FilesModule,
        BillingModule,
        NotesModule,
        TabsModule.forRoot(),
    ],
    providers:[
    ],
    exports: [
        PracticeComponent
    ]
})
export class PracticeModule {

}
