import {NgModule} from '@angular/core';

import {HeaderView} from './component';

import {PatientSelectModule} from './../../../patients/select';

import {LanguageDropdownModule} from './../../../common/modules/language';

import {RouterModule} from '@angular/router';

import {CommonAppModule} from './../../../common';

@NgModule({
    imports: [
        PatientSelectModule,
        LanguageDropdownModule,
        RouterModule,
        CommonAppModule
    ],
    declarations: [ 
        HeaderView, 
    ],
    exports: [ 
        HeaderView 
    ]
})
export class HeaderModule {

    constructor(){}
}