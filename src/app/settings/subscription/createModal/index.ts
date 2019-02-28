import {NgModule, Component} from '@angular/core'
import {RouterModule} from '@angular/router'

import {CommonModule} from '@angular/common';

import {ModalModule} from 'ngx-bootstrap';

import {FormsModule} from '@angular/forms';
import {TranslateModule} from '@ngx-translate/core';
import {ConfigService} from './../../../common/services/config';

import {CommonAppModule} from './../../../common';

import {NgxMaskModule} from 'ngx-mask';


import {CreateModalComponent} from './component';


@NgModule({
    declarations: [
        CreateModalComponent
    ],
    imports: [
        CommonAppModule,
        CommonModule,
        NgxMaskModule,
        FormsModule,
        ModalModule,
        TranslateModule
    ],
    providers:[
        
    ],
    exports: [
        CreateModalComponent
    ]
})
export class CreateModalModule {

}