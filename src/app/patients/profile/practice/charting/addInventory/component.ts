import {Component, OnInit, OnChanges, Output, EventEmitter, Input, ViewChild} from '@angular/core';

import {InventoryService} from '@settings/services/inventory/service';

import {PatientService} from '@patients/patients.service';

@Component({
    selector: 'add-inventory',
    templateUrl:'index.html'
})
export class AddInventoryComponent{

    isLoaded = false;

    @Input('procedure') procedure:any;

    @Input('appointment') appt:any;

    inventory = [];

    patientId;

    constructor(private _patientService:PatientService, private _inventoryService:InventoryService){

        


    }

    ngOnInit(){

        this.patientId = this._patientService.patientId$.getValue();

        if (!this.procedure.inventory)
            this.procedure.inventory = [];
        

        if (this.procedure.inventory.length > 0){
            let idsFormatted = '[';
            this.procedure['inventory'].forEach((row) => {
                idsFormatted += '"' + row['inventory_id'] + '",';
            })
            
            idsFormatted = idsFormatted.substring(0, idsFormatted.length - 1);
            idsFormatted  += ']';
            
            this._inventoryService.getByIds(idsFormatted).subscribe(
                response => {
                    

                    response.forEach((row) => {

                        row.officesObj = {};
                        row.offices.forEach((office) => {
                            row.officesObj[office['office_id']] = office;
                        })

                        this.inventory[row['id']] = row;
                    })
                    this.isLoaded = true;
                    
                }
            )
        }else{
            this.isLoaded = true;
        }
    }

    onInventoryChanged(){
        setTimeout(() => {
            this._patientService.saveProcedureInventory(this.patientId, this.procedure).subscribe();
        }, 3000);
    }

    deleteInventory(index){

        this.procedure.inventory.splice(index, 1);
        this.onInventoryChanged();

    }

    onInventorySelected(item){
        
        let inventory = this.procedure.inventory.find((row) => {
            return row['inventory_id'] == item['id']; 
        })

        item.officesObj = {};
        item.offices.forEach((row) => {
            item.officesObj[row['office_id']] = row;
        })

        if (inventory)
            return false;

        this.inventory[item['id']] = item;

        this.procedure.inventory.unshift({
            inventory_id:item['id'],
            procedure_id:this.procedure['id'],
            qty:1
        });
        this.onInventoryChanged();
    }

}