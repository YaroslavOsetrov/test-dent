import {Router, Request, Response, RequestHandler} from 'express';

import * as fs from 'fs';

const router = Router();

const PdfPrinter = require('pdfmake');

const fonts = {
    Roboto: {
        normal:'./public/fonts/muller/MullerRegular.otf',
        bold:  './public/fonts/muller/MullerBold.otf'
    }
};

const printer = new PdfPrinter(fonts);

router.get('/', (req, res) => {

    
    var dd = {
        content: [
            'First paragraph',
            'Another paragraph'
        ]
    }
    var pdfDoc = printer.createPdfKitDocument(dd);
    pdfDoc.pipe(res).on('finish',() => {
        
    });
    pdfDoc.end();

});

export const documentRouter = router;