import {NgModule} from '@angular/core';

import {CommonModule} from '@angular/common';

import {CommonAppModule} from './../../common';

import {TaskBoxComponent} from './component';

import {OrganizationService} from './../../settings/organization/service';

import {DetailTaskModalModule} from '@patients/profile/office/tasks/detail/module';

import {AddTaskModalModule} from '@patients/profile/office/tasks/add/module';


@NgModule({
    declarations: [
        TaskBoxComponent
    ],
    imports: [
        CommonAppModule.forRoot(),
        DetailTaskModalModule,
        AddTaskModalModule
    ],
    exports:[
        TaskBoxComponent
    ],
    providers:[
        OrganizationService
    ]
})
export class TaskBoxModule {

}