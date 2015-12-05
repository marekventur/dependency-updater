"use strict";

let PullRequest = require("../lib/pull_request");
let Logbook = require("../lib/memory_logbook");
let expect = require("chai").expect;
let sinon = require("sinon");

describe("Pull Request", () => {
    let pullRequest, githubRepositoryApi, dependency, logbook, packageJson, updatedDependencyContent, logger, headSha;

    beforeEach(() => {
        headSha = "abcdef"

        githubRepositoryApi = {
            repositoryName: "reponame",
            getReference: sinon.stub().returns(Promise.resolve({ object: {sha: headSha}})),
            createReference: sinon.stub().returns(Promise.resolve()),
            updateFile: sinon.stub().returns(Promise.resolve()),
            pullRequestCreate: sinon.stub().returns(Promise.resolve({ number: 4 }))
        };

        updatedDependencyContent = "{\"FOO\":\"BAR\"}";

        packageJson = {
            createVersionWithUpdatedDependency: sinon.stub().returns(updatedDependencyContent)
        };

        dependency = {
            name: "foo",
            suggestedVersion: "~1.2.3",
            type: "dependency",
            packageJson
        };

        logbook = new Logbook();

        pullRequest = new PullRequest(githubRepositoryApi, dependency);

        logger = {
            info: sinon.stub()
        };
    });

    it("uses retrieved head sha", () => {
        return pullRequest.open(logger, logbook)
        .then(() => {
            expect(githubRepositoryApi.createReference.args[0][0].sha).to.equal(headSha);
        });
    });

    it("updates file", () => {
        return pullRequest.open(logger, logbook)
        .then(() => {
            let contentBase64 = githubRepositoryApi.updateFile.args[0][0].content;
            expect(new Buffer(contentBase64, "base64").toString("utf8")).to.equal(updatedDependencyContent);
        });
    });

    it("opens a PR with correct title", () => {
        return pullRequest.open(logger, logbook)
        .then(() => {
            expect(githubRepositoryApi.pullRequestCreate.args[0][0].title).to.equal("Update \"foo\" to version ~1.2.3");
        });
    });

    it("stores update to logbook", () => {
        return pullRequest.open(logger, logbook)
        .then(() => {
            expect(logbook.get("reponame", "foo")).to.equal("~1.2.3");
        });
    });

});