import {NgModule, Component} from '@angular/core';
import {RouterModule} from '@angular/router';
import {ReactiveFormsModule, FormsModule} from '@angular/forms';

import {CommonModule} from '@angular/common';

import {TranslateModule} from '@ngx-translate/core';

import {ModalModule} from 'ngx-bootstrap';

import {CollaborationComponent} from './component';

import {CollaborationService} from './service';

import {OrganizationService} from './../organization/service';

import {LaddaModule} from 'angular2-ladda';
import {NewUser} from './newUser';

import {ValidationModule} from './../../common/modules/validation';

import {CommonAppModule} from './../../common';

import {AccessModalModule} from './accessModal';

import {CreateModalModule} from './createModal';

import {AccountService} from './../account/service';

@NgModule({
    declarations: [
        CollaborationComponent,
        NewUser
    ],
    imports: [
        CommonModule,
        CommonAppModule,
        TranslateModule.forChild(),
        ModalModule.forRoot(),
        ReactiveFormsModule,
        AccessModalModule,
        CreateModalModule,
        RouterModule.forChild([
            { 
                path: '', component: CollaborationComponent
            }
        ]),
        LaddaModule,
        ValidationModule
    ],
    providers:[
        CollaborationService,
        OrganizationService,
        AccountService
    ]
})
export class CollaborationModule {

}