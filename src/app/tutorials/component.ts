import {Component, Input, OnInit, AfterViewInit, ViewChild} from '@angular/core';

import * as configJSON from './config.json';

import {ConfigService} from '@common/services/config';

@Component({
    selector: 'tutorials',
    templateUrl:'component.html'
})
export class TutorialsComponent implements OnInit {


    @ViewChild('tutorialModal') tutorialModal:any;

    @Input('component') component:any;

    @Input('buttons') buttons:any;

    hidden = false;

    tutorial:any = {
        contentTranslate:[]
    };

    isFirstLogin = false;

    language = 'en';

    constructor(private _configService:ConfigService){


    }

    ngOnInit(){

        this.language = this._configService.defaults.language;

        this.tutorial = configJSON[this.component];

        this.isFirstLogin = this._configService.isFirstLogin;

        this.hidden = this._configService.tutorialsShown.hasOwnProperty(this.component);

    }

    hide(){
        this._configService.addShownTutorial(this.component); 
        this.hidden = true;
    }


}