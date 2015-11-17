"use strict";

let GithubRepositoryApi = require("./github_repository_api");
let NpmApi = require("./npm_api");
let Repository = require("./repository");
let PullRequest = require("./pull_request");
let _ = require("underscore");

module.exports = function processRepositories (repositoryName, githubAuth, logbook, logger) {
    let githubRepositoryApi = new GithubRepositoryApi(githubAuth, repositoryName);
    let npmApi = new NpmApi();

    let repository = new Repository(githubRepositoryApi, npmApi);

    return npmApi.load()
    .then(() => repository.createPackages())
    .then(packages => {
        return Promise.all(packages.map(p => {
            return p.createDependencies()
            .then(dependencies => {
                let lastCheckedVersion = null;
                // dependencies = _.where(dependencies, { name: "browserify" }); // ToDo: remove me
                return Promise.all(dependencies.map(d => d.checkForNewerVersion(lastCheckedVersion, logger)))
            })
            .then(dependencies => {
                let outdatedDependencies = _.where(dependencies, {outdated: true});
                return Promise.all(outdatedDependencies.map(dependency => {
                    let pr = new PullRequest(githubRepositoryApi, dependency);
                    return pr.open(logger);
                }));
            });
        }));
    });
};