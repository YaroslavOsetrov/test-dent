import { Component, Output, Input, OnChanges, OnInit, EventEmitter, HostListener, ViewChild } from '@angular/core';

import {ConfigService} from '@common/services/config';

import {OrganizationService} from './../../settings/organization/service';

import * as moment from 'moment';


@Component({
    selector: 'task-box',
    templateUrl: 'component.html'
})
export class TaskBoxComponent implements OnInit {


    expanded = false;

    @Input('interval') calDate:any;

    @Output('tasksLoaded') tasksLoaded = new EventEmitter<any>();

    loadedTasks = [];

    activeTasks = [];

    dueTasks = [];

    tasks = {
        due:[],
        upcoming:[]
    };

    constructor(
        private _configService:ConfigService,
        private _organizationService:OrganizationService){

    }

    ngOnInit(){

        let userId = this._configService.account.id;

        this._organizationService.getDueTasks(userId).subscribe(
            response => {
                this.tasksLoaded.emit(true);
                this.tasks.due = response;
            }
        )

        this._organizationService.getTasks(userId, 
            moment().format('YYYY-MM-DD'), 
            moment().add(14, 'days').format('YYYY-MM-DD')).subscribe(
            response => {
                this.tasksLoaded.emit(true);
                this.tasks.upcoming = response;
                
            }
        )

    }

    toggle(){

        this.expanded = !this.expanded;

        if (this.expanded)
            mixpanel.track("calendarTaskBoxShow");

    }

    onTaskAdded(task){
        task.is_new = true;
        this.tasks.due.unshift(task);
    }

    onTaskSaved(task){
        this.tasks.due.concat(this.tasks.upcoming).forEach((row, i) => {
            
            if (row['id'] == task['id']){

                if (task['is_completed']){
                    if (i+1 <= this.tasks.due.length){
                        this.tasks.due.splice(i, 1);
                    }else{
                        this.tasks.upcoming.splice(i-this.tasks.due.length+1, 1);
                    }
                }else
                    if (i+1 <= this.tasks.due.length){
                        this.tasks.due[i]  = task;
                    }else{
                        this.tasks.upcoming[i] = task;
                    }
            }
        })
    }

    onTaskDeleted(task){
        this.tasks.due.concat(this.tasks.upcoming).forEach((row, i) => {
            if (row['id'] == task['id']){
                if (i+1 <= this.tasks.due.length){
                    this.tasks.due.splice(i, 1);
                }else{
                    this.tasks.upcoming.splice(i-this.tasks.due.length+1, 1);
                }
            }
        });
    }
}