import {NgModule, Component} from '@angular/core';
import {RouterModule} from '@angular/router';

import {CommonModule} from '@angular/common';
import {MyCurrencyPipe} from './../../common/pipes';

import {TemplatesComponent} from './component';

import {ReactiveFormsModule} from '@angular/forms';

import {CommonAppModule} from './../../common';

import {OrganizationNotificationService} from './service';

import {ValidationModule} from './../../common/modules/validation';

import {LaddaModule} from 'angular2-ladda';

import {TranslateModule} from '@ngx-translate/core';

import {TagsAreaModule} from './../../common/modules/tagsarea';

@NgModule({
    declarations: [
        TemplatesComponent,
    ],
    imports: [
        CommonModule,
        CommonAppModule,
        ValidationModule,
        ReactiveFormsModule,
        LaddaModule,
        TagsAreaModule,
        TranslateModule.forChild(),
        RouterModule.forChild([
            { 
                path: '', component: TemplatesComponent
            }
        ])
    ],
    providers:[
        MyCurrencyPipe,
        OrganizationNotificationService
    ]
})
export class TemplatesModule {

}