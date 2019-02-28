import {Router, Request, Response, RequestHandler} from 'express';

import {Organization} from './../models/organization/main';

import {Appointment} from './../models/appointment/main';

import {AppointmentNote} from './../models/appointment/note';

import {PatientProcedure} from './../models/user/patient/procedure';

import {PatientRichNote} from './../models/user/patient/note';

import {PatientInvoice} from './../models/user/patient/invoice/main';

import {User} from './../models/user/main';

import {AWSService} from './../services/awsService';

import * as fs from 'fs';

import * as randomstring from 'randomstring';

import * as moment from 'moment';

import * as dateLocale from './../../public/i18n/date.json';

import * as countries from './../../public/json/countries.json'

const router = Router({mergeParams:true});

const PdfPrinter = require('pdfmake');

const formatCurrency = (value, code) => {

    value = Number(value).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');

    if (code == 'VND'){
        value = value.toString().split('.')[0];
    }

    return value.toString() + ' ' + code.toUpperCase();
    
}

const fonts = {
    Roboto: {
        normal:'./public/fonts/muller/MullerRegular.ttf',
        bold:  './public/fonts/muller/MullerBold.ttf',
        italics:'./public/fonts/muller/MullerRegular.ttf',
    }
};

const dict = {
    'pasport':'Паспорт',
    'podarochnaya-karta':'Подарочная карта',
    'nomer-karty':'Номер карты'
};

const printer = new PdfPrinter(fonts);

router.get('/', (req, res) => {

    let aws = new AWSService('DentalTap');

    let patient = req['patient'];

    Organization.findById(req['organization_id']).then(
        response => {

            let organization = {
                name:(response.getDataValue('name')) ? response.getDataValue('name') : ' ',
                phone:(response.getDataValue('phone')) ? response.getDataValue('phone') : ' ',
                address:(response.getDataValue('address')) ? response.getDataValue('address') : ' ',
                url:(response.getDataValue('url')) ? response.getDataValue('url') : ' ',
                email:(response.getDataValue('email')) ? response.getDataValue('email') : ' ',
                currency_code:response.getDataValue('currency_code')
            };

            for (let key in dateLocale){
                moment.defineLocale(key, {
                    months  : dateLocale[key]['months_names'],
                    monthsShort : dateLocale[key]['months_names_short'],
                    weekdays : dateLocale[key]['day_names'],
                    weekdaysShort : dateLocale[key]['day_names_short'],
                    weekdaysMin  : dateLocale[key]['day_names_min']
                });
            }

            let locale_format = countries['us'].locale_format;

            if (countries[req['country_code']])
                locale_format = countries[req['country_code']].locale_format;

            moment.locale(req['language']);

            let patientFormatted:any = {
                fullname:patient.getDataValue('patient_user').getDataValue('fullname'),
                birthday:patient.getDataValue('patient_user').getDataValue('birthday') ? moment(patient.getDataValue('patient_user').getDataValue('birthday'), 'YYYY-MM-DD').format(locale_format.date_full2) : '-',
                card_no:patient.getDataValue('card_number') ? patient.getDataValue('card_number') : patient.getDataValue('internal_number'),
                phone:patient.getDataValue('patient_user').getDataValue('phone') ? patient.getDataValue('patient_user').getDataValue('phone') : '-',
                phone_additional:patient.getDataValue('phone_additional') ? patient.getDataValue('phone_additional').getDataValue('phone_additional') : '-',
                address:patient.getDataValue('patient_user').getDataValue('address') ? patient.getDataValue('patient_user').getDataValue('address') : '-',
                document:{
                    number:patient.getDataValue('document_number') ? patient.getDataValue('document_number') : '-',
                    issued:patient.getDataValue('document_issued') ? moment(patient.getDataValue('document_issued'), 'YYYY-MM-DD').format(locale_format.date_full2) : '-',
                    expired:patient.getDataValue('document_expired') ? moment(patient.getDataValue('document_expired'), 'YYYY-MM-DD').format(locale_format.date_full2) : '-',
                    authority:patient.getDataValue('document_authority') ? patient.getDataValue('document_authority') : '-'
                },
                source:patient.getDataValue('reference_from') ? patient.getDataValue('reference_from') : '-',
                email:patient.getDataValue('email') ? patient.getDataValue('email') : '-',
                balance:patient.getDataValue('balance') ? formatCurrency(patient.getDataValue('balance'), organization.currency_code) : formatCurrency(0, organization.currency_code),
            };

            let customFields = JSON.parse(patient.getDataValue('custom_fields'));

            Appointment.findAll({
                where:{
                    patient_id:patient.getDataValue('id')
                },
                order:[['date', 'DESC']],
                include:[PatientRichNote, PatientInvoice, User, PatientProcedure]
            }).then(
                appointments => {

                    fs.readFile(require('app-root-dir').get() + '/public/i18n/documents/' + req['language'] + '/history.json', 'utf8', (err, data) => {

                        let json = JSON.parse(data);

                        let appointmentsFormatted = [];
                        
                        appointments.forEach((row) => {

                            let procedures = [];
                            let procedures_sum = 0;

                            row.getDataValue('appointment_procedures').forEach((row) => {

                                procedures_sum += row.getDataValue('price_fee_adj') * row.getDataValue('qty');

                                procedures.push({
                                    chart_code:row.getDataValue('chart_code'),
                                    surface_indexes:row.getDataValue('surface_indexes'),
                                    price_code:row.getDataValue('price_code'),
                                    price_name: row.getDataValue('price_name'),
                                    teeth:(row.getDataValue('tooth_indexes')) ? '#' + row.getDataValue('tooth_indexes'): ' ',
                                    price_fee:row.getDataValue('price_fee'),
                                    price_fee_adj:row.getDataValue('price_fee_adj'),
                                    qty:row.getDataValue('qty'),
                                    invoice_id:row.getDataValue('invoice_id'),
                                    status_code:row.getDataValue('status_code'),
                                    diagnosis_code:row.getDataValue('diagnosis_code')
                                });
                            });

                            let invoices = {
                                amt:0,
                                debts:0,
                                discounts:0,
                                taxes:0
                            };

                            row.getDataValue('patient_invoice').forEach((row) => {
                                invoices.amt += row.getDataValue('total_amt') + row.getDataValue('tax') * row.getDataValue('total_amt') / 100 - row.getDataValue('discount') * row.getDataValue('total_amt') / 100;
                                invoices.discounts += row.getDataValue('total_amt') * row.getDataValue('discount') / 100;
                                invoices.debts += row.getDataValue('total_amt') + row.getDataValue('tax') * row.getDataValue('total_amt') / 100 - row.getDataValue('discount') * row.getDataValue('total_amt') / 100 - row.getDataValue('payed_amt');
                                invoices.taxes += row.getDataValue('total_amt') * row.getDataValue('tax') / 100;
                            });
                            
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

                            appointmentsFormatted.push({
                                date: moment(row.getDataValue('date'), 'YYYY-MM-DD').format(locale_format.date_full2),
                                note:row.getDataValue('note'),
                                provider:row.getDataValue('provider').getDataValue('fullname'),
                                procedures_sum:procedures_sum,
                                invoices:invoices,
                                status:status,
                                rich_notes:row.getDataValue('rich_notes'),
                               /* exam:{
                                    complaints:(row.getDataValue('appointment_note').getDataValue('complaints')) ? row.getDataValue('appointment_note').getDataValue('complaints') : ' ',
                                    investigations:(row.getDataValue('appointment_note').getDataValue('investigations')) ? row.getDataValue('appointment_note').getDataValue('investigations') : ' ',
                                    observations:(row.getDataValue('appointment_note').getDataValue('observations'))? row.getDataValue('appointment_note').getDataValue('observations') : ' ',
                                    diagnoses:row.getDataValue('appointment_note').getDataValue('diagnoses')? row.getDataValue('appointment_note').getDataValue('diagnoses'): ' ',
                                    treatments:row.getDataValue('appointment_note').getDataValue('treatments') ? row.getDataValue('appointment_note').getDataValue('treatments') : ' ',
                                    recommendations:row.getDataValue('appointment_note').getDataValue('recommendations') ? row.getDataValue('appointment_note').getDataValue('recommendations') : ' '
                                },*/
                                procedures:procedures
                            });

                        });

                        let appointmentsList = [];

                        appointmentsFormatted.forEach((row) => {
                           /* appointmentsList.push({
                                style: 'subheader',
                                text: row.date
                            });*/

                            appointmentsList.push({
                                table: {
                                    dontBreakRows: true,
                                    widths: ['*', 1, '*', 1, '*', 1, '*'],
                                    margin: [0, 5, 0, 15],
                                    body: [
                                        [
                                            {style:'subheader', text:row.date,  border:[false, false, false, false], margin: [-5, 0, 0, 10],},
                                            {text:' ', border:[false, false, false, false]},{text:' ', border:[false, false, false, false]},{text:' ', border:[false, false, false, false]},{text:' ', border:[false, false, false, false]},{text:' ', border:[false, false, false, false]},{text:' ', border:[false, false, false, false]}
                                        ],
                                        [
                                            {style:'tableInlineContent', border:[false, false, false, false], text: row.provider},
                                            {text:' ', border:[false, false, false, false]},
                                            {style:'tableInlineContent', border:[false, false, false, false], text: json['st.'+row.status]},
                                            {text:' ', border:[false, false, false, false]},
                                            {style:'tableInlineContent', border:[false, false, false, false], text: formatCurrency(row.invoices.amt, organization.currency_code)},
                                            {text:' ', border:[false, false, false, false]},
                                            {style:'tableInlineContent', border:[false, false, false, false], text: formatCurrency(row.invoices.debts, organization.currency_code)}
                                        
                                        ],
                                        [
                                            {style:'tableInlineTitle', text:json['provider'], border:[false, true, false, false]},
                                            {text:'', border:[false, true, false, false]},
                                            {style:'tableInlineTitle', text:json['status'], border:[false, true, false, false]},
                                            {text:'', border:[false, true, false, false]},
                                            {style:'tableInlineTitle', text:json['inv'], border:[false, true, false, false]},
                                            {text:'', border:[false, true, false, false]},
                                            {style:'tableInlineTitle', text:json['debt'], border:[false, true, false, false]}
                                        ]
                                    ],
                                    layout:{
                                        hLineColor:'#444',
                                        vLineWidth: (i, node) => {
                                            return 0;
                                        }
                                    }
                                }
                            });

                            appointmentsList.push({text:' ', margin:[0,10,0,0]});

                            let richNotes = [];

                            row.rich_notes.forEach((richNote) => {

                                if (richNote['description']){
                                    richNotes.push([{style:'tableInlineTitle', margin:[-5,0,0,5], text:(richNote['title'] == '%SYSTEM%' || richNote['title'] == 'note') ? '...' : richNote['title']}]);
                                    richNotes.push([{style:'tableInlineContent', margin:[-5,0,0,5], text:richNote['description']}]);
                                }
                                
                            });
                            
                            if (richNotes.length > 0){
                                appointmentsList.push({
                                    table: {
                                        widths: ['*'],
                                        body: richNotes,
                                        dontBreakRows: true,
                                    },
                                    //pageBreak: 'after',
                                    layout:{
                                        hLineWidth: (i, node) => {
                                            return 0;
                                        },
                                        vLineWidth: (i, node) => {
                                            return 0;
                                        }
                                    }
                                });
                                appointmentsList.push({
                                    text:' ',
                                    margin:[0,0,0,15]
                                })
                                
                            }
                            
                            

                            let appointmentProceduresList = [];

                            row.procedures.forEach((procedure) => {

                                if (procedure.price_fee != procedure.price_fee_adj){
                                    appointmentProceduresList.push([
                                        [
                                            {margin:[0,0,0,0], fontSize:9, text:procedure.teeth},
                                            {margin:[0,0,0,0], fontSize:12, text:procedure.price_name}
                                        ],
                                        {style:'tableContent', text:'x'+procedure.qty, bold:true, fontSize:12}, 
                                        [
                                            {margin:[0,0,0,0], fontSize:8, decoration:'lineThrough',text:formatCurrency(procedure.price_fee * procedure.qty, organization.currency_code)}, 
                                            {margin:[0,0,0,0], text:formatCurrency(procedure.price_fee_adj * procedure.qty, organization.currency_code)}
                                        ]
                                    ])
                                }else{
                                    appointmentProceduresList.push( [
                                        [
                                            {margin:[0,0,0,0], fontSize:9, text:procedure.teeth},
                                            {margin:[0,0,0,0], style:'tableContent',  fontSize:12, text:procedure.price_name}
                                        ], 
                                        {style:'tableContent', text:'x'+ procedure.qty, bold:true, fontSize:12}, 
                                        {margin:[0,5,0,0], style:'tableContent', fontSize:12, text:formatCurrency(procedure.price_fee * procedure.qty, organization.currency_code)}
                                    ])
                                }
                            })
                            appointmentProceduresList.push([{margin:[0,0,0,10], fontSize:12, text:''}, {text:''}, {margin:[0,0,0,10], fontSize:12, bold:true, text:formatCurrency(row.procedures_sum, organization.currency_code)}]);
                           
/*  
                            appointmentsList.push({
                                style: 'subheader',
                                text: row.date
                            });
                            

                            if (row.note)
                                appointmentsList.push({
                                    text: row.note,
                                    margin:[0,0,0,20]
                                });*/
                            /*
                            appointmentsList.push({
                                table: {
                                    widths: ['*', 10, '*', 10, '*',10, '*'],
                                    body: [
                                        [
                                            {style:'tableInlineTitle', text:json['inv'].toUpperCase(), border:[true, true, true, false]},
                                            {text:''},
                                            {style:'tableInlineTitle', text:json['debts'].toUpperCase(), border:[true, true, true, false]},
                                            {text:''},
                                            {style:'tableInlineTitle', text:json['disc'].toUpperCase(), border:[true, true, true, false]},
                                            {text:''},
                                            {style:'tableInlineTitle', text:json['tax'].toUpperCase(), border:[true, true, true, false]}
                                        ],
                                        [
                                            {style:'tableInlineContent2', border:[true, false, true, true], text: formatCurrency(row.invoices.amt, organization.currency_code)},
                                            {text:''},
                                            {style:'tableInlineContent2', border:[true, false, true, true], text: formatCurrency(row.invoices.debts, organization.currency_code)},
                                            {text:''},
                                            {style:'tableInlineContent2', border:[true, false, true, true], text: formatCurrency(row.invoices.discounts, organization.currency_code)},
                                            {text:''},
                                            {style:'tableInlineContent2', border:[true, false, true, true], text: formatCurrency(row.invoices.taxes, organization.currency_code)}
                                        ]
                                    ]
                                },
                                layout:{
                                    hLineColor:'white',
                                    vLineColor:'white'
                                }
                            });
                            appointmentsList.push({
                                text: ' ',
                                margin:[0,0,0,20]
                            });*/
                            
                            if (appointmentProceduresList.length > 1){
                                appointmentsList.push({
                                    table: {
                                        dontBreakRows: true,
                                        widths:['*', 30, 100],
                                        body:appointmentProceduresList
                                    },
                                    //pageBreak: 'after',
                                    layout:'lightHorizontalLines'
                                });
                                appointmentsList.push({
                                    text:' ',
                                    margin:[0,0,0,15]
                                })
                            }
                            
                        })

                        let options = {
                            pageMargins: [ 40, 60, 40, 60 ],
                            footer: (page, pages) => {
                                return {
                                    text:patient.getDataValue('patient_user').getDataValue('fullname') + ' ' + page.toString() + '/' + pages.toString(),
                                    style:'small',
                                    alignment:'right', margin:[10,10],
                                }
                            },
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
                                    margin: [0, 0, 0, 15]
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
                                    fontSize:8,
                                     margin: [-5, 5, 0, 10],
                                    bold:true
                                },
                                tableInlineTitleSub:{
                                    bold:true,
                                    color:'#274abb'
                                },
                                tableInlineContent:{
                                    margin: [-5, 10, 0, 0]
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

                        options.content.push({
                            table: {
                                widths:['*', 60],
                                body:[
                                    [
                                        {bold:true, text:organization.name}/*, {image: require('app-root-dir').get() + '/public/logo-compact.png', width:60, rowSpan:4}*/
                                    ],
                                    [
                                        {text:organization.address}
                                    ],
                                    [
                                        {text:organization.phone}
                                    ],
                                    [
                                        {text:organization.url}
                                    ],
                                    [
                                        {text:organization.email}
                                    ]
                                ]
                            },
                            layout: 'noBorders'
                        });

                        options.content.push({
                            style: 'header',
                            alignment:'left',
                            text:patientFormatted.fullname + ' (#' + patientFormatted.card_no + ')'
                        });
                       
                        let customFieldsBody = [
                            
                        ]

                        let count = 1;

                        let temp = [];

                        console.log('---------------------------------------------------------------------------');
                        console.log(customFields);

                        let countAll =Object.keys(customFields).length;
                       
                        let fields = Object.keys(customFields).filter((key) => {
                            return key.toString() !== 'undefined';
                        })
                        console.log(fields);
                        fields.forEach((key, i) => {

                            if (i % 3 == 0){

                                let field2 = ' ';
                                let field3 = ' ';

                                if (fields[i+1]){
                                    field2 = (dict.hasOwnProperty(fields[i+1])) ? dict[fields[i+1]] : fields[i+1];
                                }
                                
                                if (fields[i+2]){
                                    field3 = (dict.hasOwnProperty(fields[i+2])) ? dict[fields[i+2]] : fields[i+2];
                                }

                                temp.push([
                                    {style:'tableInlineTitle', text:(dict.hasOwnProperty(key)) ? dict[key] : key, border:[false, false, false, false]},
                                    {text:'', border:[false, false, false, false]},
                                    {style:'tableInlineTitle', text:field2, border:[false, false, false, false]},
                                    {text:'', border:[false, false, false, false]},
                                    {style:'tableInlineTitle', text:field3, border:[false, false, false, false]}
                                ]);
                                temp.push([
                                    {style:'tableInlineContent', text:customFields[key].length > 0 ? customFields[key] : ' ', border:[false, false, false, false]},
                                    {text:'', border:[false, false, false, false]},
                                    {style:'tableInlineContent', text:' ', border:[false, false, false, false]},
                                    {text:'', border:[false, false, false, false]},
                                    {style:'tableInlineContent', text:' ', border:[false, false, false, false]}
                                ]);

                                
                                
                            }else if (i % 3 == 1){
                                temp[1][2].text = customFields[key];
                            } else {
                                temp[1][4].text = customFields[key];
                            }
                            if (!fields[i+1]){
                                customFieldsBody = temp;
                                temp = [];
                            }

                           
                        });

                        options.content = options.content.concat({
                            table: {
                                widths: ['*', 1, 130],
                                margin: [0, 5, 0, 15],
                                body: [
                                    [
                                        {style:'tableInlineContent', border:[true, false, true, false], text: patientFormatted.fullname},
                                        {text:'', border:[false, false, false, false]},
                                        {style:'tableInlineContent', border:[false, false, true, false], text: patientFormatted.birthday}
                                    ],
                                    [
                                        {style:'tableInlineTitle', text:json['fullname'], border:[true, true, true, false]},
                                        {text:'', border:[false, true, false, false]},
                                        {style:'tableInlineTitle', text:json['dob'], border:[false, true, true, false]},
                                    ]
                                ]
                            },
                            layout:{
                                hLineColor:'#444',
                                vLineWidth: (i, node) => {
                                    return 0;
                                }
                            }
                        }, {
                            table: {
                                widths: ['*', 1, '*'],
                                margin: [0, 5, 0, 15],
                                body: [
                                    [
                                        {style:'tableInlineContent', border:[true, false, false, false], text: patientFormatted.phone},
                                        {text:'', border:[true, false, false, false]},
                                        {style:'tableInlineContent', border:[false, false, true, false], text: patientFormatted.phone_additional}
                                    ],
                                    [
                                        {style:'tableInlineTitle', text:json['phone'], border:[true, true, false, false]},
                                        {text:'', border:[true, true, false, false]},
                                        {style:'tableInlineTitle', text:json['phone'] + ' 2', border:[false, true, true, false]},
                                    ]
                                ]
                            },
                            layout:{
                                hLineColor:'#444',
                                vLineWidth: (i, node) => {
                                    return 0;
                                }
                            }
                        }, 
                         {
                            table: {
                                widths: ['*'],
                                body: [
                                    [
                                        {style:'tableInlineContent', border:[true, false, true, false], text: patientFormatted.address},
                                    ],
                                    [
                                        {style:'tableInlineTitle', text:json['address'], border:[true, true, true, false]},
                                    ]
                                ]
                            },
                            layout:{
                                hLineColor:'#444',
                                vLineWidth: (i, node) => {
                                    return 0;
                                }
                            }
                        }, {
                            table: {
                                widths: ['*', 1, '*', 1, '*'],
                                body: [
                                    [
                                        {style:'tableInlineContent', border:[true, false, true, true], text: patientFormatted.source},
                                        {text:'', border:[true, false, false, true]},
                                        {style:'tableInlineContent', border:[false, false, false, true], text: patientFormatted.balance},
                                        {text:'', border:[true, false, false, true]},
                                        {style:'tableInlineContent', border:[false, false, true, true], text: patientFormatted.email}
                                    ],
                                    [
                                        {style:'tableInlineTitle', text:json['source'], border:[true, true, true, false]},
                                        {text:'', border:[true, true, false, false]},
                                        {style:'tableInlineTitle', text:json['bal'], border:[false, true, true, false]},
                                        {text:'', border:[true, true, false, false]},
                                        {style:'tableInlineTitle', text:json['email'], border:[false, true, true, false]},
                                    ]
                                ],
                            },
                            pageBreak: 'after',
                            layout:{
                                hLineColor:'#444',
                                vLineWidth: (i, node) => {
                                    return 0;
                                }
                            }
                        },
                       /* {
                            table:{
                                 widths: ['*', 1, '*', 1, '*'],
                                 body:customFieldsBody
                            },
                            layout:{
                                hLineColor:'#ccc',
                                vLineColor:'#ccc'
                            }
                        },*/);

                        options.content = options.content.concat(appointmentsList);

                        var pdfDoc = printer.createPdfKitDocument(options);

                        let filename = randomstring.generate(64).toUpperCase() + '.pdf';

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

                }
            )            
        }
    )
});

export const patientPrint = router;