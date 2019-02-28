import {Router, Request, Response, RequestHandler} from 'express';

import {Organization} from './../models/organization/main';

import {PatientProcedure} from './../models/user/patient/procedure';

import {PatientPlan} from './../models/user/patient/plan';

import {PatientInvoice} from './../models/user/patient/invoice/main';

import {User} from './../models/user/main';

import {AWSService} from './../services/awsService';

import * as fs from 'fs';

import * as randomstring from 'randomstring';

import * as moment from 'moment';

import * as dateLocale from './../../public/i18n/date.json';

import * as countries from './../../public/json/countries.json'

const i2b = require("imageurl-base64");

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

const printer = new PdfPrinter(fonts);

router.get('/', (req, res) => {

    let aws = new AWSService('DentalTap');

    let patient = req['patient'];

    let patientFormatted = {
        fullname:patient.getDataValue('patient_user').getDataValue('fullname')
    }

    User.findById(req['account_id']).then(
        user => {
            Organization.findById(req['organization_id']).then(
                response => {

                    let language = user.getDataValue('language');

                    let organization = {
                        photo:response.getDataValue('photo'),
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

                    moment.locale(response.getDataValue('language'));

                    PatientPlan.findOne({
                        where:{
                            id:req.params.tpId
                        },
                        include:[PatientProcedure]
                    }).then(
                        patientPlan => {
                            
                            fs.readFile(require('app-root-dir').get() + '/public/i18n/documents/' + language + '/treatmentPlan.json', 'utf8', (err, data) => {
                                
                                let json = JSON.parse(data);

                                let planProcedures = {};

                                let planProceduresSum = 0;

                                let maxApptIndex = 1;

                                console.log(patientPlan);

                                if (patientPlan.getDataValue('plan_procedures').length == 0){
                                    return res.status(400).json({message:'NO_PROCEDURES'});
                                }

                                patientPlan.getDataValue('plan_procedures').forEach((procedure) => {
                                    
                                    let apptIndex = procedure.getDataValue('appointment_index');
                                    if (apptIndex > maxApptIndex){
                                        maxApptIndex = apptIndex;
                                    }
                                    if (!planProcedures[apptIndex])
                                        planProcedures[apptIndex] = [];

                                    console.log(procedure.getDataValue('tooth_indexes'));
                                    planProcedures[apptIndex].push({
                                        chart_code:procedure.getDataValue('chart_code'),

                                        tooth_indexes:(procedure.getDataValue('tooth_indexes')) ? procedure.getDataValue('tooth_indexes'): ' ',
                                        surface_indexes:procedure.getDataValue('surface_indexes'),
                                        price_code:procedure.getDataValue('price_code'),
                                        price_name: procedure.getDataValue('price_name'),
                                        teeth:(procedure.getDataValue('tooth_indexes')) ? '#' + procedure.getDataValue('tooth_indexes'): ' ',
                                        price_fee:procedure.getDataValue('price_fee'),
                                        price_fee_adj:procedure.getDataValue('price_fee_adj'),
                                        qty:procedure.getDataValue('qty'),
                                        invoice_id:procedure.getDataValue('invoice_id'),
                                        status_code:procedure.getDataValue('status_code'),
                                        diagnosis_code:procedure.getDataValue('diagnosis_code')
                                    });

                                    planProceduresSum += procedure.getDataValue('price_fee_adj') * procedure.getDataValue('qty')
                                });

                                let appointmentProceduresList = [];

                                for(let key in planProcedures){

                                    let proceduresSum = 0;
                                    planProcedures[key].forEach((procedure) => {
                                        proceduresSum += procedure.qty * procedure.price_fee_adj;
                                    });
                                

                                    appointmentProceduresList.push([
                                        {style:'tableContent', margin:[0,20,0,10], fontSize:12, text:json['visit'] + ' ' + (Number(key) + 1)}, 
                                        {style:'tableContent', text:' '}, 
                                        {margin:[0,20,0,10], style:'tableContent', bold:true, text:' '}]);

                                    planProcedures[key].forEach((procedure) => {

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
                                    appointmentProceduresList.push([{margin:[0,0,0,10], fontSize:12, text:''}, {text:''}, {margin:[0,0,0,10], fontSize:12, bold:true, text:formatCurrency(proceduresSum, organization.currency_code)}]);
                                }

                            
                            

                            let status = ' ';
                            
                            switch(patientPlan.getDataValue('status')){
                                case 0: status = json['st.pend']; break;
                                case 1: status = json['st.conf']; break;
                                case -1: status = json['st.rej']; break;
                            }
                            
                            let planFormatted = {
                                name:patientPlan.getDataValue('name'),
                                status:status,
                                sum:0
                            };

                            let teethMap = {
                                permanent: {
                                    top: [ '18', '17', '16', '15', '14', '13', '12', '11', '21', '22', '23', '24', '25', '26', '27', '28'],
                                    bottom:[ '48', '47', '46', '45', '44', '43', '42', '41', '31', '32', '33', '34', '35', '36', '37', '38']
                                },
                                primary: {
                                    top: [ '55', '54', '53', '52', '51', '61', '62', '63', '64', '65'],
                                    bottom: [ '85', '84', '83', '82', '81', '71', '72', '73', '74', '75']
                                }
                            };

                            let teethDiagnosis = {};
                            let teethTreatment = [];
                            let teethDiagnosisText = [];
                            let apptNotesText = [];

                            let procedureCodes = {};

                            for(let key in planProcedures){
                                planProcedures[key].forEach((procedure) => {
                                let teeth = procedure.tooth_indexes.split(',');

                                teeth.forEach((tooth) => {
                                        if (!teethDiagnosis.hasOwnProperty(tooth)){
                                            teethDiagnosis[tooth] = [];
                                        }
                                        if (procedure.chart_code){
                                            procedureCodes[json['diag.' + procedure.chart_code]] = true;
                                            
                                            if (json['diag.'+procedure.chart_code])
                                            if (teethDiagnosis[tooth].indexOf(procedure.chart_code) == -1)
                                                teethDiagnosis[tooth].push(procedure.chart_code);
                                        }
                                    })
                                });
                            }

                        /*      teethMap.permanent.top.forEach((i)=> { if (!teethDiagnosis[i]) { teethDiagnosis[i]=[' '] }});
                                teethMap.permanent.bottom.forEach((i)=> { if (!teethDiagnosis[i]) { teethDiagnosis[i]=[' '] }});
                                teethMap.primary.top.forEach((i)=> { if (!teethDiagnosis[i]) { teethDiagnosis[i]=[' '] }});
                                teethMap.primary.bottom.forEach((i)=> { if (!teethDiagnosis[i]) { teethDiagnosis[i]=[' '] }});*/

                                let appointmentsFormatted = [];
                                
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

                                let teethTableRows = {
                                    permanent:{
                                        top:[],
                                        bottom:[]
                                    },
                                    primary:{
                                        top:[],
                                        bottom:[]
                                    }
                                };
                                /*
                                teethMap.permanent.top.forEach((i)=>teethTableRows.permanent.top.push(teethDiagnosis[i].join('\n').toString()));
                                teethMap.permanent.bottom.forEach((i)=>teethTableRows.permanent.bottom.push(teethDiagnosis[i].join('\n').toString()));
                                teethMap.primary.top.forEach((i)=>teethTableRows.primary.top.push(teethDiagnosis[i].join('\n').toString()));
                                teethMap.primary.bottom.forEach((i)=>teethTableRows.primary.bottom.push(teethDiagnosis[i].join('\n').toString()));
                                */
                                let legendText = '';
                                
                                for(let key in procedureCodes){
                                    legendText += json['diag.' + key.toLowerCase() + '.descr'] + ', ';
                                }

                                let orgPhoto = require('app-root-dir').get() + '/public/logo-compact.png';

                                options.content.push({
                                    table: {
                                        widths:['*', 60],
                                        body:[
                                            [
                                                {image:orgPhoto, width:60, rowSpan:4}
                                            ],
                                            [
                                                {bold:true, text:organization.name}
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
                                    text: planFormatted.name.charAt(0).toUpperCase() + planFormatted.name.slice(1)
                                });

                                options.content.push({
                                        table: {
                                            widths: ['*', '*', '*'],
                                            body: [
                                                [
                                                    {style:'tableInlineTitle', text:json['pt']},
                                                    {style:'tableInlineTitle', text:json['date']},
                                                    {style:'tableInlineTitle', text:json['proc']}
                                                ],
                                                [
                                                    {style:'tableInlineContent2', text: patientFormatted.fullname},
                                                    {style:'tableInlineContent2', text: moment().format(locale_format.date_full2)},
                                                    {style:'tableInlineContent2', border:[true, false, true, true], text: formatCurrency(planProceduresSum, organization.currency_code)},
                                                ]
                                            ]
                                        },
                                        layout: 'noBorders'
                                    });
                                    /*
                                options.content.push({
                                    text:json['summary'],
                                    style:'subheader'
                                });

                                for (let key in teethDiagnosis){
                                    let line = '';
                                    if (teethDiagnosis[key]){
                                        console.log(teethDiagnosis[key]);
                                        teethDiagnosis[key].forEach((row, i) => {
                                            if (json['diag.' + row.toLowerCase() + '.descr']){
                                                line += json['diag.' + row.toLowerCase() + '.descr'].split('-')[1];
                                                if (i != teethDiagnosis[key].length - 1)
                                                    line += ', ';
                                            }
                                        
                                        })
                                    }
                                    options.content.push({
                                        table: {
                                            widths: [30, '*'],
                                            body: [
                                                [
                                                    {text:'#'+key},
                                                    {text:line}
                                                ]
                                            ]
                                        },
                                        layout: 'noBorders'
                                    });
                                }
                                */
                                options.content.push({
                                    text:json['proced'],
                                    style:'subheader',
                                    margin: [0, 40, 0, 0]
                                })

                                options.content.push({
                                    table: {
                                        dontBreakRows: true,
                                        widths:['*', 30, 100],
                                        body:appointmentProceduresList
                                    },
                                    pageBreak: 'after',
                                    layout:'lightHorizontalLines'
                                });

                                


                                i2b('https://dentaltap.s3.amazonaws.com/' + organization.photo, (err, data) => {
                                    if (!err){
                                        options.content[0].table.body.splice(0, 1);
                                        options.content[0].table.body.unshift([
                                            {image:data.dataUri, width:60, rowSpan:4}
                                        ])
                                    }

                                    
                                    let filename = randomstring.generate(64).toUpperCase() + '.pdf';

                                    var pdfDoc = printer.createPdfKitDocument(options);

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
                        }
                    );         
                }
            )
        });
});

export const patientPlanPrint = router;