"use strict";

let _ = require("underscore");
let semver = require("semver");

module.exports = class Dependency {
    constructor(githubRepositoryApi, npmApi, packageJson, type, name, version) {
        this.githubRepositoryApi = githubRepositoryApi;
        this.npmApi = npmApi;
        this.packageJson = packageJson;
        this.type = type;
        this.name = name;
        this.version = version;
    }

    checkForNewerVersion(alreadyProposedUpdateTo, log) {
        // If the current version contains a slash we either have a github, git,
        // local or http dependency which we should skip
        if (this.version.indexOf("/") > -1) {
            this.outdated = false;
            return Promise.resolve(this);
        }

        // If we have already proposed an update to a newer version we
        // only need to take that version into account. This is to avoid
        // creating a new pull request every time the script is run.
        let versionToCheckAgainst = alreadyProposedUpdateTo || this.version;

        return this.npmApi.view([this.name])
        .then(response => {
            let versions = _.values(response)[0].versions; // ToDo: Exclude beta and alpha releases
            this.latestVersion = _.last(versions);
            this.outdated = !semver.satisfies(this.latestVersion, versionToCheckAgainst);
            log.info("Lates version of '%s' is '%s", this.name, this.latestVersion);
            if (this.outdated) {
                log.info("  Update for %s possible; Current: %s", this.name, versionToCheckAgainst);
                this.suggestedVersion = this.latestVersion; // ToDo: Keep ^ and ~
            }
            return this;
        });
    }


}
