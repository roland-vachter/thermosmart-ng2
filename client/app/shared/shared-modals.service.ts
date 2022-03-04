import { Injectable } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { ALERT_TYPE } from '../types/types';
import { AlertWrapperComponent } from './components/alert.component';

@Injectable()
export class SharedModalsService {
    constructor(
        private modalService: BsModalService
    ) {

    }

	alert(content: string, type: ALERT_TYPE) {
		const modalRef = this.modalService.show(AlertWrapperComponent, {
            initialState: {
                type,
                content
            },
            backdrop: false
		});

        setTimeout(() => {
            modalRef.hide();
        }, 10000);
	}
}
