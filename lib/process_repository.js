"use strict";

let GitHubApi = require("github");
let Repository = require("./repository");

module.exports = function processRepositories (repositoryName, githubAuth, logbook) {
    let github = new GitHubApi({ version: "3.0.0" });
    github.authenticate(githubAuth);

    let repository = new Repository(repositoryName, github);

    return repository.load();
};