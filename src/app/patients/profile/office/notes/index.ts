import {NgModule} from '@angular/core';

import {FormsModule} from '@angular/forms';

import {NotesComponent} from './component';


import {CommonAppModule} from '@common/index';


@NgModule({
    declarations: [
        NotesComponent
    ],
    imports: [
        CommonAppModule,
        FormsModule
    ],
    exports: [
        NotesComponent
    ]
})
export class NotesModule {

}
