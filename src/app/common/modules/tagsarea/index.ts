import { Component, Input, NgModule, ElementRef, ViewChild, EventEmitter, Output, OnInit, OnChanges, SimpleChanges, SimpleChange } from '@angular/core';

import {ConfigService} from './../../services/config';

import { environment } from './../../../../environments/environment';

import * as Languages from './../../../../../public/i18n/languages/index.json';

import {TranslateService} from '@ngx-translate/core';

import {CommonModule} from '@angular/common';

@Component({
  selector: 'tagsarea',
  templateUrl: 'index.html'
})
export class TagsArea implements OnInit, OnChanges {

	@Input('template') template:string;

    @Input('tags') tags:any;

    @ViewChild('element') element:ElementRef;

    @Output('onTemplateChanged') onTemplateChanged:EventEmitter<any> = new EventEmitter<any>();

    content:string = '';

    globalIndex = 0;

    constructor(){

    }

    ngOnInit(){

    }

    preventTagDelete(event){

    }

    detectCursor(event){


        let cursor = this.getCaretPosition();

        let content = event.target.innerHTML;

        content = content.replace('&nbsp;', ' ');

        let rest = content.substring(cursor);

        let isBegin = false;

        let labelStart = rest.indexOf('<label');

        let isNbsp = false;

        if (event.code == 'Delete' || event.code == 'ArrowRight')
        if (labelStart == -1){
            isNbsp = true;
            labelStart = rest.indexOf('<label');
        }

        let label = rest.substring(labelStart, rest.indexOf('</label>'));

        let tagName = '';

        if (typeof document !== 'undefined'){
            var el = document.createElement( 'html' );
            el.innerHTML = label;
            let lablo = el.getElementsByTagName('label')[0];
            if (lablo)
                tagName = lablo.getAttribute('id').split('-')[1];
        }

        isBegin = labelStart !== -1;

        if (event.code == 'ArrowLeft' || event.code == 'Backspace'){
            rest = content.substring(0, cursor);

            labelStart = -1;
            if(rest.substr(rest.length - 9).indexOf('</label>') !== -1){
                labelStart = 0;
            }
        }

        if  ((event.code == 'Backspace' && labelStart == 0) || (event.code == 'Delete' && labelStart == 0 && isBegin)){
            return false;
        }
        if ((labelStart == 0 && event.code == 'ArrowRight') || (labelStart == 0 && event.code == 'ArrowLeft')){

           

            this.moveOverTag(tagName, event.code);
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        
        if (this.tags == null){
            this.tags = {};
        }

        if (this.template == null)
            this.template = '';
        
        this.formatTags(this.template, this.tags);


    }

    private moveOverTag(tag, direction){
        let node = this.element.nativeElement;
        node.focus();
        let elementNode = node.childNodes[0];

        let nodeIndex = 0;

        if (elementNode.nodeType != Node.TEXT_NODE)
            if (elementNode.getAttribute('id') == 'tag-' + tag){
                nodeIndex = 0;
            }

        while (elementNode){
            nodeIndex = nodeIndex + 1;
            elementNode = node.childNodes[nodeIndex];

            if (elementNode['nodeType'] == Node.TEXT_NODE)
                continue;
            else if (elementNode.getAttribute('id') == 'tag-'+tag){
                break;
            }

            
        }

        if (direction == 'ArrowRight')
            nodeIndex = nodeIndex + 1;
        else 
            nodeIndex = nodeIndex - 1;

        elementNode = node.childNodes[nodeIndex];

       
        
        if (typeof document !== 'undefined' && typeof window !== 'undefined'){

            if (typeof elementNode === 'undefined'){

                let el = document.createTextNode(' ');
                node.appendChild(el);
            }

            elementNode = node.childNodes[nodeIndex];
            
            if (typeof document.createRange == 'function'){
                let range = document.createRange();

                let position = 0;
                if (direction == 'ArrowLeft'){
                    
                    if (elementNode['outerHTML']){
                        position = elementNode['outerHTML'].length-1;
                    }  
                    else if (elementNode.nodeType == 3) {
                        position = elementNode.textContent.length;
                    }
                    
                }

                range.setStart(elementNode, position);
                range.setEnd(elementNode, position);
                let sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(range);
            }
            
        }
        
    }

    private getCaretPosition() {

        if (typeof window !== 'undefined') {
            if (window.getSelection && window.getSelection().getRangeAt) {
                var range = window.getSelection().getRangeAt(0);
                var selectedObj = window.getSelection();
                var rangeCount = 0;
                var childNodes = selectedObj.anchorNode.parentNode.childNodes;
                
                for (var i = 0; i < childNodes.length; i++) {
                    if (childNodes[i] == selectedObj.anchorNode) {
                        break;
                    }
                    
                    if (childNodes[i]['outerHTML']){
                        let html = childNodes[i]['outerHTML'];
                        rangeCount += html.length;
                    }  
                    else if (childNodes[i].nodeType == 3) {
                        rangeCount += childNodes[i].textContent.length;
                    }
                }
                return range.startOffset + rangeCount;
            }
            return -1;
        }
    }

    editTemplate(event){

        let childNodes = event.target.childNodes;

        let template = '';

        if (typeof document !== 'undefined') {
            for (var i = 0; i < childNodes.length; i++) {
                if (childNodes[i]['outerHTML']){
                    let el = document.createElement('div');
                    el.innerHTML = childNodes[i]['outerHTML'];
                    
                    template += '*|' + el.getElementsByTagName('label')[0].getAttribute('id').split('-')[1] + '|*';
                }  
                else if (childNodes[i].nodeType == 3) {
                    template += childNodes[i].textContent;
                }
            }
        }

        this.template = template;

        this.onTemplateChanged.emit(template);
    }

    private formatTags(template, tags){

        let output = template;

        for(let key in tags){
            output = output.replace('*|' + key + '|*', '<label onclick="window.getSelection().removeAllRanges()" id="tag-'+key + '" contenteditable="false" class="label label-primary">' + tags[key] + '</label>');
        }

        let firstSpace = '';
        let lastSpace = '';

        if (output[0] == '<'){
            firstSpace = ' ';
        }
        if (output[output.length-1] == '>'){
            lastSpace = ' ';
        }

        this.element.nativeElement.innerHTML = firstSpace + output + lastSpace;
        

    }
}



@NgModule({
    declarations:[TagsArea],
    exports:[TagsArea],
    imports:[CommonModule],
    providers:[]
})
export class TagsAreaModule{}
