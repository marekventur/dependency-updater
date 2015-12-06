"use strict";

module.exports = function convertToSaveBranchName(input) {
    return input
        .replace(/[^a-zA-Z0-9_\-.\+]/g, "")
        .replace(/\.\.|\.lock/g, "")
        .replace(/\.$/, "");
};
