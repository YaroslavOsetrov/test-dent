import {Component, OnInit, Input} from '@angular/core';

import {PatientService} from './../../../../patients.service';
import {ConfigService} from './../../../../../common/services/config';

import {AppointmentService} from '@calendar/calendar.service';

import {SweetAlertService} from '@common/services/sweetalert';

import * as uniNotationsObj from './../teeth/uniNotation.json';

@Component({
    selector: 'procedures',
    templateUrl: 'component.html'
})
export class ProceduresComponent implements OnInit {
    
    @Input('plan') plan = {dental_chart:{}, procedures:[], is_default:false, status:0};

    @Input('defaultPlan') defaultPlan = {dental_chart:{}, procedures:[], is_default:false, status:0};

    @Input('isLoaded') isLoaded = {procedures:false, dental_chart:false};

    @Input('uniNotation') uniNotation:any;

    showCheckbox = {};

    selectedProcedures = {};

    patient:any;

    users = {};

    expandedSection = {};

    constructor(private _apptService:AppointmentService, private _patientService:PatientService, private _swalService:SweetAlertService, private _configService:ConfigService){


    }

    ngOnInit(){
        
        this.users = this._configService.usersObj;

        this._patientService.patient$.subscribe(
            response => {
                this.patient = response;
            }
        );
    }

    changeApptStatus(is_confirmed,is_completed,appt){
        
        appt.is_completed = is_completed;
        appt.is_confirmed = is_confirmed;

        this._apptService.save(appt.patient_id, appt.id, appt).subscribe();
    }

    trackBtn(name){
        mixpanel.track("patientChartingProceduresAction", {tab:name});
    }

    toggleProcedure(option){

        if (option.hasOwnProperty('procedure')){
            if (this.selectedProcedures.hasOwnProperty(option.procedure.id))
                delete this.selectedProcedures[option.procedure.id];
            else
                this.selectedProcedures[option.procedure.id] = option.procedure;
        }else{
            
            let selectedCount = 0;
            this.plan.procedures[option.section].appointment_procedures.forEach((row) => {
                if (this.selectedProcedures.hasOwnProperty(row['id']))
                    selectedCount = selectedCount + 1;
            });

            this.plan.procedures[option.section].appointment_procedures.forEach((row) => {
                if (selectedCount == this.plan.procedures[option.section].appointment_procedures.length && selectedCount > 0){
                    delete this.selectedProcedures[row['id']];
                }else{
                    this.selectedProcedures[row['id']] = row;                   
                }
            });

        }

    }

    onInvoiceCreated(invoice){
        
        for(let key in this.selectedProcedures){
            this.selectedProcedures[key].invoice_id = invoice['id'];
        }

        this.selectedProcedures = {};

        //this._patientService.setNewInvoice(invoice);

        this._updateProceduresSum();
    }

    getSectionProceduresSum(sectionIndex){

        let sum = 0;

        this.plan.procedures[sectionIndex].appointment_procedures.forEach((row) => {
            sum += row['qty'] * row['price_fee_adj'];
        })
        return sum;
    }

    expandInventory(procedure){
        
        procedure['is_expanded'] = !procedure['is_expanded'];
    }

    expandSection(sectionIndex){
       
        this.expandedSection[sectionIndex] = !this.expandedSection[sectionIndex];

    }

    getAppointmentDateById(appointment_id){

        for (let i = 0; i<this.defaultPlan.procedures.length; i++){
            if (this.defaultPlan.procedures[i].id == appointment_id){
                return this.defaultPlan.procedures[i].date;
            } 
        }
    }

    getSelectedProceduresStats(){

        let sum = 0;

        for(let key in this.selectedProcedures){
            sum += this.selectedProcedures[key].qty * this.selectedProcedures[key].price_fee_adj;
        }

        return {
            length: Object.keys(this.selectedProcedures).length,
            sum:sum
        }
    }

    changeSection(sectionIndex, selectedProcedures, appointment_id?){

        let procedureIds = [];
        let procedures = [];

        for (let key in selectedProcedures){
            
            if (this.plan['is_default'] || appointment_id){
                selectedProcedures[key].appointment_id = this.defaultPlan.procedures[sectionIndex]['id'];
            }else{
                selectedProcedures[key].appointment_index = sectionIndex;

                if (!this.plan.procedures[sectionIndex]){
                    this.plan.procedures[sectionIndex] = {
                        appointment_procedures:[]
                    }
                }
            }

            procedureIds.push(key);
            procedures.push(selectedProcedures[key]);

            
            
            if (!appointment_id){
                this.plan.procedures[sectionIndex].appointment_procedures.unshift(selectedProcedures[key]);
            } 
            else{
                this.defaultPlan.procedures[sectionIndex].appointment_procedures.unshift(selectedProcedures[key]);
            }  
        }


        let planToUpdate = (!appointment_id) ? this.plan : this.defaultPlan;

        planToUpdate.procedures.forEach((section, i) => {

            if (sectionIndex != i){

                /*planToUpdate.procedures[i].appointment_procedures.forEach((procedure) => {
                    if (procedureIds.indexOf(procedure.id) != -1)
                        planToUpdate.procedures[i].appointment_procedures_sum -= selectedProceduresSum;
                });*/
                planToUpdate.procedures[i].appointment_procedures = planToUpdate.procedures[i].appointment_procedures.filter((procedure) => {
                    return (procedureIds.indexOf(procedure.id) === -1)
                })
            }
           
        });

        if (appointment_id || this.plan['is_default'])
            this._patientService.updateProcedureIndexes(this.patient.id, procedures).subscribe();
        else
            this._fixApptIndexes(procedures);

        this._updateProceduresSum();
       
    }

    private _updateProceduresSum(){

        this.plan.procedures.forEach((section, i) => {
            let sum =  0;

            this.plan.procedures[i].appointment_procedures.forEach((row) => {
                sum += row['qty'] * row['price_fee_adj'];
            });
            this.plan.procedures[i].appointment_procedures_sum = sum;
        })
        

    }

     formatTeeth(teeth){

        if (this.uniNotation){
            let teethOut = [];
            teeth.split(',').forEach((tooth) => {
                teethOut.push(uniNotationsObj[tooth]);
            })
            return teethOut;
        }else
            return teeth;
        
        
    }

    changeStatus(newStatus, selectedProcedures){

        for (let key in selectedProcedures){
            let procedure = selectedProcedures[key];


            let teeth = procedure.tooth_indexes.split(',');

            teeth.forEach((tooth) => {
                if (this.plan.dental_chart[tooth]){
                    this.plan.dental_chart[tooth][procedure['chart_code']] = newStatus;
                }
            })
        }

         this.plan.procedures.forEach((section, i) => {
            section.appointment_procedures.forEach((row, j) => {
                if (Object.keys(selectedProcedures).indexOf(row['id']) != -1)
                    this.plan.procedures[i].appointment_procedures[j].status_code = newStatus;
            })
         });
        

        this._patientService.changeStatus(this.patient.id, {procedureIds:Object.keys(selectedProcedures), status_code:newStatus}).subscribe();

        if (this.plan['is_default']){
            this.patient.dental_chart = this.plan.dental_chart;
            this._patientService.save(this.patient.id, this.patient).subscribe();
        }else{
            this._patientService.savePlan(this.patient.id, this.plan['id'], this.plan).subscribe();
        }
    }

    deleteProcedures(selectedProcedures){


       
        let procedures = {};
        for (let key in selectedProcedures){
            if (!selectedProcedures[key]['invoice_id'])
                 procedures[key] = selectedProcedures[key];               
        }
        

        if (Object.keys(procedures).length > 0)
        this._swalService.confirm({title:'patient.charting.delete_proc.title', text:'patient.charting.delete_proc.descr'}).then(
            confirm => {
                this.plan.procedures.forEach((section, i) => {

                    this.plan.procedures[i].appointment_procedures = this.plan.procedures[i].appointment_procedures.filter(row => {
                        return (Object.keys(procedures).indexOf(row['id']) == -1)
                    })
                });

                if (this.plan)
                    this._fixApptIndexes(procedures);

                this._patientService.deleteProcedures(this.patient.id, Object.keys(procedures)).subscribe();
                this.selectedProcedures = {};

                this._updateProceduresSum();
            }
        )

    }

    private _fixApptIndexes(procedures){
        
        if (!this.plan['is_default']){
            this.plan = this._fixIndexes(this.plan);

            let proceduresToUpdate = [];
            this.plan.procedures.forEach(section => {
                section.appointment_procedures.forEach(procedure => {
                    proceduresToUpdate.push(procedure);
                })
            });

            procedures = proceduresToUpdate;
        }
        this._patientService.updateProcedureIndexes(this.patient.id, procedures).subscribe();
    }

    private _fixIndexes(plan){
        
        let emptyIndexes = [];

        if (!plan['is_default'])
        plan.procedures.forEach((section, i) => {
            if (section.appointment_procedures.length == 0)
                emptyIndexes.push(i);
        })

        emptyIndexes.forEach((index) => {
            for (let i = index; i<plan.procedures.length; i++){
                plan.procedures[i].appointment_procedures.forEach((row) => {
                    row['appointment_index'] -= 1;
                })
            }
        })

        for (let i = emptyIndexes.length -1; i >= 0; i--)
            plan.procedures.splice(emptyIndexes[i],1);
        
        return plan;
    }
}