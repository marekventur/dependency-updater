"use strict";

let promisify = require("es6-promisify");

module.exports = class Repository {
    constructor(repositoryName, github) {
        this.repositoryName = repositoryName;
        this.github = github;
    }

    load() {
        let getContent = promisify(this.github.repos.getContent);

        return getContent({user: "marekventur", repo: "resource-loader", path: "package.json"})
        .then(data => {
            console.log(data);
        });
    }
}
