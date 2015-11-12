"use strict";

let tmp = require("tmp");
let Logbook = require("../lib/logbook");
let assert = require("chai").assert;

describe("Logbook", () => {
    let tempPath, logbook;

    beforeEach(() => {
        tempPath = tmp.tmpNameSync();
        logbook = new Logbook(tempPath);
    });

    it("loads even though the file does not exists", () => {
        return logbook.load();
    });

    context("after load", () => {
        beforeEach(() => {
            return logbook.load();
        });

        it("uses a default value if no data is found", () => {
            assert.equal(logbook.get("repo", "foo", "default"), "default");
        });

        it("returns undefined if no default value is given", () => {
            assert.equal(logbook.get("repo", "foo"), undefined);
        });

        it("allows a key to be set and get", () => {
            logbook.set("repo", "foo", "bar")
            assert.equal(logbook.get("repo", "foo"), "bar");
            logbook.set("repo", "foo", "bar2")
            assert.equal(logbook.get("repo", "foo"), "bar2");
        });
    });

    it("persists data", () => {
        return logbook.load()
        .then(() => {
            logbook.set("repo", "foo", "bar");
            return logbook.save();
        })
        .then(() => {
            let newLogbook = new Logbook(tempPath);
            return newLogbook.load();
        })
        .then(newLogbook => {
            assert.equal(logbook.get("repo", "foo"), "bar");
        })
    });

});