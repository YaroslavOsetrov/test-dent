import {Directive, NgModule, ElementRef, EventEmitter, Output} from '@angular/core';
import {NgModel} from '@angular/forms';

import { 
  NG_VALUE_ACCESSOR, ControlValueAccessor, NgControl 
} from '@angular/forms';

declare var google:any;

@Directive({
  selector: '[googleplace]'
})
export class GoogleplaceDirective  {
  @Output() setAddress: EventEmitter<any> = new EventEmitter();
  modelValue:any;
  autocomplete:any;
  private _el:HTMLElement;


  constructor(el: ElementRef,public formControl: NgControl) {
    this._el = el.nativeElement;
    

    try{
      var input = this._el;
      this.autocomplete = new google.maps.places.Autocomplete(input, {});
      google.maps.event.addListener(this.autocomplete, 'place_changed', ()=> {
        var place = this.autocomplete.getPlace();
        this.formControl.control.setValue(place.formatted_address);
        this.invokeEvent(place);
      });
    }catch(e){
      console.log('no internet connection');
    }
    
  }

  invokeEvent(place:Object) {
    this.setAddress.emit(place);
  }
}
@NgModule({
    declarations:[
        GoogleplaceDirective
    ],
    exports: [
        GoogleplaceDirective
    ]
})
export class GooglePlaceModule{}
