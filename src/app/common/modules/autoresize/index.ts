import { Directive, NgModule, HostListener, Renderer, Input, ElementRef } from '@angular/core';
import { 
  NG_VALUE_ACCESSOR, ControlValueAccessor, NgControl 
} from '@angular/forms';

import * as phoneCodes from './../../../../../public/json/phone_codes.json';
 
@Directive({
    selector: '[autoresize]'
})
export class TextareaAutoresizeDirective {

    constructor(private el:ElementRef, private renderer: Renderer){
        

    }
  
    @HostListener('keydown', ['$event'])
    onKeyDown($event:any){

        setTimeout(() => {

            this.renderer.setElementStyle(this.el.nativeElement, 'height', 'auto');
            this.renderer.setElementStyle(this.el.nativeElement, 'overflow', 'hidden');


             this.renderer.setElementStyle(this.el.nativeElement, 'height', this.el.nativeElement.scrollHeight + 'px');
        },0);
    }

}

@NgModule({
    declarations:[
        TextareaAutoresizeDirective
    ],
    exports:[
        TextareaAutoresizeDirective
    ]
})
export class TextareaAutoresizeModule{}