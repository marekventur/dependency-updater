"use strict";

let Repository = require("./repository");
let _ = require("underscore");

module.exports = function processRepositories (repositoryName, githubAuth, logbook, logger, githubRepositoryApi, npmApi, PullRequest) {
    let repository = new Repository(githubRepositoryApi, npmApi);

    return npmApi.load()
    .then(() => repository.createPackages())
    .then(packages => {
        return Promise.all(packages.map(p => {
            logger.info("Processing %s:%s", repositoryName, p.path);
            return p.createDependencies()
            .then(dependencies => {
                return Promise.all(dependencies.map(d => {
                    let lastCheckedVersion = logbook.get(repositoryName, d.name);
                    return d.checkForNewerVersion(lastCheckedVersion, logger);
                }));
            })
            .then(dependencies => {
                let outdatedDependencies = _.where(dependencies, {outdated: true});
                return Promise.all(outdatedDependencies.map(dependency => {
                    let pr = new PullRequest(githubRepositoryApi, dependency);
                    return pr.open(logger, logbook)
                    .then(pr => {
                        logbook.set(githubRepositoryApi.repositoryName, dependency.name, dependency.suggestedVersion);
                        return pr;
                    });
                }))
                .then(_.compact);
            });
        }));
    })
    .then(_.flatten);
};