"use strict";

let MemoryLogbook = require("./memory_logbook");

let fs = require("fs");
let promisify = require("es6-promisify");

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

module.exports = class Logbook extends MemoryLogbook {
    constructor(path) {
        super();
        this.path = path;
    }

    load(path) {
        return readFile(this.path)
        .then(raw => {
            this.data = JSON.parse(raw);
        })
        .catch(() => {
            // This failure is recoverable (and even expected in case of a cold cache)
            this.data = {};
        })
        .then(() =>  this);
    };

    save() {
        return writeFile(this.path, JSON.stringify(this.data, null, 4));
    };
}
