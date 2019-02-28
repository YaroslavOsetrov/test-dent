import {NgModule, Component, Input, Output, EventEmitter, forwardRef} from '@angular/core';

import {CommonModule} from '@angular/common';

import {FormsModule, AbstractControl, Validator, ControlValueAccessor, NG_VALUE_ACCESSOR, NG_VALIDATORS} from '@angular/forms';

import {CommonAppModule} from './../../../../../common';

import {TranslateModule} from '@ngx-translate/core';

import {TypeaheadModule } from 'ngx-bootstrap/typeahead';

import {ConfigService} from './../../../../../common/services/config';


const noop = () => {
};

@Component({
    selector: 'select-procedure',
    providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectProcedureInputComponent),
      multi: true,
    }],
    templateUrl:'index.html'
})
export class SelectProcedureInputComponent implements ControlValueAccessor{

    priceList:any;

    private innerValue: any = '';

    @Input('placeholder') placeholder:string = '';


    @Output('emptyProcedureAdded') emptyProcedureAdded = new EventEmitter<any>();
    @Output('procedureSelected') procedureSelected:EventEmitter<any> = new EventEmitter<any>();

    constructor(private configService:ConfigService){

        this.priceList = [];

        let priceDef = this.configService.procedures;

        priceDef.forEach((procedure) => {

            procedure.fee = procedure.fee;
            procedure.namefull = procedure.code + '*<>*<>*' + procedure.name;
            this.priceList.push(procedure);
        });
    }

    private onTouchedCallback: () => void = noop;
    private onChangeCallback: (_: any) => void = noop;

    get value(): any {
        return this.innerValue;
    };

     writeValue(value: any) {

        if (value !== this.innerValue) {
            this.innerValue = value;
        }
    }

    set value(v: any) {
        
        let final = v;

        if (v.indexOf('*<>*<>*') !== -1){
            final = v.split('*<>*<>*')[1];
        }


        if (v !== this.innerValue) {
            this.innerValue = final;
            this.onChangeCallback(final);
        }
    }

    onInput(event){
        this.emptyProcedureAdded.emit(this.innerValue);
    }

    selectItem(event){
        this.procedureSelected.emit(event.item);
    }

    //From ControlValueAccessor interface
    registerOnChange(fn: any) {
        this.onChangeCallback = fn;
    }

    //From ControlValueAccessor interface
    registerOnTouched(fn: any) {
        this.onTouchedCallback = fn;
    }

}


@NgModule({
    declarations: [
        SelectProcedureInputComponent,
    ],
    imports: [
        CommonModule,
        FormsModule,
        CommonAppModule,
        TranslateModule,
        TypeaheadModule.forRoot()
    ],
    providers:[
        ConfigService
    ],
    exports: [
        SelectProcedureInputComponent
    ]
})
export class ProcedureSelectModule {

}
