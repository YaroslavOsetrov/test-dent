import { Component, Input, NgModule, EventEmitter, Output, OnInit } from '@angular/core';

import {ConfigService} from './../../services/config';

import {ActivatedRoute} from '@angular/router';

import * as Languages from './../../../../../public/i18n/languages/index.json';

import {TranslateService} from '@ngx-translate/core';

import {BsDropdownModule} from 'ngx-bootstrap';

import {AccountService} from './../../../settings/account/service';

import {CommonModule} from '@angular/common';

@Component({
  selector: 'language-dropdown',
  templateUrl: 'language.html'
})
export class LanguageDropdown implements OnInit {

	account:any;

    @Input('keepPage') keepPage:boolean;

    @Input('hideLabel') hideLabel:boolean;

    @Output('languageChanged') languageChanged:EventEmitter<any> = new EventEmitter<any>();

    languages = [];
    currentLang:any;

    avLangs:Array<string> = ['en', 'ru', 'vn'];

	constructor(private route:ActivatedRoute, private accountService:AccountService, private configService:ConfigService, private translateService:TranslateService) {


         route.queryParams.subscribe(
            params => {
                if (params['lang'] && this.avLangs.indexOf(params['lang'])){
                    

                    if (!this.configService.defaults){
                        this.changeConfigLang(params['lang']);
                    }else{
                        if (this.configService.defaults.language != params['lang'])
                            this.changeConfigLang(params['lang']);
                    }
                    
                }
                
            }
        )
        if (Languages.default)
            this.languages = Languages.default;

        this.languages.forEach(lang => {

            if (lang['value'] == this.translateService.currentLang)
                this.currentLang = lang;
        });

    }

	ngOnInit() {

					
		
	}

    changeConfigLang(language){
        if (!this.configService.defaults){
            this.change(language);
        }else{
            if (!this.configService.users){
                this.change(language);
            }
        }
    }

    private change(language){
         let defaults = {
            language:language,
            country_code:null,
            currency_code:null,
            organization_id:null,
            timezone_offset:0,
            tax:0
        }

        this.configService.init({
            country_code:defaults.country_code,
            language:defaults.language,
            currency_code:defaults.currency_code,
            organization_id:defaults.organization_id,
            tax:defaults.tax,
            timezone_offset:defaults.timezone_offset
        });

        location.reload();
    }

    changeLang(language){

        this.currentLang = language;

        let defaults:any = {};

        if (this.configService.defaults){
            defaults = Object.assign({}, this.configService.defaults);
            defaults.language = language['value'];
        }else{
            defaults = {
                language:language['value'],
                country_code:null,
                currency_code:null,
                organization_id:null,
                timezone_offset:0,
                tax:0
            }
        }
        this.configService.init(defaults);

        if (this.configService.users){
            let user = this.configService.users[0];
            user.language = language.value;
            this.configService.users[0].language = language.value;
            this.accountService.save(user).subscribe();

        }
        
        if (!this.keepPage){
            location.reload();
        }

        this.languageChanged.emit(language);
	}
}

@NgModule({
    declarations:[LanguageDropdown],
    exports:[LanguageDropdown],
    imports:[BsDropdownModule.forRoot(), CommonModule],
    providers:[AccountService]
})
export class LanguageDropdownModule{}
