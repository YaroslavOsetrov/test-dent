import {Router, Request, Response, RequestHandler} from 'express';
import * as fs from 'fs';

import * as moment from 'moment';
import {db} from './../models';

import {Appointment} from './../models/appointment/main';

import * as validator from 'validator';

import * as urlencode from 'urlencode';

import {i18nService} from './../services/i18nService';

const models = db.models;
const router = Router();

const priceByteMaxSize = 10000000;

router.get('/:date/:providerId/:sectionId', (req, res, next) => {


    req.query.start = urlencode.decode(req.query.start);
    req.query.end = urlencode.decode(req.query.end);

    if (!validator.toDate(req.params.date) || 
        !validator.matches(decodeURI(req.query.start), '^([0-1]?[0-9]|2[0-4]):[0-5][0-9]$') ||
        !validator.matches(decodeURI(req.query.end), '^([0-1]?[0-9]|2[0-4]):[0-5][0-9]$') ||
        !validator.isNumeric(req.params.sectionId) ||
        !validator.isUUID(req.params.providerId)
    ){
        return res.status(400).json({message: 'INVALID_REQUEST'});
    }

    let start = req.query.start.split(':');
    let end = req.query.end.split(':');

    let date = moment.utc(req.params.date).format('YYYY-MM-DD');

    let sectionId = req.params.sectionId;

    let userId = req.params.providerId;

    Appointment.findAll<Appointment>({
        where:{
            organization_id : req['organization_id'],
            section_id      : sectionId,
            provider_id     : userId,
            date            : date
        }
    }).then(
        appointments => {

            let freeIntervals:Array<{is_blocked:boolean, time:string}> = [];
            let freeIntervalsIndexes:Array<string> = [];

            let _i18nService = new i18nService();

            let countries = _i18nService.countries();

            let formatHour = (countries[req['country_code']]['locale_format']['is_24h']) ? 'HH:mm' : 'h:mma';

            let exp = moment.utc(req.params.date).add('12', 'hours').add('30', 'minutes').format('HH:mm');

            let minInt = moment.utc(req.params.date).add(start[0], 'hours').add(start[1], 'minutes');
            
            let maxInt = moment.utc(req.params.date).add(end[0], 'hours').add(end[1], 'minutes');

            for (let m = minInt; m.isSameOrBefore(maxInt); m.add(15, 'minutes')) {
                freeIntervalsIndexes.push(m.format(formatHour));
                freeIntervals.push({is_blocked:false, time:m.format(formatHour)});
            }

            appointments.forEach((item) => {

                let startN = moment.utc(item.getDataValue('start_time')).format('HH:mm').split(':');
                let endN = moment.utc(item.getDataValue('end_time')).format('HH:mm').split(':');


                let minInt = moment.utc(req.params.date).add(startN[0], 'hours').add(startN[1], 'minutes').add(15, 'minutes');
            
                let maxInt = moment.utc(req.params.date).add(endN[0], 'hours').add(endN[1], 'minutes');


                for (let m = minInt; m.isBefore(maxInt); m.add(15, 'minutes')) {

                    let slot = freeIntervalsIndexes.indexOf(m.format(formatHour));
                    if (slot != -1)
                        freeIntervals[slot].is_blocked = true;
                }

            });

            res.json(freeIntervals);

        }
    );


    

});
export const apptFreeCells = router;