import {NgModule} from '@angular/core';

import {BootService, BootInitService} from './service';

import {BootComponent} from './component';

import {CommonAppModule} from './../common';

@NgModule({
    declarations: [ 
        BootComponent
    ],
    imports: [
        CommonAppModule,
    /*    HttpClientModule,
        CommonPipesModule,
        TransferHttpClientModule,
        NoopAnimationsModule,
        BsDropdownModule.forRoot(),
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: (createTranslateLoader),
                deps: [HttpClient]
            }
        }),
        LanguageDropdownModule,
        AuthorizationModule,
        PatientSelectModule*/
    ],
    providers:[
        BootService,
        BootInitService
    ],
    exports: [ 
        BootComponent 
    ]
})
export class BootModule {

    constructor(){}
}