import {NgModule, Component} from '@angular/core';
import {RouterModule} from '@angular/router';
import {CommonModule} from '@angular/common';

import {CommonAppModule} from '@common/index';

import {ServicesComponent} from './component';

@NgModule({
    declarations: [
        ServicesComponent,
    ],
    imports: [
        CommonAppModule,
        RouterModule.forChild([
            { path: '', component: ServicesComponent, pathMatch: 'full'},
        ])
    ]
})
export class ServicesModule {

}
