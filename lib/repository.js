"use strict";

let Package = require("./package");
let _ = require("underscore");

const DEFAULT_CONFIG = {
    paths: ["package.json"]
};
const CONFIG_FILENAME = ".dependency-updater.json";

module.exports = class Repository {
    constructor(githubRepositoryApi, npmApi) {
        this.githubRepositoryApi = githubRepositoryApi;
        this.npmApi = npmApi;
    }

    _fetchConfig() {
        return this.githubRepositoryApi.getContentJson({path: CONFIG_FILENAME})
        .then(
            data => _.defaults(data.content, DEFAULT_CONFIG),
            err => {
                if (err.code === 404) {
                    return DEFAULT_CONFIG;
                }
                throw err;
            }
        );
    }

    createPackages() {
        return this._fetchConfig()
        .then(config => {
            return config.paths.map(path => new Package(this.githubRepositoryApi, this.npmApi, config, path));
        });
    }
}
