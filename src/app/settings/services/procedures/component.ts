import { Component, OnInit } from '@angular/core';

import {ProceduresService} from './service';

import * as categoriesJSON from '@common/json/procedures.json';

import {ConfigService} from '@common/services/config';

import {SweetAlertService} from '@common/services/sweetalert';

@Component({
    selector: 'procedures',
    templateUrl: 'component.html'
})
export class ProceduresComponent implements OnInit {

    categories = [];

    procedures = {};

    proceduresDefault = {};

    isChanged = false;

	isSaving = false;

    selectedCategoryId = 1;

    constructor(
        private _configService:ConfigService,
        private _proceduresService:ProceduresService
    ){

        this.categories = categoriesJSON['items'];

        this.categories.forEach((row, i) => {
			this.procedures[i+1] = [];
			this.proceduresDefault[i+1] = [];
		})

    }

    ngOnInit(){

		let procedures = this._configService.getProperty('APP_PROCEDURES');

        procedures.forEach((row) => {
			this.procedures[row['static_category_id']].push(row);
			this.proceduresDefault[row['static_category_id']].push(row);
		})

		mixpanel.track("settingsPriceOpen");

    }

    editProcedure(index){

		this.procedures[this.selectedCategoryId][index].is_edit = true;
		this.isChanged = true;

	}

    addProcedure(){

		this.isChanged = true;

        let lastCode = (this.procedures[this.selectedCategoryId]) ? this.procedures[this.selectedCategoryId].length : 0;

        let newCode =this.selectedCategoryId + '(' + (lastCode +1) + ')';

		let newItem = {
			name:'',
			code:newCode,
			is_edit:true,
			fee:0,
			is_expanded:false,
			static_category_id:this.selectedCategoryId,
			inventory:[],
			procedure_inventory:[]
		};
	
		this.procedures[this.selectedCategoryId].unshift(newItem);

	}

    selectCategory(index){

		mixpanel.track("settingsPriceNavigate");

		this.selectedCategoryId = index + 1;
	}

    reset(){

        this.procedures = this._cloneProcedures(this.proceduresDefault);

		this._removeEdit();

		this.isChanged = false;

    }

    save(){

		mixpanel.track("settingsPriceSave");

        let proceduresFormatted = [];

		for(let key in this.procedures){
			this.procedures[key].forEach((row) => {
				proceduresFormatted.push(row);
			})
		}

		this.isChanged = false;

		this.isSaving = true;

		this._proceduresService.save(proceduresFormatted).subscribe(
			response => {

				this._removeEdit();

				this.isSaving = false;
				
				response.forEach((newItem) => {

					this.procedures[newItem['static_category_id']].find((row, i) => {
						if (row['code'] === newItem['code']){
							this.procedures[newItem['static_category_id']][i] = newItem;
							return true;
						}
					});
				})
				this._updateProcedures();
			}
		)
    }

	deleteSelected(){


		let ids = [];

		let indexes = [];

		this.procedures[this.selectedCategoryId].forEach((row, i) => {
			if (row.is_edit){
				if (row.id)
					ids.push(row.id);
			}
		})
		if (ids.length > 0){
			this._proceduresService.delete(ids).subscribe();

			this.procedures[this.selectedCategoryId] = this.procedures[this.selectedCategoryId].filter((row) => {
				return ids.indexOf(row.id) == -1;
			})

			this.isChanged = false;

			this._updateProcedures();
		}
		

	}

    private _removeEdit(){
		for (let key in this.procedures){
            this.procedures[key].forEach((row) => {
				row['is_edit'] = false;
			})
		}
	}

	private _updateProcedures(){

		let proceduresFormatted = [];

		for(let key in this.procedures){
			this.procedures[key].forEach((row) => {
				proceduresFormatted.push(row);
			})
		}

		this._configService.setProperty('APP_PROCEDURES', proceduresFormatted);

	}

	private _cloneProcedures(procedures){
		let proceduresOut = {};

		for (let key in procedures){
			proceduresOut[key] = [];
			procedures[key].forEach((row) => {
				proceduresOut[key].push(Object.assign({}, row));
			})
		}
		return proceduresOut;
	}

}
