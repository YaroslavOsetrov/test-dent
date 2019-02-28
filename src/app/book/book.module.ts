import {NgModule, Component} from '@angular/core';
import {RouterModule} from '@angular/router';
import {ReactiveFormsModule} from '@angular/forms';

import {CommonModule} from '@angular/common';

import {ValidationModule} from '@common/modules/validation';

import {CommonAppModule} from '@common/index';

import {TranslateModule, TranslateService, TranslateLoader} from '@ngx-translate/core';

import {PhoneMaskModule} from '@common/modules/phonemask';

import {BsDropdownModule} from 'ngx-bootstrap/dropdown';

import {LanguageDropdownModule} from '@common/modules/language';

import {HttpClient} from '@angular/common/http';

import {BookComponent} from './book.component';

import {BookService} from './book.service';

import {environment} from './../../environments/environment';

import {FormsModule} from '@angular/forms';


@NgModule({
    declarations: [
        BookComponent
    ],
    imports: [
        CommonAppModule,
        ValidationModule,
        FormsModule,
      //  TranslateModule.forRoot(),
        LanguageDropdownModule,
        ReactiveFormsModule,
        PhoneMaskModule,
        RouterModule.forChild([
            { path: ':providerId', component: BookComponent, pathMatch: 'full'}
        ])
    ],
    providers:[
        BookService,
      /*  TranslateService,
        {
            provide: TranslateLoader,
            useFactory: (http: HttpClient) => new TranslateLoader(http, environment.apiUrl + 'public/i18n/', '.json'),
            deps: [HttpClient]
        }*/
    ]
})
export class BookModule {

}
