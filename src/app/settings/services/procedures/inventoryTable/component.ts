import { Component, Output, Input, ViewChild, EventEmitter, OnInit } from '@angular/core';

import {FormBuilder, FormGroup, Validators} from '@angular/forms';

import {ValidationService} from '@common/modules/validation';
import {ConfigService} from '@common/services/config';

import {ProceduresService} from './../service';

import {InventoryService} from './../../inventory/service';

@Component({
    selector: 'inventory-table',
    templateUrl: 'component.html',
    exportAs:'inventoryTable'
})
export class InventoryTableComponent implements OnInit {
 
    @Input('procedure') procedure;


    selectedInventory = {};

    inventory = [];

    isSaving = false;

    isLoaded = false;

    @Output('inventoryChanged') inventoryChanged = new EventEmitter<any>();
 

    constructor(private _proceduresService:ProceduresService, private _inventoryService:InventoryService) {
        
    }

    ngOnInit() {

        if (this.procedure.procedure_inventory.length == 0){
            this.isLoaded = true;
            return;
        }

        mixpanel.track("settingsPriceInventoryOpen");

        let idsFormatted = '[';
        this.procedure.procedure_inventory.forEach((row, i) => {
            idsFormatted += '"' + row['inventory_id'] + '",';
        })
        idsFormatted = idsFormatted.substring(0, idsFormatted.length - 1);
        idsFormatted  += ']';
        
        this.isLoaded = false;
        this._inventoryService.getByIds(idsFormatted).subscribe(
            response => {

                response.forEach((inventory) => {

                    this.procedure.procedure_inventory.forEach((row) => {
                        if (inventory['id'] == row['inventory_id']){
                            row['inventory'] = inventory;
                        }
                    })
                })
                this.isLoaded = true;
                
            }
        )
    }

    deleteInventory(inventory){

        this.procedure.procedure_inventory = this.procedure.procedure_inventory.filter((row) => {
            return row['inventory_id'] != inventory['inventory_id']
        });
        this.inventoryChanged.emit();
        this._proceduresService.deleteInventory(this.procedure['id'], inventory['inventory_id']).subscribe();
    }

    onInventorySelected(inventory){
        this.procedure.procedure_inventory.push({
            qty:1,
            procedure_id:this.procedure['id'],
            inventory_id:inventory['id'],
            inventory:inventory
        })
    }

    save(){
        this.isSaving = true;
        this._proceduresService.saveInventory(this.procedure['id'], this.procedure.procedure_inventory).subscribe(
            response => {
                this.isSaving = false;
                this.inventoryChanged.emit();
            }
        )
    }
}
