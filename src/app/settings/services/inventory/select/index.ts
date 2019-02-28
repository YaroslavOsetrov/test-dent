import {NgModule, Component, OnChanges, forwardRef, Input, Output, EventEmitter} from '@angular/core'
import {RouterModule} from '@angular/router'

import {CommonModule} from '@angular/common';

import {FormsModule, AbstractControl, Validator, ControlValueAccessor, NG_VALUE_ACCESSOR, NG_VALIDATORS} from '@angular/forms';


import {TypeaheadModule} from 'ngx-bootstrap';

import {TranslateModule} from '@ngx-translate/core';

import {InventoryService} from './../service';

import { Observable, of } from 'rxjs';
import { TypeaheadMatch } from 'ngx-bootstrap/typeahead';

import {CommonAppModule} from '@common/index';

import { mergeMap } from 'rxjs/operators';



@Component({
    selector: 'inventory-select',
    providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InventorySelectComponent),
      multi: true,
    }],
    templateUrl:'component.html' 
})
export class InventorySelectComponent implements ControlValueAccessor{
    
    @Output('inventorySelected') inventorySelected:EventEmitter<any> = new EventEmitter<any>();

    asyncSelected: string = '';
    typeaheadLoading: boolean;
    typeaheadNoResults: boolean;
    dataSource: Observable<any>;

    exErr:boolean = false;

    selectedInventory:any;

    constructor(private _inventoryService:InventoryService) {
        this.dataSource = Observable
        .create((observer: any) => {
            observer.next(this.asyncSelected);
        })
        .pipe(mergeMap((token: string) => this.getStatesAsObservable(token)));
    }

    writeValue(obj:any){
        if (obj){
            this.asyncSelected = obj;
        }
    }

    propagateChange = (_: any) => { };

    registerOnChange(fn: any) {
        this.propagateChange = fn;
    }

    registerOnTouched() { }
 
    getStatesAsObservable(token: string): Observable<any> {
        this.asyncSelected = token;
        this.propagateChange(this.asyncSelected);
      //  this.inventorySelected.emit(this.selectedInventory);
        return this._inventoryService.search(token);
    }
 
    changeTypeaheadLoading(e: boolean): void {
        this.typeaheadLoading = e;
    }
 
    changeTypeaheadNoResults(e: boolean): void {
        this.typeaheadNoResults = e;
    }

    onInput(event){
        this.asyncSelected = event.target.value;
        this.propagateChange(this.asyncSelected);
    }
 
    typeaheadOnSelect(e: TypeaheadMatch): void {
        this.selectedInventory = e.item;
       
        this.inventorySelected.emit(this.selectedInventory);
        
        this.asyncSelected='';
    }

}
@NgModule({
    declarations: [
        InventorySelectComponent,
    ],
    imports: [
        CommonAppModule,
        FormsModule,
        TranslateModule,
        TypeaheadModule.forRoot()
    ],
    providers:[
        InventoryService
    ],
    exports: [
        InventorySelectComponent
    ]
})
export class InventorySelectModule {

}
