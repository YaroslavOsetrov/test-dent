import { Component, Input } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'validation-message',
    template: '<small class="text-danger pt5" *ngIf="errorMessage !== null">{{"common.errors.form."+errorMessage|translate}}</small>'
})
export class ValidationMessage {
    @Input() control: FormControl;
    constructor(private translateService:TranslateService) { }

    _errorMessage: string;
    get errorMessage() {
        for (let propertyName in this.control.errors) {
            if (this.control.errors.hasOwnProperty(propertyName) && this.control.touched) {
                let word = '';
                this.translateService.get(this.control.errors[propertyName]).subscribe(
                    value => {
                        word = value;
                    }
                );
                return word;
            }
        }

        return null;
    }
}
