import {NgModule, ModuleWithProviders} from '@angular/core';

import {TooltipModule} from 'ngx-bootstrap/tooltip';
import {BsDropdownModule} from 'ngx-bootstrap/dropdown';
import {TranslateModule, TranslateService} from '@ngx-translate/core';

import {CommonModule} from '@angular/common';

import {CommonPipesModule} from './pipes';
import {ValidationModule} from './modules/validation';

import {LaddaModule} from 'angular2-ladda';

import {ConfigService} from './services/config';

import {TextareaAutoresizeModule} from './modules/autoresize';

import {UsersListModule} from './modules/users';

import {NgxMaskModule} from 'ngx-mask';

import {AuthorizationService} from './services/authorization';
//import {SweetAlertService} from './services/sweetalert';

import { SweetAlert2Module } from '@toverux/ngx-sweetalert2';
import {SweetAlertService} from './services/sweetalert';



@NgModule({
    imports: [
        CommonModule,
        CommonPipesModule,
        TooltipModule.forRoot(),
        BsDropdownModule,
        LaddaModule.forRoot({style:'slide-right'}),
        TranslateModule.forChild(),
        ValidationModule,
        TextareaAutoresizeModule,
        NgxMaskModule.forRoot({
            dropSpecialCharacters:false
        }),
        UsersListModule,
        SweetAlert2Module.forRoot({
            buttonsStyling: false,
            customClass: 'modal-content',
            confirmButtonClass: 'btn btn-primary',
            cancelButtonClass: 'btn'
        })
    ],
    exports: [
        CommonModule,
        CommonPipesModule,
        TooltipModule,
        LaddaModule,
        BsDropdownModule,
        ValidationModule,
        TranslateModule,
        TextareaAutoresizeModule,
        UsersListModule,
        NgxMaskModule,
        SweetAlert2Module
    ]
})
export class CommonAppModule {
    static forRoot() {
        return {
            ngModule: CommonAppModule,
            providers: [ 
          //      SweetAlertService,
                AuthorizationService,
                ConfigService,
                TranslateService,
                SweetAlertService
            ]
        };
    }
}
