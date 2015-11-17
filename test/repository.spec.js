"use strict";

let Repository = require("../lib/repository");
let expect = require("chai").expect;
let sinon = require("sinon");

describe("Repository", () => {
    let repository, githubRepositoryApi, npmApi;

    beforeEach(() => {
        githubRepositoryApi = {
            getContentJson: sinon.stub()
        };
        npmApi = {};
        repository = new Repository(githubRepositoryApi, npmApi);
    });

    it("createPackages works for a simple repository without special config", () => {
        let error404 = new Error("404");
        error404.code = 404;

        githubRepositoryApi.getContentJson.returns(Promise.reject(error404));

        return repository.createPackages()
        .then(packages => {
            expect(packages[0].path).to.equal("package.json");
        });
    });

    it("createPackages works for a repository with a special config", () => {
        let config = {
            paths: ["some/package.json", "other/package.json"]
        }

        githubRepositoryApi.getContentJson.returns(Promise.resolve(config));

        return repository.createPackages()
        .then(packages => {
            expect(packages[0].path).to.equal("some/package.json");
            expect(packages[1].path).to.equal("other/package.json");
        });
    });

    it("passes errors through", () => {
        let error = new Error("some error");

        githubRepositoryApi.getContentJson.returns(Promise.reject(error));

        return repository.createPackages()
        .then(expect.fail, err => {
            expect(err).to.equal(error);
        });
    });

    it("passes config through", () => {
        let config = {
            paths: ["some/package.json", "other/package.json"]
        }

        githubRepositoryApi.getContentJson.returns(Promise.resolve(config));

        return repository.createPackages()
        .then(packages => {
            expect(packages[0].config).to.deep.equal(config);
            expect(packages[1].config).to.deep.equal(config);
        });
    });

    it("passes npmApi through", () => {
        let config = {
            paths: ["some/package.json", "other/package.json"]
        }

        githubRepositoryApi.getContentJson.returns(Promise.resolve(config));

        return repository.createPackages()
        .then(packages => {
            expect(packages[0].npmApi).to.deep.equal(npmApi);
            expect(packages[1].npmApi).to.deep.equal(npmApi);
        });
    });
});