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

const formatCurrency = (value, code, qty?) => {

    value = Number(value).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');

    if (code == 'VND'){
        value = value.toString().split('.')[0];
    }

    let qtyFormat = (qty) ? '(x' + qty + ') ' : ''; 

    return value.toString() + ' ' + code.toUpperCase();
    
}

const fonts = {
    Roboto: {
        normal:'./public/fonts/muller/MullerRegular.ttf',
        bold:  './public/fonts/muller/MullerBold.ttf',
        italics:'./public/fonts/muller/MullerRegular.ttf',
    }
};

const invoiceStatus = (invoice) => {

    let toPay = invoice.getDataValue('total_amt') - invoice.getDataValue('total_amt')*invoice.getDataValue('discount')/100 + invoice.getDataValue('total_amt')*invoice.getDataValue('tax')/100 - invoice.getDataValue('payed_amt');

    let today = new Date().getTime();

    if ((invoice.expire_date >= today || invoice.expire_date == null) && toPay > 0){
        return 'pend';
    }

    if (toPay <= 0) return 'paid';

    if (toPay > 0 && invoice.expire_date < today) return 'exp';

    return 'pend';
}

const calc_remained = (invoice) => {

    let amt = (invoice.getDataValue('total_amt')+invoice.getDataValue('tax')*invoice.getDataValue('total_amt')/100)-invoice.discount*(invoice.getDataValue('total_amt')+invoice.getDataValue('tax')*invoice.getDataValue('total_amt')/100)/100 - invoice.getDataValue('payed_amt');
    if (amt >=0){
        return amt;
    }else{
        return 0;
    }
}

const printer = new PdfPrinter(fonts);

router.get('/', (req, res) => {

    let aws = new AWSService('DentalTap');

    let patient = req['patient'];

    let patientFormatted = {
        fullname:patient.getDataValue('patient_user').getDataValue('fullname'),
        phone:(patient.getDataValue('patient_user').getDataValue('phone')) ? patient.getDataValue('patient_user').getDataValue('phone') : ' ',
        address:(patient.getDataValue('patient_user').getDataValue('address')) ? patient.getDataValue('patient_user').getDataValue('address') : ' '
    };

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
                        email:(response.getDataValue('email')) ? response.getDataValue('email'): ' ',
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

                    moment.locale(language);  
                    
                    PatientProcedure.findAll<PatientProcedure>({
                        where:{
                            invoice_id:req['invoice'].getDataValue('id')
                        }
                    }).then(
                        response => {

                            let procedures = [];

                            response.forEach((procedure) => {
                                procedures.push({
                                    chart_code:procedure.getDataValue('chart_code'),
                                    teeth:procedure.getDataValue('tooth_indexes'),
                                    surface_indexes:procedure.getDataValue('surface_indexes'),
                                    price_code:procedure.getDataValue('price_code'),
                                    price_name: procedure.getDataValue('price_name'),
                                    price_fee:procedure.getDataValue('price_fee'),
                                    price_fee_adj:procedure.getDataValue('price_fee_adj'),
                                    qty:procedure.getDataValue('qty'),
                                    invoice_id:procedure.getDataValue('invoice_id'),
                                    status_code:procedure.getDataValue('status_code'),
                                    diagnosis_code:procedure.getDataValue('diagnosis_code')
                                });
                            });

                            let proceduresList = [];
                            procedures.forEach((procedure) => {
                                if (procedure.price_fee != procedure.price_fee_adj){
                                    proceduresList.push([
                                        [
                                            {margin:[0,0,0,0], fontSize:9, text:procedure.teeth},
                                            {margin:[0,0,0,0], style:'tableContent',  fontSize:12, text:procedure.price_name}
                                        ], 
                                        {style:'tableContent', text:'x'+ procedure.qty, bold:true, fontSize:12}, 
                                        [
                                            {margin:[0,10,0,0], fontSize:8, decoration:'lineThrough',text:formatCurrency(procedure.price_fee, organization.currency_code, procedure.qty)}, 
                                            {margin:[0,0,0,10], text:formatCurrency(procedure.price_fee_adj, organization.currency_code, procedure.qty)}
                                        ]
                                    ])
                                }else{
                                    proceduresList.push( [
                                        [
                                            {margin:[0,0,0,0], fontSize:9, text:procedure.teeth},
                                            {margin:[0,0,0,0], style:'tableContent',  fontSize:12, text:procedure.price_name}
                                        ], 
                                        {style:'tableContent', text:'x'+ procedure.qty, bold:true, fontSize:12},
                                        {style:'tableContent', text:formatCurrency(procedure.price_fee, organization.currency_code, procedure.qty)}
                                    ])
                                }
                            });

                            fs.readFile(require('app-root-dir').get() + '/public/i18n/documents/' + language + '/invoice.json', 'utf8', (err, data) => {

                                let json = JSON.parse(data);

                                let invoiceFormatted = {
                                    number:(req['invoice'].getDataValue('code') ? req['invoice'].getDataValue('code') : req['invoice'].getDataValue('internal_number')),
                                    total_amt:req['invoice'].getDataValue('total_amt'),
                                    payed_amt:req['invoice'].getDataValue('payed_amt'),
                                    discount:req['invoice'].getDataValue('discount'),
                                    tax:req['invoice'].getDataValue('tax'),
                                    status:json['st.' + invoiceStatus(req['invoice'])],
                                    comment:(req['invoice'].getDataValue('comment')) ? req['invoice'].getDataValue('comment') : ' ',
                                    create_date:moment(req['invoice'].getDataValue('createdAt'), 'YYYY-MM-DD').format(locale_format.date_full2),
                                    expire_date:(req['invoice'].getDataValue('expire_date')) ? moment(req['invoice'].getDataValue('expire_date'), 'YYYY-MM-DD').format(locale_format.date_full2) : 'N/A'
                                };

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
                                    text: json['title'] +' ' + invoiceFormatted.number
                                });

                                //options.content.push({ style:'header', text:});
                                /*
                                options.content.push({
                                    table: {
                                        widths:[100, '*', 60],
                                        body:[
                                            [
                                                {text:' '}, {text: ' '}, {margin:[0,30,0,0], image: require('app-root-dir').get() + '/public/logo-compact.png', width:60, rowSpan:4}
                                            ],
                                            [
                                                {style:'tableContentSm', text:json['creat']}, {style:'tableContentSm', text:invoiceFormatted.create_date}
                                            ],
                                            [
                                                {style:'tableContentSm', text:json['exp']}, {style:'tableContentSm', text:invoiceFormatted.expire_date}
                                            ],
                                            [
                                                {style:'tableContentSm', text:json['stat']}, {style:'tableContentSm', text:invoiceFormatted.status}
                                            ]
                                        ]
                                    },
                                    layout: 'noBorders'
                                });*/

                                options.content.push({
                                    table: {
                                        widths: ['*', '*'],
                                        body: [
                                            [
                                                {style:'tableInlineTitle', text:json['title'].toUpperCase()},
                                                {style:'tableInlineTitle', text:json['pt'].toUpperCase()}
                                            ],
                                            [
                                                {style:'tableInlineContent2', text: formatCurrency(invoiceFormatted.total_amt, organization.currency_code) },
                                                {style:'tableInlineContent2', text: patientFormatted.fullname},
                                            ],
                                            [
                                                {style:'tableContentSm', text: invoiceFormatted.expire_date},
                                                {style:'tableContentSm', text: patientFormatted.phone},
                                            ],
                                            [
                                                {style:'tableContentSm', text: invoiceFormatted.status},
                                                {style:'tableContentSm', text: patientFormatted.address},
                                            ]
                                        ]
                                    },
                                    layout:'noBorders',
                                    margin:[0,50,0,30]
                                });
                                
                                proceduresList = proceduresList.concat([
                                    [{text:' '}, {style:'tableContent', text:json['sum.tot'], alignment:'right'}, {style:'tableContent', text:formatCurrency(invoiceFormatted.total_amt, organization.currency_code)}],
                                    [{text:' '}, {style:'tableContent', text:json['sum.tax'], alignment:'right'}, {style:'tableContent', text:invoiceFormatted.tax + '%'}],
                                    [{text:' '}, {style:'tableContent', text:json['sum.disc'], alignment:'right'}, {style:'tableContent', text:invoiceFormatted.discount + '%'}],
                                    [{text:' '}, {style:'tableContent', text:json['sum.paid'], alignment:'right'}, {style:'tableContent', text:formatCurrency(invoiceFormatted.payed_amt, organization.currency_code)}],
                                    [{text:' '}, {style:'tableContent', text:json['sum.rem'], alignment:'right'}, {style:'tableContent', text: formatCurrency(calc_remained(req['invoice']), organization.currency_code)}]
                                ]);

                                options.content.push({
                                    table: {
                                        widths:['*', 70, 100],
                                        body:proceduresList
                                    },
                                    pageBreak: 'after',
                                    layout:'lightHorizontalLines'
                                });

                                options.content.push({text:invoiceFormatted.comment, style:'legend'});

                                i2b('https://dentaltap.s3.amazonaws.com/' + organization.photo, (err, data) => {
                                    if (!err){
                                        options.content[0].table.body.splice(0, 1);
                                        options.content[0].table.body.unshift([
                                            {image:data.dataUri, width:60, rowSpan:4}
                                        ])
                                    }
                                    console.log(data);

                                    let pdfDoc = printer.createPdfKitDocument(options);

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

                            });

                        //  res.json(response);
                        }
                    )   
                }
            )
        }
    );
});

export const patientInvoicePrint = router;