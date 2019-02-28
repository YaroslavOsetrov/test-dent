import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'office',
    templateUrl: 'component.html'
})
export class OfficeComponent {
    
    count = {
        dueTasks:0
    };

    constructor(){

    }

    onDueTasks(data){
        this.count.dueTasks = data.length;
    }

    trackTab(tabName){

        mixpanel.track("patientOpenTab", {tab:tabName});

    }


}