import {NgModule} from '@angular/core';

import {CommonModule} from '@angular/common';

import {ModalModule, BsDropdownModule} from 'ngx-bootstrap';

import {TabsModule} from 'ngx-bootstrap/tabs';

import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {EditModalComponent} from './component';

import {TranslateModule} from '@ngx-translate/core';

import {AppointmentService} from './../calendar.service';

import {LaddaModule} from 'angular2-ladda';

import {SubscriptionService} from './../../settings/subscription/service';

import {CreateBillingModalModule} from './../../patients/profile/practice/billing/createModal';
import {DetailModalModule} from './../../patients/profile/practice/billing/detailModal';
import {BillingService} from './../../patients/profile/practice/billing/service';

import {InvoicesTableComponent} from './invoicesTable';

//import {EditModalWidgetComponent} from './widget';

import {CommonAppModule} from './../../common';

import {PracticeModule} from './../../patients/profile/practice/index';

import {ChartingModule} from '@patients/profile/practice/charting';
import {NotesModule} from '@patients/profile/practice/notes';
import {BillingModule} from '@patients/profile/practice/billing';
import {FilesModule} from '@patients/profile/practice/storage';

import {WidgetComponent} from './widget';
import {NoteComponent} from './note';

@NgModule({
    declarations: [
        EditModalComponent,
        InvoicesTableComponent,

        WidgetComponent,
        NoteComponent

    //    EditModalWidgetComponent
    ],
    imports: [
        CommonAppModule.forRoot(),
        ModalModule,
        TabsModule,
        PracticeModule,
        CreateBillingModalModule,
        DetailModalModule,
        ReactiveFormsModule,
        FormsModule,
        BsDropdownModule,
        ChartingModule,
        NotesModule,
        BillingModule,
        FilesModule
    ],
    exports: [
        EditModalComponent,
        InvoicesTableComponent
    ],
    providers:[AppointmentService, BillingService, SubscriptionService]
})
export class EditModalModule {

}