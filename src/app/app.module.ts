import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';

import {HomeComponent} from './home/home.component';
import {AppComponent} from './app.component';
import {TransferHttpCacheModule} from '@nguniversal/common';

import {HeaderModule} from './common/modules/header';
import {BootModule} from './_boot';

import {ModalStateService} from './common/services/global';

import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {TranslateModule, TranslateLoader, TranslateService} from '@ngx-translate/core';
import {HttpClientModule} from '@angular/common/http';
import {HttpClient} from '@angular/common/http';

import {CommonAppModule} from './common';

import {environment} from './../environments/environment';

import { CallService} from './settings/collaboration/service';
export function createTranslateLoader(http: HttpClient) {
    return new TranslateHttpLoader(http, environment.apiUrl + 'public/i18n/', '.json');
}


@NgModule({
    declarations: [
        AppComponent,
        HomeComponent,
    ],
    imports: [
        BrowserModule.withServerTransition({appId: 'my-app'}),
        TransferHttpCacheModule,
        HttpClientModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: (createTranslateLoader),
                deps: [HttpClient]
            }
        }),
        HeaderModule,
        BootModule,
        CommonAppModule.forRoot(),

        RouterModule.forRoot([
            { path: '', redirectTo:'home', pathMatch:'full'},
            { path: 'home', component:HomeComponent},
            { path: 'book', loadChildren: './book/book.module#BookModule'},
            { path: 'patients', loadChildren: './patients/patients.module#PatientsModule'},
            { path: 'register', loadChildren: './register/register.module#RegisterModule'},
            { path: 'calendar', loadChildren: './calendar/calendar.module#CalendarModule'},
            { path: 'settings', loadChildren:'./settings/settings.module#SettingsModule'},
            { path: 'analytics', loadChildren:'./analytics/analytics.module#AnalyticsModule'},
            { path: 'login', loadChildren: './login/login.module#LoginModule'}
        ])
    ],
    providers:[
        CallService,
        ModalStateService
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
