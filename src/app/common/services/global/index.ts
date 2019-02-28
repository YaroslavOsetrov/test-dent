import { Injectable } from "@angular/core";
import { Observable, Subject, BehaviorSubject } from 'rxjs';

@Injectable()
export class ModalStateService {

    private _showModal = new BehaviorSubject<boolean>(false);
    showModal$ = this._showModal;

    showModal(){
        this._showModal.next(true);
    }

    hideModal(){
        this._showModal.next(false);
    }
}