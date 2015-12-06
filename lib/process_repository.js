"use strict";

let Repository = require("./repository");
let _ = require("underscore");

module.exports = function processRepositories (repositoryName, githubAuth, logbook, logger, githubRepositoryApi, npmApi, PullRequest) {
    let repository = new Repository(githubRepositoryApi, npmApi);

    return npmApi.load()
    .then(() => repository.createPackages())
    .then(packages => {
        let packagePromiseChain = Promise.resolve();
        let prs = [];

        packages.forEach(p => {
            packagePromiseChain = packagePromiseChain.then(() => {
                logger.info("Processing %s:%s", repositoryName, p.path);
                return p.createDependencies()
            })
            .then(dependencies => {
                return Promise.all(dependencies.map(d => {
                    let lastCheckedVersion = logbook.get(repositoryName, d.name);
                    return d.checkForNewerVersion(lastCheckedVersion, logger);
                }));
            })
            .then(dependencies => {
                let outdatedDependencies = _.where(dependencies, {outdated: true});
                let promiseChain = Promise.resolve();
                let aborted = false;

                outdatedDependencies.forEach(dependency => {
                    promiseChain = promiseChain.then(() => {
                        if (aborted) { return; }
                        let pr = new PullRequest(githubRepositoryApi, dependency);
                        return pr.open(logger, logbook)
                        .then(pr => {
                            logbook.set(githubRepositoryApi.repositoryName, dependency.name, dependency.suggestedVersion);
                            prs.push(pr);
                        }, err => {
                            if (err.code === 403 && err.message.indexOf("abuse detection")) {
                                aborted = true;
                                logger.warning("  Github's abuse detection still stopping requests from succeeding. Aborting opening further PRs");
                            }
                            throw err;
                        });
                    });
                });
                return promiseChain;
            });
        });
        return packagePromiseChain.then(() => prs);
    })
    .then(_.flatten);
};