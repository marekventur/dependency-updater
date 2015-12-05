"use strict";

let npm = require("npm");
let promisify = require("es6-promisify");

/**
 * A promise wrapper for npm
 **/
module.exports = class NpmApi {
    load() {
        return promisify(npm.load)({loglevel: "silent"})
    }

    view(parameters) {
        return promisify(npm.commands.view)(parameters, true);
    }
}