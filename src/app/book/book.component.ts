import { Component, OnInit, Inject } from '@angular/core';

import {FormBuilder, FormGroup, Validators} from '@angular/forms';

import { Router, ActivatedRoute } from '@angular/router';

import {TranslateService} from '@ngx-translate/core';

import {BookService} from './book.service';

import { environment } from './../../environments/environment';

import * as moment from 'moment';


const step = 6;

declare var drift:any;

@Component({
  selector: 'book',
  templateUrl: 'book.html',
  styleUrls: ['book.less'],
})
export class BookComponent implements OnInit {
    
    appointment = {
        provider:null,
        date:null,
        time:null
    };

    isSubmitted = false;

    patient = {
        fullname:'',
        phone:'',
        note:''
    }

    environmentConfig = environment;

    dateInterval = {
        start: moment.utc(),
        end:moment.utc().add(step, 'days'),
        view:[],
        viewFormatted:[]
    }

    page = 0;

    loadedSlots = {};

    providerId:any;
    organizationId:any;

    provider:any;
    organization:any;

    translateParams = {};

    isConfirmed = false;

    lang = null;

    constructor(private _bookService:BookService, private _translateService:TranslateService, private route:ActivatedRoute, private fb:FormBuilder){
        
        let lang = 'ru';

     /*

        this._translateService.reloadLang(lang).subscribe(
                    response => {
                      
           
                    }
                );
*/
        route.queryParams.subscribe(
            params => {
                
                this.lang = params['lang'];
                

            }
        )
        route.params.subscribe(
            params => {
                this.organizationId = params['providerId'].split(/-(.+)/)[0];
                this.providerId = params['providerId'].split(/-(.+)/)[1];
            }
        )

        this._buildDateInterval();


    }

    selectDate(date){
        this.appointment.date = date;
    }

    ngOnInit(){
        this.loadSlots();


        this._bookService.getSettings(this.organizationId, this.providerId).subscribe(
            response => {
                this.provider = response['provider'];
                this.organization = response['organization'];
                this.translateParams['phone'] = this.organization['phone'];
                this.translateParams['email'] = this.organization['email'];
            }
        )
    }

    selectTime(slot){
        this.appointment.time = slot;
    }

    unselectTime(){
        this.appointment.time = null;
    }

    private _buildDateInterval(){

        this.dateInterval.view = [];
        this.dateInterval.viewFormatted = [];

        for (let m = this.dateInterval.start.clone(); m.isSameOrBefore(this.dateInterval.end); m.add(1, 'days')){
            this.dateInterval.view.push(new Date(m.format('YYYY-MM-DD')));
            this.dateInterval.viewFormatted.push(m.format('YYYY-MM-DD'));

            if (!this.loadedSlots.hasOwnProperty(m.format('YYYY-MM-DD')))
                this.loadedSlots[m.format('YYYY-MM-DD')] = [];
        }

    }

    next(){
        this.dateInterval.start = this.dateInterval.end.clone().add(1, 'days');
        this.dateInterval.end = this.dateInterval.start.clone().add(step, 'days');

        this.page += 1;

        this._buildDateInterval();
    }

    prev(){
        this.dateInterval.end = this.dateInterval.start.clone().add(-1, 'days');
        this.dateInterval.start = this.dateInterval.end.clone().add(-1 * step, 'days');

        this.page -=1 ;

        this._buildDateInterval();
    }

    loadSlots(){



        this._bookService.getSlots(
            this.organizationId, 
            this.providerId,
            this.dateInterval.start.format('YYYY-MM-DD'), 
            this.dateInterval.end.format('YYYY-MM-DD')).subscribe(
            response => {
             //   this.selectDate(this.dateInterval.start.format('YYYY-MM-DD'));
                for (let key in response){
                    
                    this.loadedSlots[key] = response[key];
                }
            }
        )
    }

    back(){
        if (this.appointment.time && this.appointment.date){
            this.appointment.time = null;
        }else if (!this.appointment.time)
            this.appointment.date = null;
    }

    save(){

        if (!this.patient['fullname'] || !this.patient['phone'])
            return;
        
        this.isSubmitted = true;

        this._bookService.addRequest(this.organizationId, this.providerId, {
            fullname:this.patient['fullname'],
            phone:this.patient['phone'],
            note:this.patient['note'],
            provider_id:this.providerId,
            date:this.appointment.date,
            time:this.appointment.time.time,
            room_id:this.appointment.time.room_id,
            office_id:this.appointment.time.office_id
        }).subscribe(
            response => {
                this.isSubmitted = false;
                this.isConfirmed = true;
            }, errors => {
               // this.isSubmitted = false;
            }
        )
    }

}