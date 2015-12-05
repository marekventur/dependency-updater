"use strict";

let convertToSaveBranchName = require("./convert_to_save_branch_name");
let githubRetryWrapper = require("./github_retry_wrapper");

module.exports = class PullRequest {
    constructor(githubRepositoryApi, dependency) {
        this.githubRepositoryApi = githubRepositoryApi;
        this.dependency = dependency;
    }

    open(logger) {
        let currentTimestamp = new Date().getTime();
        let message = `Update "${this.dependency.name}" to version ${this.dependency.suggestedVersion}`;
        let body = `(Pull Request automatically generated)`;
        let branch = convertToSaveBranchName(`dependency-updater-${this.dependency.name}-to-${this.dependency.suggestedVersion}-${currentTimestamp}`);
        let contentRaw = this.dependency.packageJson.createVersionWithUpdatedDependency(this.dependency.type, this.dependency.name, this.dependency.suggestedVersion);

        return githubRetryWrapper(() => {
            return this.githubRepositoryApi.getReference({
                ref: "heads/master"
            })
        })
        .then(response => {
            return githubRetryWrapper(() => {
                return this.githubRepositoryApi.createReference({
                    ref: "refs/heads/" + branch,
                    sha: response.object.sha
                });
            });
        })
        .then(() => {
            // ToDo: Allow special author
            return githubRetryWrapper(() => {
                return this.githubRepositoryApi.updateFile({
                    path: this.dependency.packageJson.path,
                    message,
                    branch,
                    sha: this.dependency.packageJson.sha,
                    content: new Buffer(contentRaw, "utf8").toString("base64")
                });
            });
        })
        .then(() => {
            return githubRetryWrapper(() => {
                return this.githubRepositoryApi.pullRequestCreate({
                    title: message,
                    body,
                    base: "master",
                    head: branch
                });
            });
        })
        .then(response => {
            logger.info("  Pull request #%d opened to update %s to %s", response.number, this.dependency.name, this.dependency.suggestedVersion);

            return this;
        });
    }
}
