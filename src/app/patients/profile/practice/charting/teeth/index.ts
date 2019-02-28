import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {CommonAppModule} from '@common/index';

import {TranslateModule} from '@ngx-translate/core';
import {TeethComponent} from './teeth.component';
import {Tooth} from './tooth.component';

import {AccountService} from '@settings/account/service';

import {UniNotationPipe} from './uniNotation.pipe';

@NgModule({
    declarations: [
        TeethComponent,
        Tooth,
        UniNotationPipe
    ],
    imports:[
        CommonAppModule,
        TranslateModule
    ],
    providers:[
        AccountService
    ],
    exports:[
        TeethComponent, Tooth, UniNotationPipe
    ]
})
export class TeethModule { }
