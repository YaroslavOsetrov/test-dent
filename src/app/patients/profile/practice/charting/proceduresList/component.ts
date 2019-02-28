import {Component, Renderer2, OnInit, OnChanges, Input, ViewChild, EventEmitter, Output} from '@angular/core';

import {TranslateService} from '@ngx-translate/core';

import {SweetAlertService} from '@common/services/sweetalert';
import {PatientService} from '@patients/patients.service';

import {ConfigService} from '@common/services/config';

import * as ProcedureCategories from '@common/json/procedures.json';

@Component({
    selector: 'procedures-list',
    templateUrl:'index.html'
})
export class ProceduresListComponent implements OnInit, OnChanges{
    
    @Output('proceduresAdded') proceduresAdded = new EventEmitter<any>();

    categories = [];

    patient:any;

    tab = 1;

    apptList = [];

    categoriesSub = {
        resto:[],
        rct:[{translate_code:'ch.proc.rctpc2', code:'rctpc'}],
        cr:[{translate_code:'ch.proc.retainer2', code:'retainer'}]
    };
 
    selectedProcedure = {
        code:'',
        subCategories:[],
        subCategoriesCodes:[]
    };

    selectedProcedures = {
        ids:[],
        procedures:[]
    };

    procedureStatus = 'tp';

    appointment = {
        date:null,
        index:0,
        id:null
    };

    isSubmitted = false;

    isSeparated = true;

    search = {
        query:'',
        results:[]
    };    

    @ViewChild('scrollElement') scrollElement:any;


    @Input('plan') plan:any;

    @Input('defaultPlan') defaultPlan:any;

    @Input('selectedTeeth') selectedTeeth = [];



    selectedCategoryIndex = 1;

    procedures = {};

    constructor(private _swalService:SweetAlertService, 
                private translateService:TranslateService,
                private _configService:ConfigService,
                private rendered:Renderer2, 
                private _patientService:PatientService){

        this.categories = ProcedureCategories['items'];

        this.categories.forEach((row, i) => {
			this.procedures[i+1] = [];
		});

        let procedures = this._configService.getProperty('APP_PROCEDURES');
        
        procedures.forEach((row) => {
			this.procedures[row['static_category_id']].push(row);
		})

        let arr = ['mesial', 'oclusial', 'distal', 'lingual', 'buccal'];

        arr.forEach((row) => {
            this.categoriesSub.resto.push({
                multiple:'surface',
                translate_code:'ch.proc.resto_code.'+row,
                code:row.charAt(0),
                data:{
                    material:'composite'
                }
            });
        });

    }

    ngOnInit(){

        this._patientService.patient$.subscribe(
            response => {
                this.patient = response;
            }
        )
    }

    searchProcedure(event){
        this.search.query = event.target.value;

        let procedures = [];
        for (let key in this.procedures){
            procedures = procedures.concat(
                this.procedures[key].filter((row) => {
                    return row['code'].toLowerCase().indexOf(this.search.query.toLowerCase()) != -1 || row['name'].toLowerCase().indexOf(this.search.query.toLowerCase()) != -1;
                })
            )
        }

        this.search.results = procedures;

    }

    ngOnChanges(){

        this.apptList = [];

        if (this.plan){

            if (this.plan['id']){
            }
            else
                if (this.plan.procedures){
                    this.plan.procedures.forEach((appt) => {
                        if (appt.hasOwnProperty('date')){
                            this.apptList.push({id:appt['id'], is_noshow:appt['is_noshow'], is_deleted:appt['is_deleted'], provider_id:appt['provider_id'], date:appt['date']});
                        }
                    })
                }
        }
    }

    setDate(appt){
        this.appointment.id = appt['id'];
        this.appointment.date = appt['date'];
    }

    selectProcedure(item){

        item['price_fee'] = item['fee'];
        item['qty'] = 1;
        if (this.selectedProcedures.ids[item['id']]){
            this.selectedProcedures.procedures = this.selectedProcedures.procedures.filter((row) => {return row['id'] != item['id']});
            this.selectedProcedures.ids[item['id']]=false;
            item['qty'] = null;
        }
        else{
            this.selectedProcedures.procedures.push(item);
            this.selectedProcedures.ids[item['id']] = true;
        }

    }

    selectCategory(index){
        this.selectedCategoryIndex = index+1;
        this.selectedProcedure.code = this.categories[index].code;
    }

    chartSubCategory(subCategory){
        if (this.selectedProcedure.subCategoriesCodes.indexOf(subCategory.code) == -1){
             this.selectedProcedure.subCategoriesCodes.push(subCategory.code);
             this.selectedProcedure.subCategories.push(subCategory);
             this._updateChart();
        }else{
            this._removeChartSubCategory(subCategory);
            
            this.selectedProcedure.subCategoriesCodes.splice(this.selectedProcedure.subCategoriesCodes.indexOf(subCategory.code), 1);

            this.selectedProcedure.subCategories = this.selectedProcedure.subCategories.filter((row) => {
                return row['code'] != subCategory.code;
            })
        }
    }
    
    submit(){

        let proceduresFormatted = [];

        let proceduresSum = 0;

        let isErr = false;

        this.selectedProcedures.procedures.forEach((row) => {
            row['price_fee_adj'] = row['fee'];
            
            if (row['name'] && (row['price_fee_adj'] || row['price_fee_adj'] == 0) && row['qty']){
                
                let procTpl:any = {
                    patient_id          : this.patient.id,
                    appointment_id      : this.appointment.id,
                    appointment_index   : this.appointment.index,
                    chart_code          : this.selectedProcedure.code,
                    surface_indexes     : null,
                    status_code         : this.procedureStatus,
                    diagnosis_code      : null,
                    plan_id             : this.plan['id'],
                    invoice_id          : null,
                    price_code          : row['code'],
                    organization_procedure_id : row['organization_procedure_id'],
                    price_name          : row['name'], 
                    qty                 : Number(row['qty']),
                    price_fee           : Number(row['price_fee']),
                    price_fee_adj       : Number(row['price_fee_adj'])
                };


                if (this.selectedTeeth.length == 0){
                    procTpl['tooth_indexes'] = '';
                    proceduresFormatted.push(procTpl);
                    proceduresSum += Number(row['qty']) * Number(row['price_fee_adj']);
                }else{
                    if (this.isSeparated){
                        this.selectedTeeth.forEach((toothId) => {
                            let procNew = Object.assign({tooth_indexes:toothId}, procTpl);
                            proceduresFormatted.push(procNew);
                            proceduresSum += Number(row['qty']) * Number(row['price_fee_adj']);
                        })
                    }else{
                        procTpl['tooth_indexes'] = this.selectedTeeth.join(',');
                        proceduresFormatted.push(procTpl);
                        proceduresSum += Number(row['qty']) * Number(row['price_fee_adj']);
                    }
                }
                

                
                
            }
        });

        console.log(proceduresFormatted);

        if (proceduresFormatted.length == 0)
            return;

        this.isSubmitted = true;

        this.plan.procedures_sum += proceduresSum;



        this._updateChart();
        this._updatePlanDentalChart();

        this._patientService.addProcedure(this.patient.id, proceduresFormatted).subscribe(
            response => {

                mixpanel.track("patientChartingProceduresAdded");

                response.forEach((procedureAdded) => {
                    if (!this.plan.procedures[procedureAdded['appointment_index']])
                        this.plan.procedures[procedureAdded['appointment_index']] = {
                            appointment_procedures_sum:0,
                            appointment_procedures:[]
                        }
                });

                this.plan.procedures.forEach((planSections, i) => {

                    response.forEach((procedureAdded) => {

                
                        if (
                            (planSections['id'] == procedureAdded['appointment_id'] && procedureAdded['appointment_id'] != null) || 
                            (procedureAdded['appointment_index'] == i && !procedureAdded['appointment_id'])
                        ){
                            this.plan.procedures[i].appointment_procedures_sum += Number(procedureAdded['price_fee_adj']) * Number(procedureAdded['qty']);
                            this.plan.procedures[i].appointment_procedures.unshift(procedureAdded); 
                        }

                    })
                })

                this.isSubmitted = false;
                this.tab = 1;

                this.selectedProcedures.procedures = [];
                this.selectedProcedures.ids = [];

                this.selectedTeeth = [];

                this.proceduresAdded.emit(this.plan);
            }
        )

    }

     _updatePlanDentalChart(){
         if (!this.plan['id']){
            this.patient.dental_chart = this.plan['dental_chart'];
            this._patientService.save(this.patient.id, this.patient).subscribe();
        }else{
            this._patientService.savePlan(this.patient.id, this.plan.id, this.plan).subscribe();
        }
    }

    private _removeChartSubCategory(removedSubCategory){

        this.selectedTeeth.forEach((tooth) => {
            

            if (removedSubCategory.hasOwnProperty('multiple')){

                this.plan.dental_chart[tooth][removedSubCategory['multiple']] = this.plan.dental_chart[tooth][removedSubCategory['multiple']].filter((row) => {
                    return (row['code'] != removedSubCategory['code']);
                })
            }else{
                delete this.plan.dental_chart[tooth][removedSubCategory['code']];
            }
            

        })
    }

    private _updateChart(){

        let status = this.procedureStatus;
        
        if (this.selectedProcedure.code == 'intact'){
            this.selectedTeeth.forEach((tooth) => {
                if (this.plan.dental_chart[tooth]){
                    this.plan.dental_chart[tooth] = {};
                }
            });

            return;
        }

        this.selectedTeeth.forEach((tooth) => {
            if (!this.plan.dental_chart[tooth])
                this.plan.dental_chart[tooth] = {};

            this.plan.dental_chart[tooth][this.selectedProcedure.code] = status;

            let multipleCode = null;

            if (this.selectedProcedure.subCategories.length > 0) 
                if (this.selectedProcedure.subCategories[0].hasOwnProperty('multiple'))
                    multipleCode = this.selectedProcedure.subCategories[0]['multiple'];

            if (multipleCode){
                this.plan.dental_chart[tooth][multipleCode] = [];

                this.selectedProcedure.subCategories.forEach((subCategory) => {

                    let data = {
                        status:status,
                        code:subCategory['code']
                    };

                    for (let key in subCategory['data']){
                        data[key] = subCategory['data'][key];
                    }

                    this.plan.dental_chart[tooth][multipleCode].push(data);
                });
            }else
                this.selectedProcedure.subCategories.forEach((subCategory) => {
                    this.plan.dental_chart[tooth][subCategory['code']] = status;
                });
        });
    }
     
}