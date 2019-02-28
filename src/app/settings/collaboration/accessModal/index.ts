import {NgModule, Component} from '@angular/core'
import {RouterModule} from '@angular/router'

import {CommonModule} from '@angular/common';

import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {BsDropdownModule, ModalModule, DatepickerModule} from 'ngx-bootstrap';
import {TranslateModule} from '@ngx-translate/core';
import {LaddaModule} from 'angular2-ladda';
import {NgxMaskModule} from 'ngx-mask';
import {AccessModalComponent} from './component';
import {CollaborationService} from './../service';

import {CommonAppModule} from './../../../common'


@NgModule({
    declarations: [
        AccessModalComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        LaddaModule.forRoot({
            spinnerColor:'#fff'
        }),
        CommonAppModule,
        ModalModule,
        TranslateModule,
        NgxMaskModule,
        BsDropdownModule
    ],
    providers:[
        CollaborationService
    ],
    exports: [
        AccessModalComponent
    ]
})
export class AccessModalModule {

}