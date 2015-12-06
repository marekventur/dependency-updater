"use strict";

let retryWrapper = require("../lib/github_retry_wrapper");
let expect = require("chai").expect;
let assert = require("chai").assert;

describe("githubRetryWrapper", () => {
    let abuseError, logger;

    beforeEach(() => {
        abuseError = new Error("You have triggered an abuse detection mechanism and have been temporarily blocked from content creation. Please retry your request again later.");
        abuseError.code = 403;

        logger = { warn: () => {}};

        retryWrapper.RETRY_DELAY = 1;
        retryWrapper.RETRY_DELAY_MAX = 128;
    })

    it("passes normal response through", () => {
        return retryWrapper(() => Promise.resolve("foobar"), logger)
        .then(response => {
            expect(response).to.equal("foobar");
        })
    });

    it("retries multiple times", () => {
        let i = 0;
        function foo() {
            i++;
            if (i === 3) {
                return Promise.resolve("foobar");
            }

            return Promise.reject(abuseError);
        }

        return retryWrapper(() => foo(), logger)
        .then(response => {
            expect(response).to.equal("foobar");
        })
    });

    it("passes normal errors through", () => {
        let error = new Error("other");
        return retryWrapper(() => Promise.reject(error), logger)
        .then(() => assert.fail(), err => {
            expect(err).to.equal(error);
        })
    });

    it("times out", () => {
        return retryWrapper(() => Promise.reject(abuseError), logger)
        .then(() => assert.fail(), err => {
            expect(err).to.equal(abuseError);
        })
    });
});