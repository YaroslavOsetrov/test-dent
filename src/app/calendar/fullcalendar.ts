import {Component, Input, Output, EventEmitter, OnInit, AfterViewInit, AfterContentChecked, AfterViewChecked, ElementRef} from '@angular/core';

import 'fullcalendar';
import 'fullcalendar-scheduler';



//import {Options} from 'fullcalendar';

/*
  Generated class for the Calendar component.

  See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
  for more info on Angular 2 Components.
*/
@Component({
  template: '<div></div>',
  selector: 'fullcalendar'
})
export class FullCalendar implements AfterViewInit //implements OnInit,AfterViewInit,AfterContentChecked,AfterViewChecked
{

  @Input() options:any;

  @Output() currentProviders = new EventEmitter<any>();

  	hiddenEvents = [];
	workhoursEvents = [];

  constructor(private element:ElementRef) {
  }
  

  next(){
    ($(this.element.nativeElement) as any).fullCalendar('next');
    this.getShownProviders();
  }

  prev(){
    ($(this.element.nativeElement) as any).fullCalendar('prev');
    this.getShownProviders();
  }


  setDynamicOptions(opts){
    
    ($(this.element.nativeElement) as any).fullCalendar('option', opts);
    ($(this.element.nativeElement) as any).fullCalendar('refetchResources');

    this.options = Object.assign({}, this.options, opts);
    ($(this.element.nativeElement) as any).fullCalendar('destroy');
    ($('fullcalendar') as any).fullCalendar(this.options);


  }

  removeEvent(id){
    ($(this.element.nativeElement) as any).fullCalendar('removeEvents', id);
  }

  setDate(date){
    ($(this.element.nativeElement) as any).fullCalendar('gotoDate', date);
  }

	addEvents(events){
		($(this.element.nativeElement) as any).fullCalendar('addEventSource', events);
	}

	getEvents(){
		return ($(this.element.nativeElement) as any).fullCalendar('clientEvents');
	}

  gotoDate(date){
    ($(this.element.nativeElement) as any).fullCalendar('gotoDate', date);
  }

  private activeEvents(){
    let view = ($(this.element.nativeElement) as any).fullCalendar('getView');
    let start = view.intervalStart;
    let end   = view.intervalEnd;
    return function (e) {
        // this is our event filter
        if (e.start >= start && e.end <= end) {
            // event e is within the view interval
            return true;
        }
        // event e is not within the current displayed interval
        return false;
    };
  }

  getShownProviders(){
    let events = ($(this.element.nativeElement) as any).fullCalendar('clientEvents', this.activeEvents());

    let providers = [];
    events.forEach((row) => {
      if (row['provider_id'])
        if (providers.indexOf(row['provider_id']) == -1)
          providers.push(row['provider_id']);
    })
    this.currentProviders.emit(providers);
  }

	filterOfficeEvents(office, loadedEvents){

		this.fullCalendar('removeEvents');
		let filteredIds:Array<string> = [];
		let filteredEvents = [];

		loadedEvents.forEach((row) => {
			if (filteredIds.indexOf(row['id'].toUpperCase()) == -1 && row['office_id'] != null && row['office_id'].toString().toUpperCase() == office['id'].toUpperCase()){
				filteredIds.push(row['id'].toUpperCase());

				filteredEvents.push(row);
			}
		});
		this.addEvents(filteredEvents);

	}

	hideEvents(){
		let events = this.getEvents();

		this.hiddenEvents = [];
		let keepEvents = [];

		events.forEach((row) => {
			if (row['rendering'] != 'background')
				this.hiddenEvents.push(row);
			else
				this.workhoursEvents.push(row);
		})

		this.fullCalendar('removeEvents');
		this.addEvents(this.workhoursEvents);
	}

	showEvents(){
		this.addEvents(this.hiddenEvents);
		this.hiddenEvents = [];
	}

  filterEvents(selected, loadedAppts, isWorkhoursLayout?){
    /*
    this.fullCalendar('removeEvents');

    let filtered = [];
    let filteredIds:Array<string> = [];

    let providersList = [];

    loadedAppts.forEach((row) => {



     

      if (row['provider_id']){
        if (providersList.indexOf(row['provider_id']) == -1)
          providersList.push(row['provider_id']);
      }

      if (filteredIds.indexOf(row['id'].toUpperCase()) == -1){
        

        if (row['rendering'] == 'background' || row['className'] == 'allday-tasks' || row['className'] == 'allday-invoices'){

          if (row['rendering'] == 'background'){
            if (!row['section_index'] && row['section_index'] != 0){
              row['section_index'] = selected.section_index;
            }
            if (selected.section_index == row['section_index']){
              if (selected.section_sub_index){
                
                if (row['resourceId'] -1 == selected.section_sub_index){
                  row['resourceId'] = 1;
                  filtered.push(row);
                  filteredIds.push(row['id'].toUpperCase());
                }
              }else{
                filtered.push(row);
                filteredIds.push(row['id'].toUpperCase());
              }
            }
          }else{
            filtered.push(row);
            filteredIds.push(row['id'].toUpperCase());
          }
        }else
        if (!isWorkhoursLayout){
          if (filteredIds.indexOf(row['id']) != -1){
            filtered.splice(filteredIds.indexOf(row['id'], 1));
          }

          if (selected.section_index == row['section_index']){

            if (selected.section_sub_index != null){
              if (row['section_sub_index'] == selected.section_sub_index){
                filteredIds.push(row['id'].toUpperCase());
                filtered.push(row);
              }
                
            }
            else{
              filteredIds.push(row['id'].toUpperCase());
              filtered.push(row);
            }
          }
        }
      } 
      
    });
    
    this.addEvents(filtered);
    this.getShownProviders();*/
    
  }

  ngAfterViewInit(){
    setTimeout(()=>{

      ($('fullcalendar') as any).fullCalendar(this.options);
    }, 100)
  }

  initExternalEvents(){

    ($('#external-events .fc-event') as any).each(() => {

      // store data so the calendar knows to render an event upon drop
      ($(this) as any).data('event', {
          title: 'event', // use the element's text as the event title
          stick: true // maintain when user navigates (see docs on the renderEvent method)
      });

      // make the event draggable using jQuery UI
      ($(this) as any).draggable({
          zIndex: 999,
          revert: true,      // will cause the event to go back to its
          revertDuration: 0  //  original position after the drag
      });
    });
  }

  ngAfterContentChecked(){
  }
  ngAfterViewChecked(){
  }

  fullCalendar(...args: any[]) {
    if (!args) {
      return;
    }
    switch (args.length) {

      case 0:
        return;
      case 1:
        return ($(this.element.nativeElement) as any).fullCalendar(args[0]);
      case 2:
        return ($(this.element.nativeElement) as any).fullCalendar(args[0], args[1]);
      case 3:
        return ($(this.element.nativeElement) as any).fullCalendar(args[0], args[1], args[2]);
    }
  }

  updateEvent(event) {
    return ($(this.element.nativeElement) as any).fullCalendar('updateEvent', event);
  }

  clientEvents(idOrFilter) {
    return ($(this.element.nativeElement) as any).fullCalendar('clientEvents', idOrFilter);
  }
}
