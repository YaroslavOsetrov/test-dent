
import {Sequelize}      from 'sequelize-typescript';

import {ConfigService} from './../services/configService';

import {database} from './../config';

import {AppCountry} from './app_country';

import {Appointment}        from './appointment/main';
import {AppointmentExam}    from './appointment/exam';
import {AppointmentNote}    from './appointment/note';
import {AppointmentNotification}    from './appointment/notification';

import {Role}           from './user/role';
import {User}           from './user/main';
import {UserRole}       from './user/user_role';

import {UserRecovery} from './user/recovery';

import {Patient}                    from './user/patient/main';

import {PatientAccess}              from './user/patient/access';
import {PatientTask}              from './user/patient/task';
import {PatientProcedure}           from './user/patient/procedure';
import {PatientPlan}           from './user/patient/plan';
import {PatientFile}           from './user/patient/file';
import {PatientInvoice}             from './user/patient/invoice/main';
import {PatientInvoiceProcedure}    from './user/patient/invoice/procedure';
import {PatientInvoicePayment}      from './user/patient/invoice/payment';

import {PatientLog} from './user/patient/log';

import {PatientNote, PatientRichNote} from './user/patient/note';

import {Organization}                       from './organization/main';
import {OrganizationNotification}                       from './organization/notification';
import {OrganizationRichNoteTemplate}                       from './organization/rich_note_template';
import {OrganizationSubscription}           from './organization/subscription';
import {OrganizationSubscriptionPayment}    from './organization/subscription_payment';
import {OrganizationLimit}                  from './organization/limit';
import {OrganizationPrice}                  from './organization/price';
import {OrganizationScheduler}              from './organization/scheduler';
import {OrganizationTask}                   from './organization/task';
import {OrganizationDocument}                   from './organization/document';
import {OrganizationProcedure}                   from './organization/procedure';
import {OrganizationProcedureInventory}                   from './organization/procedure_inventory';
import {OrganizationEmailCampaign}                   from './organization/email_campaign';

import {OrganizationOffice, OrganizationOfficeRoom} from './organization/office';
import {OrganizationInventory} from './organization/inventory';
import {OrganizationInventoryOffice} from './organization/inventory_office';
import {OrganizationInventoryTransaction} from './organization/inventory_transaction';

import {OrganizationCall} from './organization/call';

import {PatientProcedureInventory} from './user/patient/procedure_inventory';

import {OrganizationCustomField}                   from './organization/custom_field';

import {UserInvitation} from './user/invitation';
import {UserWorkhour} from './user/workhour';

import {UserProcedure} from './user/procedure';

import {WidgetAppointmentRequest, WidgetAppointmentSettings} from './widget/appointment';

import {OrganizationLog, OrganizationLogView} from './organization/log';

const rootDir = require('app-root-dir');

const env = process.env.APP_ENV || 'development';

class Database{

    sequelize:Sequelize;

    constructor(environment:string){

        if (!environment)
            environment = env;
        
        this.sequelize = new Sequelize(database[env]);
    }
    auth(){

        return this.sequelize.authenticate();
    }
    
    init(){
        this.sequelize.addModels([

            AppCountry,

            Appointment,
            AppointmentExam,
            AppointmentNote,
            AppointmentNotification,

            Role,
            User,
            UserRole,
            UserInvitation,
            UserRecovery,
            UserWorkhour,
            UserProcedure,

            Patient,
            PatientAccess,
            PatientTask,
            PatientProcedure,
            PatientProcedureInventory,
            PatientPlan,
            PatientFile,
            PatientInvoice,
            PatientInvoiceProcedure,
            PatientInvoicePayment,
            PatientNote,

            PatientLog,

            PatientRichNote,            

            Organization,
            OrganizationRichNoteTemplate,
            OrganizationCall,
            OrganizationDocument,
            OrganizationNotification,
            OrganizationSubscription,
            OrganizationEmailCampaign,
            OrganizationSubscriptionPayment,
            OrganizationLimit,
            OrganizationPrice,
            OrganizationProcedure,
            OrganizationProcedureInventory,
            OrganizationScheduler,
            OrganizationTask,
            OrganizationLog,
            OrganizationLogView,
            OrganizationCustomField,

            OrganizationOffice,
            OrganizationOfficeRoom,
            OrganizationInventory,
            OrganizationInventoryOffice,
            OrganizationInventoryTransaction,

            WidgetAppointmentRequest,
            WidgetAppointmentSettings
        ]);
    }

}


const sequelizeDb =  new Database(env);


sequelizeDb.auth().then((response) => {
    console.log('Connected to db ' + env);
}).catch((e) => {
    console.log('Unable to connect to db!');
    console.log(e);
});

sequelizeDb.init();


export const db = sequelizeDb.sequelize;