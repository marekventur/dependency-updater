"use strict";

/**
 * Wraps github requests and retries if an "abuse detection" response is found
 **/
function githubRetryWrapper (func, logger, delay) {
    delay = delay || githubRetryWrapper.RETRY_DELAY;

    return func()
    .catch(err => {
        if (err.code === 403 && err.message.indexOf("abuse detection") > -1 && delay < githubRetryWrapper.RETRY_DELAY_MAX) {
            logger.warn("  Request has triggered github's abuse detection. Retrying.");
            return new Promise(resolve => setTimeout(resolve, delay))
            .then(() => githubRetryWrapper(func, logger, delay * githubRetryWrapper.RETRY_INCREASE_FACTOR));
        }

        // otherwise re-throw error
        throw err;
    });
}

// Exposed so they can be changed by tests
githubRetryWrapper.RETRY_DELAY = 3000;
githubRetryWrapper.RETRY_INCREASE_FACTOR = 2;
githubRetryWrapper.RETRY_DELAY_MAX = 96001;

module.exports = githubRetryWrapper;