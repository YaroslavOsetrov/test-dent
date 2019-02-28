import {Router, Request, Response, RequestHandler} from 'express';

import * as moment from 'moment';

import * as fs from 'fs';

import * as randomstring from 'randomstring';

import * as countries from './../../public/json/countries.json';

import {Patient} from './../models/user/patient/main';
import {User} from './../models/user/main';

import {PatientRichNote} from './../models/user/patient/note';
import {PatientProcedure} from './../models/user/patient/procedure';
import {PatientInvoice} from './../models/user/patient/invoice/main';

import {Appointment} from './../models/appointment/main';

import {apptFreeCells} from './apptFreeCells';

import {AWSService} from './../services/awsService';

const router = Router({mergeParams:true});

const PdfPrinter = require('pdfmake');

const fonts = {
    Roboto: {
        normal:'./public/fonts/muller/MullerRegular.ttf',
        bold:  './public/fonts/muller/MullerBold.ttf',
        italics:'./public/fonts/muller/MullerRegular.ttf',
    }
};

const printer = new PdfPrinter(fonts);

router.post('/:startDate/:providerId?', (req:Request, res:Response) => {

    let aws = new AWSService('DentalTap');

    console.log(req.params.startDate);
    if (!moment(req.params.startDate, 'YYYY-MM-DD', true).isValid())
        return res.status(400).json({message:'BAD_REQUEST'});
    
    let whereCase = {
        organization_id:req['organization_id'],
        date:req.params.startDate,
        patient_id:{
            $ne:null
        },
        is_deleted:false
    }

    if (req.params.providerId){
        whereCase['provider_id'] = req.params.providerId;
    }

    let options = {
        pageMargins: [ 40, 60, 40, 60 ],
        
        content: [],
        styles: {
            header: {
                fontSize: 14,
                bold:true,
                margin: [0, 40, 0, 20]
            },
            subheader: {
                fontSize: 11,
                bold: true,
                margin: [0, 40, 0, 15]
            },
            bigger: {
                fontSize: 15
            },
            small:{
                fontSize:8
            },
            legend:{
                fontSize:10
            },
            tableInlineTitle:{
                fontSize:9,
                bold:true
            },
            tableInlineTitleSub:{
                bold:true,
                color:'#274abb'
            },
            tableInlineContent:{
                fillColor:'#f7f7f7',
                margin: [0, 10, 0, 0]
            },
            tableInlineContent2:{
                margin: [0, 0, 0, 0]
            },
            tableContent:{
                fontSize:13,
                margin:[0,5,0,5]
            }
        }
    };

    let locale_format = countries['us'].locale_format;

    if (countries[req['country_code']])
        locale_format = countries[req['country_code']].locale_format;

    Appointment.findAll({
        where:whereCase,
        include:[
            PatientRichNote, 
            {
                model:Patient,
                include:[{
                    model:User
                }]
            }, PatientInvoice, PatientProcedure
        ],
        order:[['start_time', 'ASC']],
    }).then(response => {
        console.log(response);
        let appointmentsFormatted = [];
        response.forEach((row) => {

            let invoices = {
                amt:0,
                debts:0,
                discounts:0,
                taxes:0
            };

            let status = 'sched';

            if (row.getDataValue('is_completed')){
                status = 'compl';
            }

            if (row.getDataValue('is_deleted')) {
                status = 'canc';
            }

            if (row.getDataValue('is_confirmed') && !row.getDataValue('is_deleted') && !row.getDataValue('is_completed')){
                status = 'conf';
            }

            let procedures_sum = 0;

            row.getDataValue('appointment_procedures').forEach((row) => {
                procedures_sum += row.getDataValue('price_fee_adj') * row.getDataValue('qty');
            });

            row.getDataValue('patient_invoice').forEach((row) => {
                invoices.amt += row.getDataValue('total_amt') + row.getDataValue('tax') * row.getDataValue('total_amt') / 100 - row.getDataValue('discount') * row.getDataValue('total_amt') / 100;
                invoices.discounts += row.getDataValue('total_amt') * row.getDataValue('discount') / 100;
                invoices.debts += row.getDataValue('total_amt') + row.getDataValue('tax') * row.getDataValue('total_amt') / 100 - row.getDataValue('discount') * row.getDataValue('total_amt') / 100 - row.getDataValue('payed_amt');
                invoices.taxes += row.getDataValue('total_amt') * row.getDataValue('tax') / 100;
            });


            appointmentsFormatted.push({
                date: moment(row.getDataValue('date'), 'YYYY-MM-DD').format(locale_format.date_full2),
                note:row.getDataValue('note') + ' ',
              //  provider:row.getDataValue('provider').getDataValue('fullname'),
                procedures_sum:procedures_sum,
                invoices:invoices,
                start_time:moment.utc(row.getDataValue('start_time')).format(locale_format.time_mom),
                end_time:moment.utc(row.getDataValue('end_time')).format(locale_format.time_mom),
                status:status,
                patient:{
                    fullname:row.getDataValue('patient').getDataValue('patient_user').getDataValue('fullname'),
                    phone:row.getDataValue('patient').getDataValue('patient_user').getDataValue('phone')
                },
                rich_notes:row.getDataValue('rich_notes')
            })
        });
    
        
        options.content.push({
            style: 'header',
            alignment:'left',
            text:'Appointments for ' + req.params.startDate
        });
        let tableBody = [];
        
        tableBody.push([
            {style:'tableInlineContent', border:[true, false, true, false], text: 'Time'},
            {style:'tableInlineContent', border:[false, false, true, false], text: 'Patient'},
            {style:'tableInlineContent', border:[false, false, true, false], text: 'Phone'},
            {style:'tableInlineContent', border:[false, false, true, false], text: 'Note'}
        ]);
        appointmentsFormatted.forEach((row) => {
            tableBody.push([
                {style:'tableInlineContent', text:row['start_time'] + '-' + row['end_time'], bold:true, border:[true, true, true, false]},
                {style:'tableInlineContent', text:row['patient']['fullname'], border:[true, true, true, false]},
                {style:'tableInlineContent', text:row['patient']['phone'], border:[true, true, true, false]},
                {style:'tableInlineContent', text:row['note'], border:[true, true, true, false]}
            ]);
        });
        options.content = options.content.concat({
            table: {
                widths: ['*', '*', '*', '*'],
                margin: [0, 5, 0, 15],
                body: tableBody
            },
            layout:{
                hLineColor:'#444',
                vLineWidth: (i, node) => {
                    return 0;
                }
            }
        });

        var pdfDoc = printer.createPdfKitDocument(options);

        let filename = randomstring.generate(64).toUpperCase() + '.pdf';
        console.log(options.content);
        let filePath = require('app-root-dir').get() + '/tmp/' + filename;
        pdfDoc.pipe(fs.createWriteStream(filePath)).on('finish',() => {
            fs.readFile(filePath, (err, data) => {
                aws.upload(filename, data, 'application/pdf', res);

                fs.unlink(filePath, () => {
                    
                });
            });
        });

        pdfDoc.end();
    });
});
export const apptPrint = router;