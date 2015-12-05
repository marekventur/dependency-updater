"use strict";

/**
 * Wraps github requests and retries if an "abuse detection" response is found
 **/
function githubRetryWrapper (func, delay) {
    delay = delay || githubRetryWrapper.RETRY_DELAY;

    return func()
    .catch(err => {
        if (err.code === 403 && err.message.indexOf("abuse detection") > -1 && delay < githubRetryWrapper.RETRY_DELAY_MAX) {
            return new Promise(resolve => setTimeout(resolve, delay))
            .then(() => githubRetryWrapper(func, delay * githubRetryWrapper.RETRY_INCREASE_FACTOR));
        }

        // otherwise re-throw error
        throw err;
    });
}

// Exposed so they can be changed by tests
githubRetryWrapper.RETRY_DELAY = 3000;
githubRetryWrapper.RETRY_INCREASE_FACTOR = 2;
githubRetryWrapper.RETRY_DELAY_MAX = 30000;

module.exports = githubRetryWrapper;