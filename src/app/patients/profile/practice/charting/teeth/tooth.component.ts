import {Component, OnInit, Input} from '@angular/core';
import {Location} from '@angular/common';

import * as uniNotationsObj from './uniNotation.json';

@Component({
    selector: 'tooth',
    templateUrl:'tooth.html'
})
export class Tooth  {

    @Input() toothId: number;
    
    @Input() uniNotation:boolean;

    @Input() implant: string;

    @Input() crown: string;
    @Input() crownStatus: string;
    @Input() crown34: any;

    @Input() extraction:string;
    @Input() veneer:string;
    @Input() sealant:string;

    @Input() pontic:string;
    @Input() retainer:string;
    @Input() end:string;

    @Input() diagnosis:string;

    @Input() missing:string;

    @Input() rootcanal:string;
    @Input() postcore:string;

    @Input() resto:string;

    @Input() surface:any;

    toothClass:string;
    toothType:string;
    toothOverlayClass:string;

    fillColorBase='#fafafa';

    isTop:boolean;

    crownDetails:Object;
    colors:Object;
    fills:Object;

    public toothClassPreffix:string = '';

    public url:string;

    diagnoses:any = {};
    constructor(private location:Location){


        this.colors = {
            'tp':'#fa424a',
            'e':'#5dca73',
            'c':'#5dca73'
        };

    }
    ngOnInit(){
        this.diagnoses = [];

        if (this.surface){
            try{
                this.surface = JSON.parse(this.surface);
            }catch(e){
                if (e){
                    this.surface = [];
                }
            }
            
        }else{
            this.surface = [];
        }

        this.url = this.location.path();

        let firstDigit = this.toothId.toString()[0];
        let lastDigit = this.toothId%10;

        this.isTop = (firstDigit == '1' || firstDigit == '2' || firstDigit == '5' || firstDigit == '6');

        if (firstDigit == '5' || firstDigit == '6' || firstDigit == '7' || firstDigit == '8'){
            switch(lastDigit){
                case 5: lastDigit = 7; break;
                case 4: lastDigit = 6; break;
            }
        }


        this.toothClassPreffix = ((this.isTop) ? 't' : 'b') + lastDigit;
        this.toothClass = 'tooth tooth-' + ((this.isTop) ? 't' : 'b') + '-' + lastDigit;

        this.toothOverlayClass = 'tooth-overlay tooth-' + ((this.isTop) ? 't' : 'b') + '-' + lastDigit;

        let toothType = 'tooth-center';
        if (lastDigit == 4 || lastDigit == 5) toothType = 'tooth-premolar';
        if (lastDigit > 5) toothType = 'tooth-molar';

        this.toothType = toothType;

        this.toothClass += ' ' + toothType;

    }

    formatTooth(toothId){

        if (this.uniNotation){
            return uniNotationsObj[toothId];
        }else
            return toothId;
        
    }
}
