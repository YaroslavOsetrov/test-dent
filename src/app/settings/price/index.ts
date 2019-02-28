import {NgModule, Component} from '@angular/core'
import {RouterModule} from '@angular/router'

import {CommonModule} from '@angular/common';

import {FormsModule} from '@angular/forms';

import {PriceComponent} from './component';

import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';

import {TranslateModule} from '@ngx-translate/core';

import {PriceService} from './service';

import {ConfigService} from './../../common/services/config';

import {CommonAppModule} from './../../common';

import {ProcedureSearchPipe } from './procedureSearch.pipe';

@NgModule({
    declarations: [
        PriceComponent,
        ProcedureSearchPipe
    ],
    imports: [
        CommonModule,
        CommonAppModule,
        FormsModule,
        TooltipModule.forRoot(),
        BsDropdownModule.forRoot(),
        TranslateModule.forChild(),
        RouterModule.forChild([
            { path: '', component: PriceComponent, pathMatch: 'full'}
        ])
    ],
    exports:[TranslateModule],
    providers:[PriceService, ConfigService]
})
export class PriceModule {

}
