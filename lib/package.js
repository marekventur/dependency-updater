"use strict";

let _ = require("underscore");
let Dependency = require("./dependency");

module.exports = class Package {
    constructor(githubRepositoryApi, npmApi, config, path) {
        this.githubRepositoryApi = githubRepositoryApi;
        this.npmApi = npmApi;
        this.config = config;
        this.path = path;
    }

    _createDependenciesFor(type, packageJson) {
        let dependencies = packageJson[type];
        if (!dependencies) {
            return [];
        }

        return _.map(dependencies, (version, name) => {
            return new Dependency(this.githubRepositoryApi, this.npmApi, this, type, name, version);
        });
    }

    createDependencies() {
        return this.githubRepositoryApi.getContentJson({ path: this.path })
        .then(response => {
            this.sha = response.sha;
            this.content = response.content;
            return _.flatten([
                this._createDependenciesFor("dependencies", response.content),
                this._createDependenciesFor("devDependencies", response.content),
                this._createDependenciesFor("peerDependencies", response.content)
            ]);
        })
    }

    createVersionWithUpdatedDependency(type, name, newVersion) {
        let clonedContent = JSON.parse(JSON.stringify(this.content));
        clonedContent[type][name] = newVersion;
        return JSON.stringify(clonedContent, null, 2) + "\n";
    }
}
