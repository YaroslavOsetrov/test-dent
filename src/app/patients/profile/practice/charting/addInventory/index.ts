import {NgModule} from '@angular/core'

import {CommonAppModule} from '@common/index';

import {FormsModule} from '@angular/forms';

import {InventorySelectModule} from '@settings/services/inventory/select';

import {AddInventoryComponent} from './component';

@NgModule({
    declarations: [
        AddInventoryComponent
    ],
    imports: [
        CommonAppModule,
        FormsModule,
        InventorySelectModule
    ],
    exports: [
        AddInventoryComponent
    ]
})
export class AddInventoryModule {
    
}