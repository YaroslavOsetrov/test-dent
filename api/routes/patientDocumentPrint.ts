import {Router, Request, Response, RequestHandler} from 'express';

import {Organization} from './../models/organization/main';

import * as fs from 'fs';

import * as randomstring from 'randomstring';

import {AWSService} from './../services/awsService';

import * as moment from 'moment';

import {PatientFile} from './../models/user/patient/file';

import * as dateLocale from './../../public/i18n/date.json';

import * as countries from './../../public/json/countries.json'

import {OrganizationDocument} from './../models/organization/document';

import {User} from './../models/user/main';

import {LogService} from './../services/logService';

const pdf = require('html-pdf');

const PdfPrinter = require('pdfmake');

const html2pdfmake = require('./../services/html2pdfmake.js');

const router = Router({mergeParams:true});

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

const colors = {
    tp:'#fa424a',
    c:'#fa424a',
    e:'#fa424a'
}

const teeth =[[[18,17,16,15,14,13,12,11],[21,22,23,24,25,26,27,28]],[[48,47,46,45,44,43,42,41],[31,32,33,34,35,36,37,38]]];

router.put('/test', (req, res) => {

    fs.readFile(require('app-root-dir').get() + '/public/i18n/documents/treatment_plan.html', (err, html) => {

        let content = html.toString();

        fs.readFile(require('app-root-dir').get() + '/public/i18n/documents/partials/tooth.html', (err, html) => {

            let toothTemplate = html.toString();

            let currentChart = {};

            if (req['patient'].getDataValue('dental_chart'))
                currentChart = JSON.parse(req['patient'].getDataValue('dental_chart'));

            console.log(currentChart);

            teeth.forEach((topBottom, i) => {
                topBottom.forEach((leftRight, j) => {
                    leftRight.forEach(toothId => {

                        let toothType = 'center';

                        if (['8','7','6'].indexOf(toothId.toString().charAt(1)) !== -1){
                            toothType='molar';
                        }

                        if (['5', '4'].indexOf(toothId.toString().charAt(1)) !== -1){
                            toothType='premolar';
                        }

                        let toothRendered = toothTemplate
                            .replace(/<toothIndex>/g, toothId.toString())
                            .replace(/<topBottom>/g, ((i == 0) ? 't' : 'b'))
                            .replace(/<leftRight>/g, ((j == 0) ? 'l' : 'r'))
                            .replace(/<toothType>/g, toothType)
                            .replace(/<toothIndexLast>/g, toothId.toString().charAt(1));
                       

                        let toothState = currentChart[toothId];

                        if (toothState){

                            if (toothState.hasOwnProperty('rct')){

                                console.log(toothState);
                                toothRendered = toothRendered
                                    .replace(/<rootCanalPreffix>/g, (toothType == 'molar') ? (((i == 0) ? 't' : 'b') + toothId.toString().charAt(1) + '-') : '')
                                    .replace('<rootCanal>', '')
                                    .replace('</rootCanal>', '')
                                    .replace(/<rootCanalStatus>/g, colors[toothState['rct']]);
                            }else{
                                var re = /(<rootCanal\b[^>]*>)[^<>]*(<\/rootCanal>)/i;
                                toothRendered =toothRendered.replace(re, " ");
                            }

                            console.log(toothRendered);
                        }
                        
                        
                        content = content.replace('<tooth'+toothId.toString()+'>', toothRendered);

                    });
                });
            });

            pdf.create(content, {
                format: 'A4',
                border: {
                    top: "15mm",
                    right: "10mm",
                    bottom: "15mm",
                    left: "20mm"
                }
            }).toFile(require('app-root-dir').get() + '/tmp/' + 'dodo.pdf', (err, result) => {
                console.log('done!');
            })
        });
    });

});

router.post('/:documentId', (req, res) => {

    
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

    let aws = new AWSService('DentalTap');

    User.findById(req['account_id']).then(
        user => {
            OrganizationDocument.findOne({
                where:{
                    id:req.params.documentId,
                    organization_id:req['organization_id']
                }
            }).then(
                document => {

                    Organization.findById(req['organization_id']).then(
                        organization => {

                            let organizationFormatted = {
                            name:(organization.getDataValue('name')) ? organization.getDataValue('name') : ' ',
                                phone:(organization.getDataValue('phone')) ? organization.getDataValue('phone') : ' ',
                                address:(organization.getDataValue('address')) ? organization.getDataValue('address') : ' ',
                                url:(organization.getDataValue('url')) ? organization.getDataValue('url') : ' ',
                                email:(organization.getDataValue('email')) ? organization.getDataValue('email') : ' ',
                                currency_code:organization.getDataValue('currency_code')
                            };

                            let rawHtml = document.getDataValue('text');

                            let filename = randomstring.generate(64).toUpperCase() + '.pdf';

                            let filePath = require('app-root-dir').get() + '/tmp/' + filename;

                            fs.readFile(require('app-root-dir').get() + '/public/i18n/documents/layout.html', (err, html) => {
                                if (err){
                                    return {error:'DOCUMENT_TEMPLATE_NOT_FOUND'};
                                }else{
                                    
                                    let content = rawHtml;

                                    let patient = req['patient'];
                                    let user = req['patient'].getDataValue('patient_user');

                                    let locale_format = countries['us'].locale_format;

                                    if (countries[req['country_code']])
                                        locale_format = countries[req['country_code']].locale_format;

                                    for (let key in dateLocale){
                                        moment.defineLocale(key, {
                                            months  : dateLocale[key]['months_names'],
                                            monthsShort : dateLocale[key]['months_names_short'],
                                            weekdays : dateLocale[key]['day_names'],
                                            weekdaysShort : dateLocale[key]['day_names_short'],
                                            weekdaysMin  : dateLocale[key]['day_names_min'],
                                            week:{
                                                dow:1,
                                                doy:new Date(new Date().getFullYear(), 0, 1).getDay()
                                            }
                                        });
                                    }
                                    
                                    moment.locale(organization.getDataValue('language'));


                                    content = content.replace(/\*\|/g, '%').replace(/\|\*/g, '%');
                                    content = content
                                            .replace(/%content%/g, rawHtml)
                                            .replace(/%title%/g, document.getDataValue('title'))
                                            .replace(/\*\|SYSTEM_DATE\|\*/g, moment().format(locale_format.date_full2))

                                    content = content
                                            .replace(/\*\|SYSTEM_DATE\|\*/g, moment().format(locale_format.date_full2))
                                            .replace(/\*\|SYSTEM_TIME\|\*/g, moment().format(locale_format.time_mom))
                                            .replace(/\*\|CLINIC_NAME\|\*/g, organization.getDataValue('name'))
                                            .replace(/\*\|CLINIC_PHONE\|\*/g, organization.getDataValue('phone'))
                                            .replace(/\*\|CLINIC_ADDRESS\|\*/g, organization.getDataValue('address'))
                                            .replace(/\*\|CLINIC_URL\|\*/g, organization.getDataValue('url'))
                                            .replace(/\*\|CLINIC_EMAIL\|\*/g, organization.getDataValue('email'))
                                            .replace(/\*\|PATIENT_NAME\|\*/g, user.getDataValue('fullname'))
                                            .replace(/\*\|PATIENT_PHONE\|\*/g, user.getDataValue('phone'))
                                            .replace(/\*\|PATIENT_BIRTHDAY\|\*/g,  user.getDataValue('birthday') ?  moment(user.getDataValue('birthday'), 'YYYY-MM-DD').format(locale_format.date_full2) : ' ')
                                            .replace(/\*\|PATIENT_ADDRESS\|\*/g, user.getDataValue('address'))
                                            .replace(/\*\|PATIENT_CODE\|\*/g, patient.getDataValue('card_number'))
                                            .replace(/\*\|PATIENT_EMAIL\|\*/g, patient.getDataValue('email'))
                                            .replace(/\*\|PATIENT_DOCUMENT_NO\|\*/g, user.getDataValue('document_number'))
                                            .replace(/\*\|PATIENT_DOCUMENT_ISSUED\|\*/g, user.getDataValue('document_issued') ? moment(user.getDataValue('document_issued'), 'YYYY-MM-DD').format(locale_format.date_full2) : ' ')
                                            .replace(/\*\|PATIENT_DOCUMENT_EXPIRED\|\*/g, user.getDataValue('document_expired') ? moment(user.getDataValue('document_expired'), 'YYYY-MM-DD').format(locale_format.date_full2) : ' ')
                                            .replace(/\*\|PATIENT_DOCUMENT_AUTHORITY\|\*/g, user.getDataValue('document_authority'))
                                            .replace(/\*\|TITLE\|\*/g, document.getDataValue('title'))
                                            .replace(/\*\*SYSTEM-DATE\*\*/g, moment().format(locale_format.date_full2))
                                            .replace(/\*\*SYSTEM-TIME\*\*/g, moment().format(locale_format.time_mom))
                                            .replace(/\*\*CLINIC-NAME\*\*/g, organization.getDataValue('name'))
                                            .replace(/\*\*CLINIC-PHONE\*\*/g, organization.getDataValue('phone'))
                                            .replace(/\*\*CLINIC-ADDRESS\*\*/g, organization.getDataValue('address'))
                                            .replace(/\*\*CLINIC-URL\*\*/g, organization.getDataValue('url'))
                                            .replace(/\*\*CLINIC-EMAIL\*\*/g, organization.getDataValue('email'))
                                            .replace(/\*\*PATIENT-NAME\*\*/g, user.getDataValue('fullname'))
                                            .replace(/\*\*PATIENT-PHONE\*\*/g, user.getDataValue('phone'))
                                            .replace(/\*\*PATIENT-BIRTHDAY\*\*/g,  user.getDataValue('birthday') ?  moment(user.getDataValue('birthday'), 'YYYY-MM-DD').format(locale_format.date_full2) : ' ')
                                            .replace(/\*\*PATIENT-ADDRESS\*\*/g, user.getDataValue('address'))
                                            .replace(/\*\*PATIENT-CODE\*\*/g, patient.getDataValue('card_number'))
                                            .replace(/\*\*PATIENT-EMAIL\*\*/g, patient.getDataValue('email'))
                                            .replace(/\*\*TITLE\*\*/g, document.getDataValue('title'));

                                    let procedures = '<table>';

                                    if (req.body.procedures){

                                        req.body.procedures.forEach((procedure) => {

                                            procedures += `
                                                <tr>
                                                    <td>${procedure.tooth_indexes}</td>
                                                    <td>${procedure.price_name}</td>
                                                    <td>x${procedure.qty}</td>
                                                    <td>${formatCurrency(procedure.price_fee_adj, organization.getDataValue('currency_code'))}</td>
                                                </tr>`;

                                        });

                                    }

                                    procedures += '</table>';

                                    content = content.replace('*|SYSTEM_PROCEDURES|*', procedures);

                


                                    options.content = html2pdfmake(content);

                                    /*options.content.unshift({
                                        table: {
                                            widths:['*', 60],
                                            body:[
                                                [
                                                    {bold:true, text:organizationFormatted.name}/*, {image: require('app-root-dir').get() + '/public/logo-compact.png', width:60, rowSpan:4}1/
                                                ],
                                                [
                                                    {text:organizationFormatted.address}
                                                ],
                                                [
                                                    {text:organizationFormatted.phone}
                                                ],
                                                [
                                                    {text:organizationFormatted.url}
                                                ],
                                                [
                                                    {text:organizationFormatted.email}
                                                ]
                                            ]
                                        },
                                        margin:[0,0,0,60],
                                        layout: 'noBorders'
                                    });*/

                                    console.log(JSON.stringify(options.content));

                                    let filename = randomstring.generate(64).toUpperCase() + '.pdf';

                                    
                                    try{
                                        let pdfDoc = printer.createPdfKitDocument(options);

                                        let filePath = require('app-root-dir').get() + '/tmp/' + filename;

                                        pdfDoc.pipe(fs.createWriteStream(filePath)).on('finish',() => {
                                            fs.readFile(filePath, (err, data) => {

                                                PatientFile.create({
                                                    name:(req.body.filename)?req.body.filename:document.getDataValue('title'),
                                                    url:filename,
                                                    extension:'pdf',
                                                    size:3,
                                                    patient_id:req['patient'].getDataValue('id'),
                                                    tags:'',
                                                    organization_id:req['organization_id'],
                                                    create_user_id:req['account_id']
                                                }).then(file => {
                                                   
                                               //     aws.upload(filename, data, 'application/pdf', res, file);
                                                });
                                                
                                                aws.upload(filename, data, 'application/pdf', res);

                                            /*    fs.unlink(filePath, () => {
                                                    
                                                });*/
                                            });
                                        });
                                        pdfDoc.end();
                                    }catch(e){
                                        res.status(400).json({message:'BAD_REQUEST'});
                                    }
                                    
                                    /*
                                    pdf.create(content, {
                                        format: 'A4',
                                        border: {
                                            top: "15mm",
                                            right: "10mm",
                                            bottom: "15mm",
                                            left: "20mm"
                                        }
                                    }).toFile(filePath, (err, result) => {
                                        
                                        if (err){
                                            res.json(err);
                                        }else
                                            fs.readFile(filePath, (err, data) => {

                                            

                                                PatientFile.create({
                                                    name:(req.body.filename)?req.body.filename:document.getDataValue('title'),
                                                    url:filename,
                                                    extension:'pdf',
                                                    size:3,
                                                    patient_id:req['patient'].getDataValue('id'),
                                                    tags:'',
                                                    organization_id:req['organization_id'],
                                                    create_user_id:req['account_id']
                                                }).then(file => {
                                                    new LogService({
                                                        organization_id:req['organization_id'],
                                                        create_user_id:req['account_id'],
                                                        type:'document_add',
                                                        resource_id:file.getDataValue('id'),
                                                        patient_id:req['patient'].getDataValue('id'),
                                                        event_date:null,
                                                        data:JSON.stringify({filename:filename})
                                                    }).add();
                                                    aws.upload(filename, data, 'application/pdf', res, file);
                                                });

                                                fs.unlink(filePath, () => {
                                                    
                                                });
                                            });
                                    });*/
                                }
                            });
                        }
                    )

                }
            )
        });

});

export const patientDocumentPrint = router;