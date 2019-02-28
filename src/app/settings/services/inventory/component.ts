import { Component, OnInit, Inject } from '@angular/core';

import * as categoriesJSON from '@common/json/procedures.json';

import {ConfigService} from '@common/services/config';

import {InventoryService} from './service';

@Component({
	selector: 'inventory',
	templateUrl: 'component.html'
})
export class InventoryComponent implements OnInit {


	categories = [];

	selectedCategoryId = 1;

	selectedOffice = null;

	inventory = {};

	inventoryDefault = {};

	isChanged = false;

	isLoaded = false;
	
	isSaving = false;

	units = ['pc', 'ml'];

	offices = [];

	toggleIds = {};

	constructor(private _inventoryService:InventoryService, private _configService:ConfigService){
		this.categories = categoriesJSON['items'];

		this.categories.forEach((row, i) => {
			this.inventory[i+1] = [];
			this.inventoryDefault[i+1] = [];
		})

		this.offices = this._configService.getProperty('APP_OFFICES');

		this.selectedOffice = this.offices[0];
	}

	ngOnInit(){

		mixpanel.track("settingsInventoryOpen");

		this._inventoryService.get().subscribe(
			response => {

				response.forEach((row) => {
					let officesObj = {};

					this.offices.forEach((office) => {
						officesObj[office['id']] = 0;
					})
					
					row['offices'].forEach((office) => {
						officesObj[office['office_id']] = office['count'];
					});
					row['addedCount'] = 0;
					
					row['offices'] = officesObj;
					this.inventory[row['static_category_id']].push(row);
					this.inventoryDefault[row['static_category_id']].push(row);
				})

				this.isLoaded = true;

			}
		)
	}


	toggleMenu(inventory){
		
		if (this.toggleIds[inventory.id]){
			inventory.offices[this.selectedOffice.id] += Number(inventory.addedCount);
			
			this._inventoryService.addTransaction({
				office_id:this.selectedOffice.id,
				inventory_id:inventory.id,
				count:Number(inventory.addedCount)
			}).subscribe(
				response => {
				
				}
			)
			inventory.addedCount = 0;
		}

		this.toggleIds[inventory.id] = !this.toggleIds[inventory.id];
	}


	selectOffice(office){

		mixpanel.track("settingsInventorySelectOffice");

		this.selectedOffice = office;
	}

	selectCategory(index){

		mixpanel.track("settingsInventorySelectCategory");

		this.selectedCategoryId = index + 1;
	}

	deleteSelected(){

		let ids = [];

		this.inventory[this.selectedCategoryId].forEach((row, i) => {
			if (row.is_edit){
				if (row.id)
					ids.push(row.id);
			}
		})
		if (ids.length > 0){
			this._inventoryService.delete(ids).subscribe();

			this.inventory[this.selectedCategoryId] = this.inventory[this.selectedCategoryId].filter((row) => {
				return ids.indexOf(row.id) == -1;
			})

			this.isChanged = false;
			
		}
		

	}
	
	addInventory(){

		this.isChanged = true;

		let newItem = {
			name:'',
			code:'',
			fee:0,
			is_edit:true,
			unit:'pc',
			static_category_id:this.selectedCategoryId,
			count_one:1,
			offices:{}
		};
		this.offices.forEach((office) => {
			newItem.offices[office['id']] = 0;
		})

		this.inventory[this.selectedCategoryId].unshift(newItem);

	}

	editInventory(index){

		this.inventory[this.selectedCategoryId][index].is_edit = true;
		this.isChanged = true;

	}

	reset(){
		
		this.inventory = this._cloneInventory(this.inventoryDefault);

		this.removeEdit();

		this.isChanged = false;
	}

	codeExisted(){

	}

	save(){

		mixpanel.track("settingsInventorySave");

		let inventoryFormatted = [];

		for(let key in this.inventory){
			this.inventory[key].forEach((row) => {
				inventoryFormatted.push(row);
			})
		}

		this.isChanged = false;

		this.isSaving = true;

		this._inventoryService.save(inventoryFormatted).subscribe(
			response => {

				this.removeEdit();

				this.isSaving = false;

				response.forEach((newItem) => {

					this.inventory[newItem['static_category_id']].find((row, i) => {
						if (row['code'] === newItem['code']){
							
							newItem.offices = {};
							this.offices.forEach((office) => {
								newItem.offices[office['id']] = 0;
							})

							this.inventory[newItem['static_category_id']][i] = newItem;


							return true;
						}
					});

				})
			}
		)

	}

	private removeEdit(){
		for (let key in this.inventory){
					this.inventory[key].forEach((row) => {
				row['is_edit'] = false;
			})
		}
	}

	private _cloneInventory(inventory){
		let inventoryOut = {};

		for (let key in inventory){
			inventoryOut[key] = [];
			inventory[key].forEach((row) => {
				inventoryOut[key].push(Object.assign({}, row));
			})
		}
		return inventoryOut;
	}

}