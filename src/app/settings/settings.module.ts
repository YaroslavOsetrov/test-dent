import {NgModule, Component} from '@angular/core';
import {RouterModule} from '@angular/router';
import {CommonModule} from '@angular/common';

import {TranslateModule} from '@ngx-translate/core';

import {SettingsComponent} from './settings.component';

import {OrganizationService} from './organization/service';

import {LanguageDropdownModule} from './../common/modules/language';

import {AccountService} from './account/service';


@NgModule({
    declarations: [
        SettingsComponent,
    ],
    imports: [
        CommonModule,
        LanguageDropdownModule,
        TranslateModule.forChild(),
        RouterModule.forChild([
            { 
                path: '', component:SettingsComponent,
                children:[
                    { path: '', redirectTo:'account'},
                    { path: 'account', loadChildren: './account/index#AccountModule'},
                    { path: 'organization', loadChildren: './organization/index#OrganizationModule'},
                    { path: 'subscription', loadChildren: './subscription/index#SubscriptionModule'},
                    { path: 'services', loadChildren: './services/index#ServicesModule'},
                    { path: 'notifications', loadChildren: './templates/index#TemplatesModule'},
                    { path: 'collaboration', loadChildren: './collaboration/index#CollaborationModule'}
                ]
            }
        ])
    ],
    providers:[
        OrganizationService,
        AccountService
    ]
})
export class SettingsModule {

}
