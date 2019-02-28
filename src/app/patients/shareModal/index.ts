import {NgModule, Component} from '@angular/core'
import {RouterModule} from '@angular/router'

import {CommonModule} from '@angular/common';

import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {ShareModalComponent} from './component';

import {BsDropdownModule, ModalModule, DatepickerModule, TooltipModule} from 'ngx-bootstrap';

import {TranslateModule} from '@ngx-translate/core';

import {CommonPipesModule} from './../../common/pipes';

import {LaddaModule} from 'angular2-ladda';

@NgModule({
    declarations: [
        ShareModalComponent
    ],
    imports: [
        CommonModule,
        CommonPipesModule,
        TranslateModule.forChild(),
        ModalModule.forRoot(),
        LaddaModule
    ],
    exports: [
        ShareModalComponent
    ]
})
export class ShareModalModule {

}