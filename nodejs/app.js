/**
 * Created by Ramiz on 27/06/2017.
 */
process.env.DEBUG = "app";

const debug     = require('debug')('app');
const express   = require('express');
const cors      = require('cors');
const promise   = require('bluebird');
const common    = require('./common.js');
const handler   = require('./handler.js');
const api       = require('./api-set.json');

function App() {
    let self = this;

    self.exp    = express();
    self.init();
}

App.prototype.init = function() {
    let self = this;

    handler.url = api.url;
    handler.protocol = api.protocol;

    return new promise((res, rej) => {
        self.exp.listen(api.server_port, res);
    }).then((err) => {
        if (err)
            throw err;

        debug('Server is listening on %s', api.server_port);
    }).then(() => {
        // Middleware
        self.exp.use(cors());
    }).then(() => {
        return common.forEachAsync(api.methods, (data, key, complete) => {
            self.exp[data['verb']](data['method'], handler[data['f']]);
            complete();
        });
    }).then(() => {
        debug('Initialization is done');
    }).catch((e) => {
        return debug('[Error] An error occurred: %s', e);
    });
};

(new App());
