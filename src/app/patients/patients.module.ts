import {NgModule, Component} from '@angular/core'
import {RouterModule} from '@angular/router'

import {CommonModule} from '@angular/common';

import {ReactiveFormsModule} from '@angular/forms';

import {PatientsComponent} from './patients.component';

import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';

import {TranslateModule} from '@ngx-translate/core';

import {AddPatientModalComponent} from './add/component';

import {ValidationModule} from './../common/modules/validation';

import {ModalModule} from 'ngx-bootstrap/modal';

import {TutorialsModule} from './../tutorials';

import {PatientService} from './patients.service';

import {PhoneMaskModule} from './../common/modules/phonemask';

import {ShareModalModule} from './shareModal';

import {CommonAppModule} from './../common';

@NgModule({
    declarations: [
        PatientsComponent,
        AddPatientModalComponent
    ],
    imports: [
        CommonAppModule,
        ReactiveFormsModule,
        TutorialsModule,
      //  CommonPipesModule,
   //     EditModalModule,
        ModalModule,
        ShareModalModule,
      //  LaddaModule.forRoot({}),
      //  ValidationModule,
        PhoneMaskModule,
      //  TooltipModule,
      //  BsDropdownModule.forRoot(),
      //  TranslateModule.forChild(),
        RouterModule.forChild([
            { 
                path: '', component: PatientsComponent
            },
            { path: ':id', loadChildren: './profile/profile.module#ProfileModule'}
        ])
    ],
    providers:[
        PatientService
    ]
})
export class PatientsModule {

}
