import {NgModule, Component} from '@angular/core';
import {RouterModule} from '@angular/router';
import {CommonModule} from '@angular/common';

import {CommonAppModule} from '@common/index';

import {InventoryComponent} from './component';

import {InventoryService} from './service';

import {FormsModule} from '@angular/forms';


@NgModule({
    declarations: [
        InventoryComponent,
    ],
    imports: [
        CommonAppModule,
        FormsModule
    ],
    providers:[
        InventoryService
    ],
    exports:[InventoryComponent]
})
export class InventoryModule {

}
