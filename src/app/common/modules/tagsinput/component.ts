import { Component, OnInit, forwardRef, Output, Input, EventEmitter } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { TypeaheadMatch } from 'ngx-bootstrap'

const noop = () => {};

const TAGS_INPUT_STYLE = `
    :host {
        overflow: auto;
        white-space: nowrap;
    }

    .tags-input {
        align-items: center;
        display: flex;
        flex-wrap: wrap;
    }

    .tags-input__tag {
        display: inline-block;
        margin-bottom: 5px;
        margin-right: 5px;
        padding-right: 0.3em;
        border: 0;
        background: #eeeeee;
        border-radius: 4px;
        padding: 7px 10px;
        font-size: 1em;
    }

    .tags-input__tag-remove-btn {
        cursor: pointer;
        display: inline-block;
        font-size: 16px;
        margin: 0px 0 0 3px;
        padding: 0;
        vertical-align: top;
    }

    .tags-input__input-field {
        border: none;
        min-height:58px;
        padding: 10px 18px;
        flex-grow: 1;
        outline: none;
    }
`;

const CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => TagsInputComponent),
    multi: true
};

@Component({
  selector: 'tags-input',
  templateUrl: 'component.html',
  styles: [TAGS_INPUT_STYLE],
  providers: [CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR]
})
export class TagsInputComponent implements OnInit, ControlValueAccessor {
    private selected:string = '';
    public tags: any[] = [];
    private onTouchedCallback: () => void = noop;
    private onChangeCallback: (_: any) => void = noop;

    @Input() maxTags: number;
    @Input() removeLastOnBackspace: boolean = false;
    @Input() canDeleteTags: boolean = true;
    @Input() placeholder: string = '';
    @Input() options: any = null;
    @Input() maxLength = 30;
    @Input() displayField: string = 'displayValue';
    @Output() onTagsChanged = new EventEmitter();
    @Output() onMaxTagsReached = new EventEmitter();
    @Output() onNoOptionsMatch = new EventEmitter();

    ngOnInit() {}

    private getPlaceHolder(): string {
        if(this.tags && this.tags.length > 0){
            return '';
        }
        return this.placeholder;
    }

    private tagsChanged(type: string, tag: any): void {
        this.onChangeCallback(this.tags);
        this.onTagsChanged.emit({
            change: type,
            tag: tag
        });
        if(this.maximumOfTagsReached()){
            this.onMaxTagsReached.emit();
        }
    }

    private removeLastTag(tagInput: HTMLInputElement): void {
        if(!this.removeLastOnBackspace || !this.tags.length) {
            return;
        }

        if (tagInput.value === ''){
            this.removeTag(this.tags[this.tags.length-1]);
        }
    }

    private addTag(tagInput: HTMLInputElement): void {
        if (tagInput.value.trim() !== ''){
            let tag = {
                [this.displayField]: tagInput.value
            };
            this.addPredefinedTag(tag);
        }
        tagInput.value = '';
    }

    private addPredefinedTag(tag: Object): void {
        if (!this.maximumOfTagsReached()){
            this.tags.push(tag);
            this.tagsChanged('add', tag);
        }
    }

    private removeTag(tagToRemove: any): void {
        if(!this.isDeleteable(tagToRemove)){
            return;
        }
        this.tags = this.tags.filter(tag => tagToRemove !== tag);
        this.tagsChanged('remove', tagToRemove);
    }

    private maximumOfTagsReached(): boolean {
        return typeof this.maxTags !== 'undefined' && this.tags.length>=this.maxTags;
    }

    private isDeleteable(tag: any) {
        if(typeof tag.deleteable !== "undefined" && !tag.deleteable){
            return false;
        }
        return this.canDeleteTags;
    }

    private typeaheadOnSelect(e:TypeaheadMatch):void {
        if(typeof e.item === 'string'){
            this.addPredefinedTag({
                [this.displayField]: e.value
            });
        }else {
            this.addPredefinedTag(e.item);
        }
        this.selected = '';
    }

    private typeaheadOnNoMatch(e:any):void {
        if(typeof this.onNoOptionsMatch !== 'undefined'){
            this.onNoOptionsMatch.emit(e)
        }
    }

    writeValue(value: any) {
        if (value !== this.tags) {
            this.tags = value;
        }
    }

    validateLength(event){

        if (event.target.value)
            if (event.target.value.length >= this.maxLength)
                return false;
    }

    registerOnChange(fn: any) {
        this.onChangeCallback = fn;
    }

    registerOnTouched(fn: any) {
        this.onTouchedCallback = fn;
    }
}
