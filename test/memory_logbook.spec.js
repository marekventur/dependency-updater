"use strict";

let MemoryLogbook = require("../lib/memory_logbook");
let assert = require("chai").assert;

describe("MemoryLogbook", () => {
    let tempPath, logbook;

    beforeEach(() => {
        logbook = new MemoryLogbook(tempPath);
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