"use strict";

let GitHubApi = require("github");
let promisify = require("es6-promisify");
let _ = require("underscore");

/**
 * A promise wrapper for the github repository API
 **/
module.exports = class GithubRepositoryApi {
    constructor(auth, repositoryName) {
        this.repositoryName = repositoryName;

        this.api = new GitHubApi({ version: "3.0.0" });
        this.api.authenticate(auth);

        let matches = repositoryName.match(/^([^\/]*)\/([^\/]*)$/);
        if (!matches) {
            throw new Error("Invalid repository name: " +  repositoryName);
        }

        this.defaultConfig = {
            user: matches[1],
            repo: matches[2]
        };
    }

    getContent(config) {
        return promisify(this.api.repos.getContent)(_.defaults(config, this.defaultConfig));
    }

    getContentJson(config) {
        return this.getContent(config)
        .then(data => {
            try {
                data.content = JSON.parse(new Buffer(data.content, "base64").toString("utf8"));
                return data;
            } catch (err) {
                throw new Error("Couldn't parse JSON in file '" + config.path + "' in repository '" + this.repositoryName  + "'");
            }
        });
    }

    updateFile(config) {
        return promisify(this.api.repos.updateFile)(_.defaults(config, this.defaultConfig));
    }

    createReference(config) {
        return promisify(this.api.gitdata.createReference)(_.defaults(config, this.defaultConfig));
    }

    getReference(config) {
        return promisify(this.api.gitdata.getReference)(_.defaults(config, this.defaultConfig));
    }

    pullRequestCreate(config) {
        return promisify(this.api.pullRequests.create)(_.defaults(config, this.defaultConfig));
    }
}