import {NgModule, Component} from '@angular/core'
import {RouterModule} from '@angular/router'

import {CommonModule} from '@angular/common';

import {ReactiveFormsModule, FormsModule} from '@angular/forms';

import {TagsInputModule } from './../../../common/modules/tagsinput';

import {TabsModule} from 'ngx-bootstrap/tabs';
import {ModalModule} from 'ngx-bootstrap/modal';
import {BsDropdownModule} from 'ngx-bootstrap/dropdown';

import {OfficeComponent} from './component';

import {GeneralComponent} from './general/component';
import {CustomFieldsModalComponent} from './general/customFields/component';

import {FilesService} from './../practice/storage/service';

//import {MedicalComponent} from './medical/component';

import {TasksComponent} from './tasks/component';
import {AddTaskModalModule} from './tasks/add/module';
import {DetailTaskModalModule} from './tasks/detail/module';

import {DocumentsComponent} from './documents/component';
import {AddDocumentModalComponent} from './documents/add/component';

import {NotesModule} from './notes/index';


import {CommonAppModule} from './../../../common';


import {NgxMaskModule} from 'ngx-mask';
import {PhoneMaskModule} from './../../../common/modules/phonemask';
import {GooglePlaceModule} from './../../../common/modules/address';
import {NgxTrumbowygModule} from 'ngx-trumbowyg';

import { ngxMediumModule } from 'ngx-medium-editor';

@NgModule({
    declarations: [
        OfficeComponent,
        
        GeneralComponent,
        CustomFieldsModalComponent,

        TasksComponent,

        DocumentsComponent,
        AddDocumentModalComponent,
    ],
    imports: [
        CommonModule,
        CommonAppModule,
        ReactiveFormsModule,
        DetailTaskModalModule,
        TagsInputModule,
        AddTaskModalModule,
        NotesModule,
        
        FormsModule,
        ngxMediumModule,
        TabsModule.forRoot(),
        BsDropdownModule.forRoot(),
        ModalModule.forRoot(),
        PhoneMaskModule,
        GooglePlaceModule,
        NgxMaskModule
    ],
    exports: [
        OfficeComponent
    ],
    providers:[FilesService],
    bootstrap:[
        OfficeComponent
    ]
})
export class OfficeModule {

}
