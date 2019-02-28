import {NgModule} from '@angular/core';

import {RouterModule} from '@angular/router';

import {ProceduresModule} from './procedures';

import {InventoryModule} from './inventory';

import {ServicesComponent} from './component';

import {CommonAppModule} from '@common/index';

import {TabsModule} from 'ngx-bootstrap/tabs';

@NgModule({
    declarations: [
        ServicesComponent
    ],
    imports: [
        InventoryModule,
        ProceduresModule,
        CommonAppModule,
        TabsModule.forRoot(),
        RouterModule.forChild([
            { path: '', component: ServicesComponent, pathMatch: 'full'}
        ])
    ]
})
export class ServicesModule {

}
