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
            let versions = _.values(response)[0].versions;
            versions = _.reject(versions, version => version.match(/(pre|alpha|beta)/));
            this.latestVersion = _.last(versions);
            this.outdated = !semver.satisfies(this.latestVersion, versionToCheckAgainst);
            if (this.outdated) {
                if (this.version[0] === "^" || this.version[0] === "~") {
                    this.suggestedVersion = this.version[0] + this.latestVersion;
                } else {
                    this.suggestedVersion = this.latestVersion;
                }

                log.info("  Package '%s': Update to %s possible; Current: %s", this.name, this.suggestedVersion, this.version);
            } else {
                // ToDo: reinstate once we have a "verbose" log level
                //log.info("Package '%s': Up-to-date", this.name);
            }
            return this;
        });
    }


}
