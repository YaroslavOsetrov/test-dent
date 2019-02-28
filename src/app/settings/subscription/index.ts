import {NgModule, Component} from '@angular/core';
import {RouterModule} from '@angular/router';

import {CommonModule} from '@angular/common';
import {CommonAppModule} from './../../common';
import {MyCurrencyPipe} from './../../common/pipes';

import { BsDropdownModule } from 'ngx-bootstrap/dropdown';

import {SubscriptionComponent} from './component';

import { ProgressbarModule } from 'ngx-bootstrap/progressbar';

import {SubscriptionService} from './service';

import {OrganizationService} from './../organization/service';

import {CreateModalModule} from './createModal';

import {LaddaModule} from 'angular2-ladda';

import {TranslateModule} from '@ngx-translate/core';

import {PatientService} from './../../patients/patients.service';

@NgModule({
    declarations: [
        SubscriptionComponent,
    ],
    imports: [
        CommonModule,
        BsDropdownModule.forRoot(),
        CommonAppModule,
        TranslateModule.forChild(),
        CreateModalModule,
        ProgressbarModule.forRoot(),
        RouterModule.forChild([
            { 
                path: '', component: SubscriptionComponent
            }
        ])
    ],
    providers:[
        SubscriptionService,
        OrganizationService,
        MyCurrencyPipe,
        PatientService
    ]
})
export class SubscriptionModule {

}