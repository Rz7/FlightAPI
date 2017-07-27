/**
 * Created by Ramiz on 27/06/2017.
 */
process.env.DEBUG = "handler";

const debug     = require('debug')('handler');
const promise   = require('bluebird');
const request   = require('request');
const common    = require('./common.js');
const qs        = require('querystring');

var exports = module.exports = {};

exports.request = function(method, parameters = null) {

    let params = (parameters === null) ? "" : "/?" + qs.stringify(parameters);
    let url = exports.protocol + "://" + exports.url + method + params;

    debug('[Request] To: %s', url);

    return new promise((res, rej) => {
        request(url, (error, response, body) => {
            if(error)
                return rej({ 'message': error });

            if(response.statusCode !== 200)
                return rej({ 'message': 'wrong status code', 'status': response.statusCode });

            res(body);
        });
    }).then((body) => {
        return exports.response(true, common.isJSONStr(body));
    }).catch((e) => {
        debug('[Error][%s] %s', method, e.message);
        return exports.response(false, null, e.statusCode, e.message);
    });
};

exports.validation = function(params) {

    let patterns = {
        'date':  /\d{4}[\-](0?[1-9]|1[012])[\-](0?[1-9]|[12][0-9]|3[01])$/
    };

    for(let i in params)
    {
        if(patterns[params[i].type] !== undefined) {
            if(patterns[params[i].type].exec(params[i].value) === null)
                return false;
        }

        if(params[i].type === 'string') {
            if(Object.prototype.toString.call(params[i].value) !== "[object String]"
                || (parseInt('1' + params[i].value) + '') === '1' + params[i].value)
                return false;
        }
    }

    return true;
};

exports.response = function(success, body, statusCode = 0, message = "") {

    let r = { 'success': success };

    if(statusCode !== 0)
        r['statusCode'] = statusCode;

    if( success)
        r['body'] = body;

    if( message)
        r['message'] = message;

    return r;
};

exports.getAirlines = function(req, resp = null) {
    return exports.request('/airlines').then((response) => {
        return resp === null ? response : resp.send(response);
    });
};

exports.getAirports = function(req, resp = null) {
    let q = (resp === null) ? req : req.query.q;
    return exports.request('/airports', { 'q': q }).then((response) => {
        return resp === null ? response : resp.send(response);
    });
};

exports.getFlights = function(airline, date, from, to) {
    return exports.request('/flight_search/'+airline, {
        "date": date, "from": from, "to": to
    });
};

exports.searchForFlights = function(req, resp = null) {

    /*
        Query parameters:
            date: YYYY-MM-DD
            from: SYD
            to: JFK

        Looks like there are going to be several requests:
            1) getAirlines  (just to get a list of airlines available)
            2) getAirports  (search for airports in chosen cities)
            3) getFlights   (search for flights which meet the requirements)
    */

    let airlines = [];
    let airports = {
        0: [],  // From
        1: []   // To
    };
    let variations = [];
    let results = [];

    common.start().then(() => { // Just to return a promise

        // 0. Check parameters
        // req.query.from, req.query.to req.query.date
        let valid = exports.validation([{
            'type': 'date',
            'value': req.query.date
        },{
            'type': 'string',
            'value': req.query.from
        },{
            'type': 'string',
            'value': req.query.to
        }]);

        if( ! valid)
            throw { 'message': 'bad validation' };

        // 1. Get all airlines
        return exports.getAirlines().then((rsp) => {
            if (!rsp.success)
                throw rsp;

            // airlines = rsp.body;
            for(let i in rsp.body)
                airlines.push(rsp.body[i]['code']);
        });
    })
    .then(() => {

        // 2. Get all airports
        return common.forEachAsync([ req.query.from, req.query.to ], (v, k, c) => {
            exports.getAirports(v, null).then((rsp) => {
                if(rsp.success) {
                    for(let i in rsp.body) {
                        // Turns out some airports may have names of cities they are not in
                        // Ex.: /airports?q=Moscow
                        if(v.toLowerCase() === rsp.body[i]['cityName'].toLowerCase())
                            airports[k].push(rsp.body[i]['airportCode']);
                    }
                }

                c();
            });
        }).then(() => {
            if(airports.length === 0)
                throw { 'success': false, 'message': 'no airports found' };
        });
    }).then(() => {

        // console.log(JSON.stringify(airlines));
        // console.log(JSON.stringify(airports));

        // 3.0. Get variations of what we have
        for (let i in airlines) {
            for (let j in airports[0]) { // From
                for (let j1 in airports[1]) { // To
                    variations.push({
                        "airline": airlines[i],
                        "from": airports[0][j],
                        "to": airports[1][j1]
                    });
                }
            }
        }

        // console.log(JSON.stringify(variations));

        // 3.1 Get all flights
        // /QF?date=2018-09-02&from=SYD&to=JFK
        return common.forEachAsync(variations, (v, k, c) => {
            exports.getFlights(v.airline, req.query.date, v.from, v.to).then((rsp) => {
                if (rsp.success) {
                    for(let i in rsp.body)
                    results.push(rsp.body[i]);
                }

                c();
            });
        });
    }).then(() => {

        // Probably the best flights are the cheapest
        // So the results will be sorted by price, only ten best will be sent
        let short_results = [];
        for(let i in results) {
            short_results.push({
                'key': results[i]['key'],
                'price': results[i]['price'],
            });
        }

        short_results = common.bubbleSort(short_results, 'price').splice(0, 10);
        let information = [];
        for(let i in results) {

            let inShort = false;
            for(let j in short_results)
                if(short_results[j]['key'] === results[i]['key']) {
                    inShort = true;
                    break;
                }

            if(inShort) {
                // Send only the most important information to show (in my opinion)
                // information.push({
                //     'key': results[i]['key'],
                //     'airline': results[i]['airline'],
                //     'flightNum': results[i]['flightNum'],
                //     'start': {
                //         'dateTime': results[i]['start']['dateTime'],
                //         'airportCode': results[i]['start']['airportCode'],
                //         'airportName': results[i]['start']['airportName'],
                //         'cityName': results[i]['start']['cityName'],
                //         'countryName': results[i]['start']['countryName'],
                //     },
                //     'finish': {
                //         'dateTime': results[i]['finish']['dateTime'],
                //         'airportCode': results[i]['finish']['airportCode'],
                //         'airportName': results[i]['finish']['airportName'],
                //         'cityName': results[i]['finish']['cityName'],
                //         'countryName': results[i]['finish']['countryName'],
                //     },
                //     'plane': results[i]['plane'],
                //     'distance': results[i]['distance'],
                //     'durationMin': results[i]['durationMin'],
                //     'price': results[i]['price']
                // });

                // Looks better now
                information.push(common.extractor(results[i], [
                    'key',
                    'airline',
                    'flightNum',
                    'start.dateTime',
                    'start.airportCode',
                    'start.airportName',
                    'start.cityName',
                    'start.countryName',
                    'finish.dateTime',
                    'finish.airportCode',
                    'finish.airportName',
                    'finish.cityName',
                    'finish.countryName',
                    'plane',
                    'distance',
                    'durationMin',
                    'price'
                ]));
            }
        }

        let response = exports.response(true, information, 200);
        return resp === null ? response : resp.send(response);
    }).catch((e) => {
        debug('[Error] %s', e.message);
        let response = exports.response(false, null, e.statusCode, e.message);
        return resp === null ? response : resp.send(response);
    });
};
