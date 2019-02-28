import { Component, OnInit } from '@angular/core';

import {PriceProcedure, PriceList, ProcedureСategory} from './model';

import {PriceService} from './service';

import {TranslateService} from '@ngx-translate/core';

import * as ProcedureCategories from './../../common/json/procedures.json';

import {ConfigService} from './../../common/services/config';

import {SweetAlertService} from '@common/services/sweetalert';

@Component({
    selector: 'price',
    templateUrl: 'component.html'
})
export class PriceComponent implements OnInit {
 
    selected_cat_index:number = 0;
    selected_fee_index:number = 0;

    isLoaded:boolean = false;

    selected_services:Array<PriceProcedure> = [];
    
    added_procedures:Array<PriceProcedure> = [];

    price_list:PriceList;

    procedure_cat:Array<ProcedureСategory>;

    APPSETTINGS:any;

    editable_codes:Array<string> = [];
    editable_codes_changed:Array<string> = [];

    savePriceTimeout:any;

    userRole:any;

    timeoutSave:any;

    constructor(
        private translateService:TranslateService,
        private configService:ConfigService,
        private _swalService:SweetAlertService,
        private priceService:PriceService) {

        this.procedure_cat = ProcedureCategories['items'];

        this.APPSETTINGS = this.configService.defaults;

        this.price_list = this.configService.priceList;

        this.price_list.data.forEach((row, i) => {
            if (row == null){
                this.price_list.data[i] = [];
            }
        })

        this.isLoaded = true;
        this.select_category(0);

        this.userRole = this.configService.users[0].user_roles[0];
    }

    ngOnInit(){

    }

    delete_new_procedure(procedure_index:number){
        this.added_procedures.splice(procedure_index, 1);
    }
    delete_procedure(procedure_index:number){

        if (!this.userRole.edit_price)
            return false;

        this.selected_services.splice(procedure_index, 1);

        this.configService.priceList = this.price_list;

        clearTimeout(this.savePriceTimeout);

        this.savePriceTimeout = setTimeout(() => {

            this.priceService.save(this.price_list).subscribe();
        }, 1000);

    }

    procedure_handler(event, procedure_index, existing_procedure_code:string = null){

        if (event.keyCode == 13 && procedure_index != null){
            if (existing_procedure_code == null)
                this.save_new_procedure(procedure_index, this.added_procedures[procedure_index]);
            else{
                this.toggle_edit_mode(existing_procedure_code)
            }
                
        }
    }


    is_editable(procedure_code:string){
        let editable_index = this.editable_codes.indexOf(procedure_code);

        return editable_index != -1;
    }

    change_procedure_code(procedure_index, new_val){


        let code =  this.price_list.data[this.selected_cat_index][procedure_index].code;
        let editable_index = this.editable_codes.indexOf(code);

        this.editable_codes[editable_index] = new_val;


        this.price_list.data[this.selected_cat_index][procedure_index].code = new_val;
    }

    add_procedure(){


        let ext_length = (this.price_list.data[this.selected_cat_index]) ? this.price_list.data[this.selected_cat_index].length : 0;

        let new_code =this.selected_cat_index + '' + (ext_length + this.added_procedures.length +1);


        let procedure:PriceProcedure = {
            code:new_code.toString(),
            name:'',
            price:[]
        }

        this.added_procedures.push(procedure);

    }


    is_code_exists(code:string){

        let found:boolean = false;
        return false;
        /*

        this.price_list.data.forEach((row) => {
            if (row != null)
            row.forEach((row1)=>{
                if (row1.code == code)
                    found = true;
            });
        });
        return found;*/

    }

    save_new_procedure(index:number, item:PriceProcedure){

        if (!(Number(item.price[this.selected_fee_index]) >= 0) || !item.code || !item.name){
            return false;
        }

        if (this.is_code_exists(item.code)){
            this._swalService.message({
                title:'form.err',
                text:'price.code_exs',
                resolveParams:{
                    text:{
                        code:item.code
                    }
                },
                type:'error'
            });
            return false;
        }

        clearTimeout(this.savePriceTimeout);


        this.savePriceTimeout = setTimeout(() => {
            let item_new = Object.assign({}, item);

            this.added_procedures.splice(index, 1);

            if (!this.price_list.data[this.selected_cat_index])
                this.price_list.data[this.selected_cat_index] = [];
            
            if (!(this.price_list.data[this.selected_cat_index] instanceof Array))
                this.price_list.data[this.selected_cat_index] = [];

            this.price_list.data[this.selected_cat_index].push(item_new);  

            this.configService.priceList = this.price_list;

            this.priceService.save(this.price_list).subscribe();
        }, 3000);
        /*

       

        clearTimeout(this.savePriceTimeout);

        this.savePriceTimeout = setTimeout(() => {

            
        }, 1000);*/
    }

    toggle_edit_mode(procedure_code:string){

        if (!this.userRole.edit_price)
            return false;

        let editable_index = this.editable_codes.indexOf(procedure_code);

        if (editable_index != -1){
            clearTimeout(this.timeoutSave);

            this.timeoutSave = setTimeout(() => {

                this.priceService.save(this.price_list).subscribe();

                this.editable_codes.splice(editable_index, 1);
                this.editable_codes_changed.splice(this.editable_codes_changed.indexOf(procedure_code), 1);

            }, 3000);
        } else {

            this.editable_codes.push(procedure_code);
            setTimeout(() => {
                if (this.editable_codes_changed.indexOf(procedure_code) == -1){
                    this.editable_codes.splice(this.editable_codes.indexOf(procedure_code), 1);
                    this.editable_codes_changed.splice(this.editable_codes_changed.indexOf(procedure_code), 1);
                }
            }, 3000);
        }       

    }

    start_editing(procedure_code){
        if (this.editable_codes_changed.indexOf(procedure_code) == -1){
            this.editable_codes_changed.push(procedure_code);
        }
    }

    select_category(index:number){
        this.selected_cat_index = index;

        this.added_procedures = [];

        if (this.price_list.data[index])
            this.selected_services = this.price_list.data[index];
        else
            this.selected_services = [];
        
    }
}
