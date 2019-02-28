import {NgModule, Component} from '@angular/core'
import {RouterModule} from '@angular/router'

import {CommonModule} from '@angular/common';

import {CommonAppModule} from '@common/index';

import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {BsDropdownModule, ModalModule, DatepickerModule} from 'ngx-bootstrap';
import {TranslateModule} from '@ngx-translate/core';
import {LaddaModule} from 'angular2-ladda';
import {NgxMaskModule} from 'ngx-mask';
import {CreateModalComponent} from './component';
import {CollaborationService} from './../service';


@NgModule({
    declarations: [
        CreateModalComponent
    ],
    imports: [
        CommonAppModule,
        FormsModule,
        ReactiveFormsModule,
        LaddaModule.forRoot({
            spinnerColor:'#fff'
        }),
        ModalModule,
        TranslateModule,
        NgxMaskModule,
        BsDropdownModule
    ],
    providers:[
        CollaborationService
    ],
    exports: [
        CreateModalComponent
    ]
})
export class CreateModalModule {

}