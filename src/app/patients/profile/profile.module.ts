import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';

import {CommonAppModule} from './../../common';

import {OfficeModule} from './office';
import {PracticeModule} from './practice';

import {PatientService} from './../patients.service';

import {TutorialsModule} from './../../tutorials'

import {OrganizationService} from './../../settings/organization/service';

import {ProfileComponent} from './profile.component';

import {ConfigService} from './../../common/services/config'
import {SweetAlertService} from './../../common/services/sweetalert';

@NgModule({
    declarations: [
        ProfileComponent
    ],
    imports: [
        CommonModule,
        TutorialsModule,
        CommonAppModule.forRoot(),
        RouterModule.forChild([
            { 
                path: '', component: ProfileComponent,
            }
        ]),
        OfficeModule,
        PracticeModule
    ],
    providers:[
        OrganizationService,
        SweetAlertService
    ],
    bootstrap: [
        ProfileComponent
    ]
})
export class ProfileModule {

}
