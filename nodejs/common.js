/**
 * Created by Ramiz on 27/06/2017.
 */

/*
* Some common function I've written and been using a lot
* Check out all @https://github.com/Rz7/CommonJS/blob/master/index.js
* */

const promise     = require('bluebird');
const moment      = require('moment');

const common = {

    // Create and return a promise
    start: (delay) => {

        if(delay)
            return promise.delay(delay);

        return promise.resolve(null);
    },

    // Check if JSON is good and return it
    isJSONStr: (str) => {
        let r = null;
        try { r = JSON.parse(str); } catch (e) { return false; } return r;
    },

    // Receive an array and process each element in _func
    // Works the same as standard forEach, except forEachAsync
    // return a promise after processing all elements
    // -Async process all elements at the same time
    forEachAsync: (array, _func) => {
        return promise.resolve(null).then(() => {

            if( ! array || array.length === 0)
                return null;

            if( typeof _func === 'undefined')
                return null;

            let go = {
                do: () => {
                    return promise.resolve(null).then(() => {
                        array.forEach((element, index) => {
                            _func(element, index, go.complete);
                        });
                    }).then(go.checking);
                },
                complete: () => {
                    ++go.counter;
                },
                checking: () => {
                    return promise.delay(100).then(() => {
                        if(go.counter === go.length)
                            return 'done';
                        else
                            return go.checking();
                    });
                },
                counter: 0,
                length: array.length
            };

            return go.do();
        });
    },

    bubbleSort: (a, key) => {

        // Bubble sort
        let swapped;
        do {
            swapped = false;
            for (let i=0; i < a.length-1; i++) {
                if (a[i][key] > a[i+1][key]) {
                    let temp = a[i];
                    a[i] = a[i+1];
                    a[i+1] = temp;
                    swapped = true;
                }
            }
        } while (swapped);

        return a;
    },

    // Receives an object and returns a new one with keys only given in array keys
    extractor: (object, keys) => {

        let new_object = {};

        for(let i in keys)
            keys[i] = keys[i].split(".");

        let dimension = (obj, n_obj, k, i) => {

            if(i + 1 === k.length)
                n_obj[k[i]] = obj[k[i]];
            else {

                if(typeof n_obj[k[i]] === 'undefined')
                    n_obj[k[i]] = {};

                n_obj[k[i]] = dimension(obj[k[i]], n_obj[k[i]], k, ++i);
            }

            return n_obj;
        };

        for(let i in keys)
            new_object = dimension(object, new_object, keys[i], 0);

        return new_object;
    }
};

module.exports = common;
