"use strict";

let convert = require("../lib/convert_to_save_branch_name");
let expect = require("chai").expect;

describe("convertToSaveBranchName", () => {
    it("leaves normal branch names alone", () => {
        let name = "some-branch-name-I-came-up-with-1.2.3";
        expect(convert(name)).to.equal(name);
    });

    it("removes problematic characters", () => {
        let name = "dependency-updater-browserify-to-^12.0.1-1449344237456";
        let correct = "dependency-updater-browserify-to-12.0.1-1449344237456";
        expect(convert(name)).to.equal(correct);
    });

    it("removes periods at the end", () => {
        let name = "test.";
        let correct = "test";
        expect(convert(name)).to.equal(correct);
    });
});