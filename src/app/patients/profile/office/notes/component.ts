import {Component, OnInit} from '@angular/core';

import {FormGroup, FormBuilder} from '@angular/forms';

import {ValidationService} from '@common/modules/validation';

import {ConfigService} from '@common/services/config';

import {PatientService} from '@patients/patients.service';

import * as moment from 'moment';

@Component({
    selector: 'notes',
    templateUrl: 'component.html'
})
export class NotesComponent implements OnInit {

    notes = [];

    newNote = '';

    usersObj = {};

    patient:any;

    isLoaded = false;

    isSaving = false;

    constructor(private _configService:ConfigService, private _patientService:PatientService){


        this.usersObj = this._configService.usersObj;
    }

    ngOnInit(){

        let patientId = this._patientService.patientId$.getValue();
        this._patientService.getNotes(patientId).subscribe(
            response => {
                let notes = [];
                let notesUrgent = [];

                response.forEach((row) => {
                    if (row['is_urgent'])
                        notesUrgent.push(row);
                    else
                        notes.push(row);
                });

                this.notes = notesUrgent.concat(notes);
                this.isLoaded = true;
                
            }
        )
        this._patientService.patient$.subscribe(
            response => {
                this.patient = response;
            }
        )

    }

    deleteNote(noteIndex){

        this._patientService.deleteNote(this.patient.id, this.notes[noteIndex].id).subscribe();

        this.notes.splice(noteIndex, 1);

    }

    pinNote(noteIndex){

        let note = this.notes[noteIndex];
        note.is_urgent = !note.is_urgent;

        
        this.notes.splice(noteIndex, 1);
        if (note.is_urgent){
            this.notes.unshift(note);
        }else{
            this.notes.push(note);
            let notes = [];
            let notesUrgent = [];
            this.notes.forEach((row) => {
                if (row['is_urgent'])
                    notesUrgent.push(row);
                else
                    notes.push(row);
            })

            notes = notes.sort((a:any, b:any) => {
                return (new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            });



            this.notes = notesUrgent.concat(notes);

        }
        

        this._patientService.saveNote(this.patient.id, note.id, note).subscribe();

    }

    addNote(){

        if (!this.newNote)
            return;

        this.isSaving = true;

        this._patientService.addNote(this.patient.id, {
            note:this.newNote
        }).subscribe(
            response => {
                this.isSaving = false;
                this.newNote = '';
                this.notes.unshift(response);
            }
        )


    }

}