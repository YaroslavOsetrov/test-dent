import { Component, AfterViewInit, OnInit, EventEmitter, Renderer2, HostListener, ViewChild } from '@angular/core';

import {Router, ActivatedRoute} from '@angular/router';

import {FullCalendar} from './fullcalendar';

import {CreateModalComponent} from './createModal/component';
import {EditModalComponent} from './editModal/component';

import {ConfigService} from '@common/services/config';
import {SweetAlertService} from '@common/services/sweetalert';

import {CalendarSettingsService, AppointmentService} from './calendar.service';
import {CalendarSettings} from './calendar.model';

import {AppointmentModel} from '@common/models/appointment/main';

import { defineLocale } from 'ngx-bootstrap/chronos';

import * as moment from 'moment';

import {UserModel} from '@common/models/user/main';

import {TranslateService} from '@ngx-translate/core';
import * as dateLocale from './../../../public/i18n/date.json';


import {PatientService} from '@patients/patients.service';

import {SettingsModalComponent} from './settingsModal/component';
import {TaskBoxComponent} from './taskBox/component';
import {WorkhoursSelectComponent} from './workhoursSelect/component';

import introJs from 'intro.js/intro.js';

@Component({
    selector: 'calendar',
    templateUrl: 'calendar.html'
})
export class CalendarComponent implements OnInit, AfterViewInit {

	@ViewChild(FullCalendar) fullCalendar:FullCalendar;
	@ViewChild(CreateModalComponent) createModal:CreateModalComponent;


	@ViewChild('taskBox') taskBox:TaskBoxComponent;

	@ViewChild('workhoursSelect') workhoursSelectComponent:WorkhoursSelectComponent;

	@ViewChild('settingsModal') settingsModal:SettingsModalComponent;

	@ViewChild(EditModalComponent) editModal:EditModalComponent;

	selected = {
		section_index:0,
		section_sub_index:null
	}

    calOpts:any;

	calInterval:string = '';

	isLoading:boolean = false;

	calendarSettings:CalendarSettings;

	datepickerOptions:any = {
		starting_day: 1
	};

	account:any;

	calDate:any;

	intervalNow:any;
	
	providers:Array<UserModel> =[];

	organizationUsersObj = {};

	organizationUsersSelected:Array<string> = [];

	loadedEvents:Array<AppointmentModel> = [];

	loadedEventsIds = [];

	loadedWeeks:Array<{start:string, end:string}> = [];

	isWorkhoursLayout = false;
	providerId = null;

	providerIndex = -1;

	defaultPatient = null;

	currentProviders = [];

	calendarSettingsUpdated:any;

	isOpenDD = false;

	providersObj = {};

	offices = [];
	selectedOffice:any = {};

	showBottomTabs = true;

    constructor(private _configService:ConfigService, 
				private router:Router,
				private rendered:Renderer2,
				private _swalService:SweetAlertService,
				private _translateService:TranslateService,
				private route:ActivatedRoute,
				private appointmentService:AppointmentService,
				private patientService:PatientService,
				private calendarSettingsService:CalendarSettingsService){
					
		this.account = this._configService.account;
		
		this.route.queryParams.subscribe(
			params => {
				if (params['patientId']){

					this.patientService.getById(params['patientId']).subscribe(
						response => {
							this.defaultPatient = response;
						}
					)
				}
				if (params['providerId']){
					this.providerId = null;
					
					if (this._configService.users)
					this._configService.users.forEach((row, i) => {
						if (row['id'] == params['providerId']){
							this.providerIndex = i;
							this.providerId = row['id'];
						}
					});
					this.isWorkhoursLayout = true;
				}
			}
		)

		let mutationObserver = new MutationObserver((mutations) => {
			mutations.forEach((mutation) => {
				let className = (<any>mutation.target).getAttribute('class');

				if (className == 'modal-backdrop fade in')
					this.showBottomTabs = false;
				
				if (className == 'modal-backdrop fade')
					this.showBottomTabs = true;
			});
		});

		
		mutationObserver.observe(document, {
			subtree: true,
			attributes: true
		//...
		});

		this.offices = this._configService.getProperty('APP_OFFICES');
		this.selectedOffice = this.offices[0];
    }

	toggleProviderEdit(state){
		this.isWorkhoursLayout = state;
		this.fullCalendar.filterOfficeEvents(this.selectedOffice, this.loadedEvents);
	}

	draggingEvent:AppointmentModel = {};

	onTaskAdded(task){
	//	this.taskBox.insertTask(task);
	}

	onCalendarSettingsUpdated(event:CalendarSettings){
		this.calendarSettings = event;

		let resources = [];

		this.selectedOffice.rooms.forEach((row, i) => {
			resources.push({id: row['id'], title: row['name']})
		});

		this._configService.scheduler = this.calendarSettings;

		this.fullCalendar.setDynamicOptions({
			defaultView: this._defineAgendaView(resources),
			resources	: resources,
			slotDuration: this._formatSlotDuration(this.calendarSettings.slot_duration),
			minTime		: this.calendarSettings.start_hour + ':00:00',
			maxTime		: this.calendarSettings.end_hour + ':00:00',
			firstDay	: this.calendarSettings.first_day_index,
			hiddenDays:this.calendarSettings.hidden_days ? this.calendarSettings.hidden_days.split(',').map(Number) : []
		});

		let sett = Object.assign({}, this.calendarSettings);
		sett['rooms'] = this.selectedOffice.rooms;
		this.calendarSettingsService.save(sett).subscribe();

		this.fullCalendar.filterOfficeEvents(this.selectedOffice, this.loadedEvents);
	
	}

    ngOnInit(){

		

		if (this._configService.users)
			this._configService.users.forEach((row, i) => {
					this.providersObj[row['id']] = row;
			});

		defineLocale(moment.locale(), {
            months  : moment.months(),
            monthsShort : moment.monthsShort(),
            weekdays : moment.weekdays(),
            weekdaysShort : moment.weekdaysShort(),
            weekdaysMin  : moment.weekdaysMin(),
            week:{
                dow:(this._configService.scheduler) ? this._configService.scheduler.first_day_index : 0,
                doy:new Date(new Date().getFullYear(), 0, 1).getDay()
            }
        })

		this.providers = this._configService.users.filter((row) => {
			return row.user_roles[0].is_doctor == true;	
		});

		this.organizationUsersObj = {};

		this.providers.forEach((row)=>{
			this.organizationUsersSelected.push(row.id);
			this.organizationUsersObj[row['id']] = row;
		});


		this.calendarSettings = this._configService.scheduler;

		 if (!this.calendarSettings.slot_duration){
            this.calendarSettings.slot_duration = 15;
        }
		
		this.datepickerOptions.starting_day = this.calendarSettings.first_day_index;

		let resources = [];

		 if (typeof this.calendarSettings.sections[0] === 'string'){
			this.calendarSettings.sections = [{
				name:'clinic_def',
				section_sub:this.calendarSettings.sections
			}]
		}

		this.selectedOffice.rooms.forEach((row, i) => {
			resources.push({id:row['id'],title: row['name']})
		});

		let timeFormat = this._configService.country.locale_format.time_mom;

		this.calOpts = {
			firstDay:this.calendarSettings.first_day_index,
			minTime: this.calendarSettings.start_hour + ':00:00',
			maxTime: this.calendarSettings.end_hour + ':00:00',
			defaultView: this._defineAgendaView(resources),
			slotDuration:this._formatSlotDuration(this.calendarSettings.slot_duration),
			contentHeight: 'auto',
			timezone:'UTC',
			slotLabelFormat: timeFormat,
			timeFormat:timeFormat,
			slotLabelInterval:'01:00:00',
			editable: true,
			columnFormat:this._configService.country.locale_format.cal_col,
			titleFormat:'MMM D YYYY',
			monthNames:dateLocale[this._translateService.currentLang]['month_names'],
			monthNamesShort:dateLocale[this._translateService.currentLang]['months_names_short'],
			dayNames:dateLocale[this._translateService.currentLang]['day_names'],
			dayNamesShort:dateLocale[this._translateService.currentLang]['day_names_short'],
			selectable: true,
			hiddenDays:this.calendarSettings.hidden_days ? this.calendarSettings.hidden_days.split(',').map(Number) : [],
			allDaySlot:false,
			displayEventEnd :false,
			droppable: true, // this allows things to be dropped onto the calendar
            dragRevertDuration: 0,
			views: {
				agendaTwoDay: {
					type: 'agenda',
					dayCount: 2,
					groupByDateAndResource: true
				}
			},
			selectOverlap: (event, eventOverlap) => {
		
				if (event)
				if (event.rendering === 'background' && this.workhoursSelectComponent.selectedProvider){

					

					if (event.hasOwnProperty('id')){

						this._swalService.confirm({
							title:'cal.workhours.delete.title',
							text:'cal.workhours.delete.descr'
						}).then(confirmed => {
							this.fullCalendar.removeEvent(event['id']);

							this.appointmentService.deleteWorkhour(event['id']).subscribe();

							this.loadedEvents = this.loadedEvents.filter((row) => {
								return row['id'] !== event['id'];
							})
						})
					}
					
				}else
				return (event.rendering !== 'background' || !this.isWorkhoursLayout);
			},
			resources: resources,
			events: [
			],
			eventDragStart:(event:AppointmentModel) => {
				this.draggingEvent = event;
			},
			eventDrop:(event:AppointmentModel) => {
				this.updateCalendarEvent(event);
			},
			eventRender:(data, element) => {
				if (element[0].childNodes[0])
					if (typeof element[0].childNodes[0].childNodes[1] !== 'undefined')
						element[0].childNodes[0].childNodes[1].innerHTML = data.title;
			},
			eventResize:(event:AppointmentModel) => {
				this.updateCalendarEvent(event);
			},
			viewRender:(view, element) => {
				this.loadAppts(view.start._d, view.end._d);
				this.calInterval = this.formatInterval(view.start._d, view.end._d);

				this.intervalNow = {
					start:view.start._d,
					end:view.end._d
				};
			},
			select: (start, end, jsEvent, view, resource) => {
				if (!this.account.role.appointments && !this.account.is_founder){
					this._swalService.message({
						title:'cal.no_access.title',
						text:'cal.no_access.descr',
						type:'error'
					})
					return;
				}

				let options = {
					section_sub_index:0,
					start_time:start.format('HH:mm'),
					office_id:this.selectedOffice.id,
					room_id:(resource) ? resource['id'] : this.selectedOffice.rooms[0]['id'],
					end_time:end.format('HH:mm'),
					date:start.format('YYYY-MM-DD')
				};

				if (this.workhoursSelectComponent.selectedProvider){
					this.workhoursSelectComponent.saveAndRender(options);
					return false;
				}else{

					let providerId = '';

					this.loadedEvents.forEach((row) => {

						if (row['rendering'] == 'background' && row['office_id'] == options.office_id && row['room_id'] == options.room_id && options.date == moment(row['date']).format('YYYY-MM-DD')){

							let eventStart = moment.utc('1970-01-01T'+options.start_time, 'YYYY-MM-DDTHH:mm');
							let bgEvent = {
								start:moment.utc(row['start_time']),
								end:moment.utc(row['end_time'])
							};
							if (eventStart.isSameOrAfter(bgEvent.start) && eventStart.isSameOrBefore(bgEvent.end)){
								providerId = row['user_id'];
							}
						}
					});
					if (providerId){
						options['provider_id'] = providerId;
					}

					options['section_index'] = this.selected.section_index;

					mixpanel.track("calendarCreateApptShow");

					this.createModal.show(options);
				}
					
			},
			eventClick:(event, jsEvent, view) => {
				this.editModal.show(event);
			}
		};
    }

	ngAfterViewInit(){

		 this.rendered.listen('document', 'DOMNodeInserted', (event) => {
			 
			if (event.target.className)
			if (typeof event.target.className === 'string')
			if (event.target.className.indexOf('fc-bgevent') != -1){
				let sections:any;
				if (document)
					sections = document.getElementsByClassName('fc-bgevent');

				if (sections.length > 0){
					for (let i = 0; i<sections.length; i++){
						let providerId = sections[i].className.replace('fc-bgevent', '').replace('provider-bg-', '').trim();

						let provider = this.providers.find((row) => { 
							return row['id'] == providerId;
						});

						for (let j = 1; j<=20; j++){
							let span = this.rendered.createElement('span');
							span.appendChild(this.rendered.createText(provider.fullname));
							sections[i].appendChild(span);
						}
						
					}
				}
			}
		 });

	}

	toggleUser(id){

		let index = this.organizationUsersSelected.indexOf(id);
		if (index == -1){
			this.organizationUsersSelected.push(id);
		}else{
			this.organizationUsersSelected.splice(index, 1);
		}
		this.fullCalendar.filterOfficeEvents(this.selectedOffice, this.loadedEvents);
	}

	toggleWorkhoursLayout(){

		this.isWorkhoursLayout = !this.isWorkhoursLayout;

		if (!this.isWorkhoursLayout){
			this.router.navigate(['/calendar']);
		}else{
			this.router.navigate(['/calendar'], { queryParams: {providerId:this.providers[0].id}, queryParamsHandling: 'merge' });
		}

		this.fullCalendar.filterOfficeEvents(this.selectedOffice, this.loadedEvents);

	}

	onAppointmentEdited(appt){

		if (appt['widget']){
			this.fullCalendar.removeEvent(appt['widget_id']);
			appt['widget'] = null;
			this.appointmentCreated(appt);
		}else
			this.updateCalendarEvent(appt, true);
	}

	onWorkhoursProviderSelected(provider){
		this.isOpenDD = false;
		this.router.navigate(['/calendar'], { queryParams: { providerId: provider['id']}, queryParamsHandling: 'merge' });
	}

	onAppointmentDeleted(appt){
		this.fullCalendar.removeEvent(appt['id']);
	}

	onDatepickerChange(date){
		this.fullCalendar.setDate(date);
	}

	onOfficeSelected(office){

		let resources = [];
		office.rooms.forEach((row) => {
			resources.push({id:row['id'], title:row['name']})
		});

		this.fullCalendar.setDynamicOptions({
			defaultView:this._defineAgendaView(office.rooms),
			resources : resources
		});

		this.selectedOffice = office;

		this.fullCalendar.filterOfficeEvents(this.selectedOffice, this.loadedEvents);
	}

	onSectionChanged(){
		
		let type = 'agendaWeek';

		if (this.selected.section_sub_index == null){
			type = this._defineAgendaView(this.calendarSettings.sections[this.selected.section_index].section_sub);
		}

		let resources = [];

		this.calendarSettings.sections[this.selected.section_index].section_sub.forEach((row, i) => {
			resources.push({ id:  (i + 1) + '', title: row })
		});

		this.fullCalendar.setDynamicOptions({
			defaultView:type,
			slotDuration:this._formatSlotDuration(this.calendarSettings.slot_duration),
			minTime		: this.calendarSettings.start_hour + ':00:00',
			resources	: resources,
			maxTime		: this.calendarSettings.end_hour + ':00:00',
			firstDay	: this.calendarSettings.first_day_index
		});

        this._configService.scheduler = this.calendarSettings;

		this.fullCalendar.filterOfficeEvents(this.selectedOffice, this.loadedEvents);
	}

	onInvoiceAdded(event){

		this.fullCalendar.filterOfficeEvents(this.selectedOffice, this.loadedEvents);
	
	}

	onTaskEdited(event){

	}

	refreshAllDayCount(type, event){

		event['date'] = moment(event['date']).format('YYYY-MM-DD');

		let fieldId = '';

		switch(type){
			case 'invoices': fieldId = 'invoice_id';
			case 'tasks':fieldId = 'id';
		}

		if (type == 'invoices'){
			if (!event['isPaid'])
				return;
		}

		if (type == 'tasks')
			if (!event['is_completed'])
				return;

		this.fullCalendar.filterOfficeEvents(this.selectedOffice, this.loadedEvents);

	}

	todayDate(){
		let m = moment.utc();

		this.fullCalendar.setDate(m.format('YYYY-MM-DD'));
	}

	appointmentCreated(event){
		
		
		let ev = [];
	//	if (!event['start'] && !event['end']){
			event['start'] 		= event['date'] + 'T' + event['start_time'];
			event['end'] 		= event['date'] + 'T' + event['end_time'];
	//	}

		if (event['patient'])
		if (!event['patient']['patient_notes_office'])
			event['patient']['patient_notes_office'] = [];

//		event['start_time'] = moment.utc(event['start_time'], this._configService.country.locale_format.time_mom).toDate();
//		event['end_time'] = moment.utc(event['end_time'], this._configService.country.locale_format.time_mom).toDate();

		event['title'] = this._formatEventTitle(event);
		event['resourceId'] = event['room_id'];
		event['className']  = (event['patient_id']) ? ('provider-'+(this.organizationUsersSelected.indexOf(event['provider_id'])+1)+ this.getClassStatus(event)) : 'blank';
		ev.push(event);
		this.loadedEvents.push(event);

		this.fullCalendar.addEvents(ev);

	}

	private updateCalendarEvent(event, replaceContentOnly?:boolean):void{

		event['title'] = this._formatEventTitle(event);
		event['className']  = (event['patient_id']) ? ('provider-'+(this.organizationUsersSelected.indexOf(event['provider_id'])+1)+ this.getClassStatus(event)) : 'blank';
		

		this.fullCalendar.removeEvent(event['id']);
		this.fullCalendar.addEvents([event]);

		if (replaceContentOnly)
			return;

		let appt:AppointmentModel = {};

		event['date'] = event['start'].format('YYYY-MM-DD');
		event['start_time'] = event['start'].format('HH:mm');
		event['end_time'] = event['end'].format('HH:mm');
		event['room_id'] = event['resourceId'];

		for(var k in event){
			if (!(event[k] instanceof Object))
				appt[k] = event[k];
		}

		if (appt['patient_id'])
			this.appointmentService.save(appt['patient_id'], appt['id'], appt).subscribe();
		else
			this.appointmentService.saveBlank(appt).subscribe();
			
	}

	private loadAppts(start, end){
		
		let startDate = moment(start);
		let endDate = moment(end).subtract(1, 'days');
		let daysDiff =  endDate.diff(startDate, 'days');
		
		if (this.isWeekLoaded(startDate.format('YYYY-MM-DD'), endDate.format('YYYY-MM-DD')))
			return;

		this.loadedWeeks.push({start:startDate.format('YYYY-MM-DD'), end:endDate.format('YYYY-MM-DD')});
		this.isLoading = true;

		this.appointmentService.getWorkhours(startDate.format('YYYY-MM-DD'), endDate.format('YYYY-MM-DD')).subscribe(
			response => {
				
				response.forEach((row, i) => {

					//quick fix
					if (!row['room_id']){
						row['office_id'] = 1;
						row['room_id'] = 1;
					}

					row['start'] 		= this._formatEventDate(row['date'], row['start_time']);
					row['end'] 			= this._formatEventDate(row['date'], row['end_time']);
					row['resourceId'] 	= row['room_id'];
					row['rendering']    = 'background',
					row['className']	= 'provider-bg-' + row['user_id'];
				});
				this.loadedEvents = this.loadedEvents.concat(response);
				this.fullCalendar.filterOfficeEvents(this.selectedOffice, this.loadedEvents);
			}
		);

		this.appointmentService.getBookings(startDate.format('YYYY-MM-DD'), endDate.format('YYYY-MM-DD')).subscribe(
			response => {
				response.forEach((row) => {

					row['start'] 		= this._formatEventDate(row['date'], row['time']);
					row['end'] 			= moment.utc(row['start']).add(60, 'minutes').format();
					row['resourceId']	= row['room_id'];

					row['start_time'] 	= row['time'];
					row['end_time'] 	= moment.utc(row['time']).add(60, 'minutes').toDate()

					row['widget']		= row;

					row['title']		= row['fullname'];

					row['className']	= 'provider-6';

				});

				this.loadedEvents = this.loadedEvents.concat(response);

				this.isLoading = false;

				this.fullCalendar.filterEvents(this.organizationUsersSelected, this.loadedEvents,this.isWorkhoursLayout);
			}
		)

		this.appointmentService.getInterval(startDate.format('YYYY-MM-DD'), endDate.format('YYYY-MM-DD')).subscribe(
			response => {
				response.forEach((row, i) => {

					//quick fix
					if (!row['room_id']){
						row['office_id'] = 1;
						row['room_id'] = 1;
					}				

					row['start'] 		= this._formatEventDate(row['date'], row['start_time']);
					row['end'] 			= this._formatEventDate(row['date'], row['end_time']);
					row['resourceId'] 	= row['room_id'];
					row['title']		= this._formatEventTitle(row);
					row['className']  	=  (row['patient_id']) ? ('provider-'+(this.organizationUsersSelected.indexOf(row['provider_id'])+1) + this.getClassStatus(row)) : 'blank';
				});
				this.loadedEvents = this.loadedEvents.concat(response);
				this.fullCalendar.filterOfficeEvents(this.selectedOffice, this.loadedEvents);
				this.isLoading = false;
			}
		);
	}

	private getClassStatus(row){

		let status = ' ';

		if (row['is_completed'])
			status = 'fc-completed';
		if (row['is_confirmed'] && !row['is_completed'])
			status = 'fc-confirmed';
		if (row['is_deleted'] || row['is_noshow'])
			status = 'fc-deleted';

		return ' ' + status;
	}

	private _formatEventTitle(event){
		let debtsBadge = '';
		let notesBadge = '';

		if (event['patient']){
			if (!event['patient']['patient_notes_office'])
				event['patient']['patient_notes_office'] = [];

			if (event['patient']['patient_notes_office'].length > 0)
				notesBadge = '<span class="sl text-warning sl-icon-energy mr5"></span>';
		}
			
		

		if (event['patient'])
			if (event['patient']['total_debts'] > 0)
				debtsBadge = '<span class="sl text-danger sl-icon-wallet mr5"></span>';
		if (event['patient'])
			return debtsBadge + notesBadge + '<span class="fc-event-username">' + event['patient']['patient_user']['fullname'] + '</span><br/><span class="fc-event-descr">' + ((event['note'])?event['note']:'') + '</span>';
		else
			return event['note'];
	}

	private _formatEventDate(date:string, time:string):string{
		let dateArr = date.split('T');
		let timeArr = time.split('T');
		return dateArr[0] + 'T' + timeArr[1];
	}

	private isWeekLoaded(start, end):boolean{
		let loaded = false;
		this.loadedWeeks.forEach((row) => {
			if (row.start == start && row.end == end){
				loaded = true;
			}
		})
		return loaded;
	}
	
	calNext(){
		this.fullCalendar.next();
	}

	calPrev(){
		this.fullCalendar.prev();
	}

	private formatInterval(start, end):string{

		start = moment(start).locale(this._translateService.currentLang);

		end = moment(end).locale(this._translateService.currentLang);

		let daysDiff = 	end.diff(start, 'days');

		end = end.subtract(1, 'days');

		let formattedDate = '';

		if (daysDiff == 1){
			formattedDate = start.format('DD MMMM YYYY');
		}else{
			if (start.month() == end.month()){
				formattedDate = start.format('DD') + ' - ' + end.format('DD') + ' ' + start.format('MMM') + ' ' + start.format('YYYY');
			}else{
				formattedDate = start.format('DD') + ' ' + start.format('MMM') + ' - ' + end.format('DD') + ' ' + end.format('MMM') + ' ' + end.format('YYYY');
			}
		}

		return formattedDate;
	}

	private _formatSlotDuration(number):string{
		return '00:'+number+':00';
	}

	private _defineAgendaView(resources:Array<any>):string{

		let agendaView = 'agendaDay';
		switch(resources.length){
			case 0: agendaView = 'agendaWeek'; break;
			case 1: agendaView = 'agendaWeek'; break;
			case 2: agendaView = 'agendaTwoDay'; break;
			case 3: agendaView = 'agendaTwoDay'; break;
		}
		
		return agendaView;
	}

	private _formatAppointment(appointment){

	}

}