"use strict";

let _ = require("underscore");

module.exports = class PullRequest {
    constructor(githubRepositoryApi, dependency) {
        this.githubRepositoryApi = githubRepositoryApi;
        this.dependency = dependency;
    }

    open(logger, logbook) {
        let currentTimestamp = new Date().getTime();
        let message = `Update "${this.dependency.name}" to version ${this.dependency.suggestedVersion}`;
        let body = `(Pull Request automatically generated)`;
        let branch = `dependency-updater-${this.dependency.name}-to-${this.dependency.suggestedVersion}-${currentTimestamp}`;
        let contentRaw = this.dependency.packageJson.createVersionWithUpdatedDependency(this.dependency.type, this.dependency.name, this.dependency.suggestedVersion);


        return this.githubRepositoryApi.getReference({
            ref: "heads/master"
        })
        .then(response => {
            return this.githubRepositoryApi.createReference({
                ref: "refs/heads/" + branch,
                sha: response.object.sha
            });
        })
        .then(() => {
            logger.info("Created branch %s", branch);

            // ToDo: Allow special author
            return this.githubRepositoryApi.updateFile({
                path: this.dependency.packageJson.path,
                message,
                branch,
                sha: this.dependency.packageJson.sha,
                content: new Buffer(contentRaw, "utf8").toString("base64")
            })
        })
        .then(() => {
            logger.info("Created commit");
            return this.githubRepositoryApi.pullRequestCreate({
                title: message,
                body,
                base: "master",
                head: branch
            });
        })
        .then(response => {
            logger.info("Pull request #%d opened", response.number);

            logbook.set(this.githubRepositoryApi.repositoryName, this.dependency.name, this.dependency.suggestedVersion);
            return this;
        });
    }


}
