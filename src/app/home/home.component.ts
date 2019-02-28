import { Component, OnInit } from '@angular/core';

import {Router} from '@angular/router';

import {ConfigService} from './../common/services/config';

import {BootService} from './../_boot/service';

@Component({
  selector: 'home',
  templateUrl: 'home.html'
})
export class HomeComponent implements OnInit {
  
  constructor(private router:Router, 
              private _bootService:BootService,
              private _configService:ConfigService
            ) {}

	ngOnInit() {

    this._bootService.bootCompleted$.subscribe(
      response => {
        if (response == true){
          this.router.navigate(['/calendar']);
        }
      }
    )

    

	}
}
