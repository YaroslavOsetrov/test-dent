import { Component, ViewChild, Renderer2, Pipe, PipeTransform, Input, NgModule, EventEmitter, Output, OnInit } from '@angular/core';

import {TranslateModule} from '@ngx-translate/core';

import {FormsModule} from '@angular/forms';

import {ConfigService} from './../../services/config';

import {CommonModule} from '@angular/common';

import {CommonPipesModule} from './../../pipes/index';

@Pipe({
    name: 'userSearch'
})
export class UserSearchPipe implements PipeTransform {
    transform(value: any, args: string): any {
        let filter = args.toLocaleLowerCase();

        if (!filter)
            return value;

        return filter ? (value.filter(row=> row.fullname.toLocaleLowerCase().indexOf(filter) != -1)) : value;
    }
}

@Pipe({ name: 'userSort' })
export class UserSortPipe implements PipeTransform {
  transform(users) {

    return users.sort((a,b) => {
        return a.fullname.localeCompare(b.fullname);
    })
  }
}

@Component({
  selector: 'users-list',
  templateUrl: 'users.html'
})
export class UserDropdown implements OnInit {

    @ViewChild('scrollElement') scrollElement;

    @Input('onlyProviders') onlyProviders:boolean = false;

    @Input('allButton') allButton:boolean = false;

    @Output('userSelected') userSelected:EventEmitter<any> = new EventEmitter<any>();

    users:any;

    totalRows = 0;

    search = '';

	constructor(private rendered:Renderer2, private _configService:ConfigService) {

        this.users = this._configService.users;
    }

	ngOnInit() {

        this.users.forEach((row) => {

            if (this.onlyProviders){
                if (row.user_roles[0].is_doctor){
                    this.totalRows += 1;
                }
            }else{
                this.totalRows += 1;
            }

        })
					
		
	}

    ngAfterViewInit(){

		this.rendered.listen(this.scrollElement.nativeElement, 'mousewheel', (e) => {

			let event = e,
				d = event.wheelDelta || -event.detail;

			this.scrollElement.nativeElement.scrollTop += ( d < 0 ? 1 : -1 ) * 30;
			e.preventDefault();
		})
     }


    switchProvider(index){
        this.userSelected.emit(this.users[index]);
	}
}

@NgModule({
    declarations:[UserDropdown, UserSearchPipe, UserSortPipe],
    exports:[UserDropdown],
    imports:[TranslateModule, FormsModule, CommonModule, CommonPipesModule],
    providers:[ConfigService]
})
export class UsersListModule{}
