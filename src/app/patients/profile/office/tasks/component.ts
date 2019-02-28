import {Component, OnInit, Output, EventEmitter} from '@angular/core';
import {PatientService} from './../../../patients.service';

import {ConfigService} from './../../../../common/services/config';

import * as moment from 'moment';

@Component({
    selector: 'tasks',
    templateUrl: 'component.html'
})
export class TasksComponent implements OnInit {


    @Output('dueTasks') dueTasks = new EventEmitter<any>();

    tasks = {
        due:[],
        upcoming:[],
        archived:[]
    }

    localeFormat:any;

    constructor(private _configService:ConfigService, private _patientService:PatientService){

        this.localeFormat = this._configService.country.locale_format;

    }

    ngOnInit(){
        this._patientService.patientId$.subscribe(
            patientId => {
                if (patientId){
                    this._patientService.getTasks(patientId).subscribe(
                        response => {
                            this._insertTasks(response);
                        }
                    )
                }
            }
        ); 
    }

    isArchived(task){
        let days = 180;
        return (task.is_completed || (Math.abs(moment().diff(moment(task['date'], 'YYYY-MM-DD'), 'days')) > days && Number(moment(task['date'], 'YYYY-MM-DD').format('YYYY')) < new Date().getFullYear()));
    }

    isUpcoming(task){
        return moment().isBefore(moment(task.date, 'YYYY-MM-DD')) && !task.is_completed;            
    }

    isDue(task){
        return (!this.isArchived(task) && !this.isUpcoming(task) && !task.is_completed);   
    }

    onTaskAdded(task){
        task.provider = task.user;
        this.tasks.upcoming.unshift(task);
    }

    onTaskDeleted(task){
        this._deleteTask(task);
    }

    onTaskSaved(task){
        this._deleteTask(task);
        this._putInto(task);
        
    }

    private _deleteTask(task){
        for (let key in this.tasks){
            this.tasks[key].forEach((row, i) => {
                if (row['id'] == task['id']){
                    this.tasks[key].splice(i, 1);
                }
            });   
        }
    }

    private _insertTasks(tasks){

        tasks.forEach((row) => {
            this._putInto(row);
        })

        this.dueTasks.emit(this.tasks.due);
    }

    private _putInto(task){
        if (this.isArchived(task))
            this.tasks.archived.push(task);
        if (this.isUpcoming(task))
            this.tasks.upcoming.unshift(task);
        if (this.isDue(task))
            this.tasks.due.push(task);
    }
}