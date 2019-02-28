
import {PatientLog} from './../models/user/patient/log';

export class LogService{

    logData = {};

    constructor(logObj){
        this.logData = logObj;
    }

    add(){

        console.log(this.logData);
        return PatientLog.create<PatientLog>(this.logData);

    }

    destroy(){
        PatientLog.findAll<PatientLog>({
            where:{
            //    organization_id:this.logData['organization_id'],
                resource_id:this.logData['resource_id'],
                type:this.logData['type'],
                patient_id:this.logData['patient_id']
            }
        }).then(response => {

            if (response){
                response.forEach((row) => {
                    row.destroy();
                })
            }
        });
    }

}