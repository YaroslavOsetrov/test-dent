import {NgModule, Component, OnChanges, forwardRef, Input, Output, EventEmitter} from '@angular/core'
import {RouterModule} from '@angular/router'

import {CommonModule} from '@angular/common';

import {FormsModule, AbstractControl, Validator, ControlValueAccessor, NG_VALUE_ACCESSOR, NG_VALIDATORS} from '@angular/forms';


import {TypeaheadModule} from 'ngx-bootstrap';

import {TranslateModule} from '@ngx-translate/core';

import {PatientService} from './../patients.service';

import { Observable } from 'rxjs';
import { TypeaheadMatch } from 'ngx-bootstrap/typeahead';

import {CommonAppModule} from './../../common';

import { mergeMap } from 'rxjs/operators';



@Component({
    selector: 'patient-select',
    providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PatientSelectComponent),
      multi: true,
    }],
    template: `
        <div class="input-dropdown-wrapper" style="position:relative">
        <ng-template #customItemTemplate let-model="item" let-index="index">
            <div class="user-row user-dropdown-caption tbl">
                <div class="cell-avatar cell-avatar-lg">
                    <label style="    position: absolute;
    z-index: 111111;
    font-size: 0.7em;
    margin-top:13px;
    right: 15px;" *ngIf="model.total_debts>0" class="label label-danger filled-in">{{model.total_debts|myCurrency}}</label>
                    <div class="avatar-letters">{{model.patient_user.fullname|nameLetters}}</div>
                </div>
                <div class="col cell-info">
                    {{model.patient_user.fullname}}
                    <div class="pt5 text-muted mb0">
                        {{model.patient_user.phone}}
                    </div>
                </div>
            </div>
        </ng-template>
        <div class="">
             <input 
             required
            [(ngModel)]="asyncSelected"
            #asyncSel="ngModel"
            [readonly]="isExisting"
            [typeahead]="dataSource"
            [typeaheadItemTemplate]="customItemTemplate"
            (typeaheadLoading)="changeTypeaheadLoading($event)"
            (typeaheadNoResults)="changeTypeaheadNoResults($event)"
            (typeaheadOnSelect)="typeaheadOnSelect($event)"
            typeaheadOptionField="patient_user.fullname"
            (input)="onInput($event)"
            typeaheadOptionsLimit="4"
            [typeaheadWaitMs]="500"
            [typeaheadMinLength]="2"
            typeaheadOptionField="name"
            placeholder="{{'patient.search'|translate}}"
            class="form-control">
            <span *ngIf="typeaheadLoading" style="    position: absolute;
    top: 0px;
    background: transparent;
    right: 0;" class="input-group-addon">
                <div class="loader-hor-wrapper">
                    <div class="loader loader-sm" style="position: absolute; margin-top: -16px;"></div>
                </div>
                <span style="visibility: hidden;" class="sl sl-icon-tag"></span>
            </span> 
            <a target="_blank" *ngIf="!typeaheadLoading && (isExisting || !is_new) && selectedPatient"  href="/patients/{{selectedPatient?.id}}" style="position: absolute;
    top: 0px;
    background: transparent;
    right: 0;" class="input-group-addon" [ngClass]="{'input-group-addon-link':!is_new}">
           
            <i [ngClass]="{'sl-icon-link':!is_new || isExisting}" class="sl"></i>
            <i [ngClass]="{'sl-icon-link':(!is_new || isExisting) && !selectedPatient}" class="sl"></i>
            </a>
        </div>
        <div class="validation-message">
         <!--<small *ngIf="exErr" class="text-danger">{{'Errors.RequiredPatient'|translate}}</small>-->
        <!--<small *ngIf="asyncSel.errors && asyncSel.touched && !exErr" class="text-danger">{{'Errors.Required'|translate}}</small>-->
        </div>
       </div>`
})
export class PatientSelectComponent implements ControlValueAccessor, OnChanges{
    
    @Output('patientSelected') patientSelected:EventEmitter<any> = new EventEmitter<any>();

    public is_new:boolean = true;
    
    @Input('existingOnly') existingOnly:boolean;

    @Input('isExisting') isExisting:boolean;

    @Input('defaultPatient') defaultPatient:any;

    public asyncSelected: string = '';
    public typeaheadLoading: boolean;
    public typeaheadNoResults: boolean;
    public dataSource: Observable<any>;

    exErr:boolean = false;

    public selectedPatient:any;

  public constructor(private patientService:PatientService) {
    this.dataSource = Observable
      .create((observer: any) => {
        // Runs on every search
        observer.next(this.asyncSelected);
      })
      .pipe(mergeMap((token: string) => this.getStatesAsObservable(token)));
  }

    public writeValue(obj:any){
        if (obj){
            this.asyncSelected = obj;
        }
    }

    private propagateChange = (_: any) => { };

    public registerOnChange(fn: any) {
        this.propagateChange = fn;
    }

    public registerOnTouched() { }
 
  public getStatesAsObservable(token: string): Observable<any> {
    let query = new RegExp(token, 'ig');
    
    if (this.selectedPatient != null)
    if (this.selectedPatient.patient_user.fullname != token){
        this.is_new = true;
    }

    this.asyncSelected = token;
    this.propagateChange(this.asyncSelected);

    if (this.is_new && this.existingOnly && token.length > 0){
        this.exErr = true;
    }

    this.patientSelected.emit({is_new:this.is_new, fullname:token, patient:this.selectedPatient});

    return this.patientService.get('active', 0,'fullname=asc',token);
  }
 
  public changeTypeaheadLoading(e: boolean): void {
    this.typeaheadLoading = e;
  }
 
  reset(){
      if (this.defaultPatient)
      this.selectedPatient = this.defaultPatient;
      else
      this.selectedPatient = null;

      this.asyncSelected = '';
       this.propagateChange(this.asyncSelected);
      this.exErr = false;

  }

  public changeTypeaheadNoResults(e: boolean): void {
    this.typeaheadNoResults = e;
  }

    ngOnChanges(){
        if (this.defaultPatient){
            this.selectedPatient = this.defaultPatient;
            this.asyncSelected = this.defaultPatient.patient_user.fullname;

            this.propagateChange(this.asyncSelected);
            this.is_new = false;
        }
    }


  onInput(event){

    if (!this.is_new && event.target.value.length <= 1){
        this.exErr = true;
    }

    if (this.isExisting){
        this.patientSelected.emit({is_new:true, fullname:event.target.value});
    }

    


     this.asyncSelected = event.target.value;
     this.propagateChange(this.asyncSelected);
  }
 
  public typeaheadOnSelect(e: TypeaheadMatch): void {

    this.selectedPatient = e.item;
    this.asyncSelected = e.item.patient_user.fullname;
    this.is_new = false;
    this.exErr = false;

    this.patientSelected.emit({is_new:this.is_new, patient:this.selectedPatient});
  }

}
@NgModule({
    declarations: [
        PatientSelectComponent,
    ],
    imports: [
        CommonAppModule,
        FormsModule,
        TranslateModule,
        TypeaheadModule.forRoot()
    ],
    providers:[
        PatientService
    ],
    exports: [
        PatientSelectComponent
    ]
})
export class PatientSelectModule {

}
