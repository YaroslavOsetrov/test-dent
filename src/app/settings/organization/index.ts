import {NgModule, Component} from '@angular/core';
import {RouterModule} from '@angular/router';
import {ReactiveFormsModule, FormsModule} from '@angular/forms';

import {CommonModule} from '@angular/common';

import {TranslateModule} from '@ngx-translate/core';

import {OrganizationComponent} from './component';

import {OrganizationService} from './service';

import {CommonAppModule} from './../../common';

import {PhoneMaskModule} from './../../common/modules/phonemask';

import {GooglePlaceModule} from './../../common/modules/address';

import {ValidationModule} from './../../common/modules/validation';

import {NgxUploaderModule} from 'ngx-uploader';

@NgModule({
    declarations: [
        OrganizationComponent
    ],
    imports: [
        CommonModule,
        CommonAppModule,
        GooglePlaceModule,
        ValidationModule,
        TranslateModule.forChild(),
        NgxUploaderModule,
        FormsModule,
        ReactiveFormsModule,
        PhoneMaskModule,
        RouterModule.forChild([
            { 
                path: '', component: OrganizationComponent
            }
        ])
    ],
    providers:[
        OrganizationService
    ]
})
export class OrganizationModule {

}