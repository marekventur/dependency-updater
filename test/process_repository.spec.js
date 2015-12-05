"use strict";

let expect = require("chai").expect;
let MemoryLogbook = require("../lib/memory_logbook");
let PullRequest = require("../lib/pull_request");
let processRepository = require("../lib/process_repository");
let sinon = require("sinon");

class FakePassingPullRequest extends PullRequest {
    open() {
        return Promise.resolve(this);
    }
}

describe("processRepository", () => {
    let repositoryName, githubAuth, logbook, logger, githubRepositoryApi, npmApi, depedencyUpdaterConfig;

    beforeEach(() => {
        repositoryName = "user/repo";
        githubAuth = {};
        logbook = new MemoryLogbook;
        logger = {info: () => {}};
        githubRepositoryApi = {
            getContentJson: sinon.stub()
        };

        depedencyUpdaterConfig = {};
        githubRepositoryApi.getContentJson.withArgs({path: ".dependency-updater.json"}).returns(Promise.resolve({content: depedencyUpdaterConfig}));


        npmApi = {
            load: sinon.stub().returns(Promise.resolve()),
            view: sinon.stub()
        };

        let npmViewResponse = {
            "1.2.3": {
                "versions": ["0.0.1", "1.2.3", "2.0.0"]
            }
        };

        npmApi.view.withArgs(["foo"]).returns(Promise.resolve(npmViewResponse));
    });

    context("with one package.json", () => {
        let packageJson;

        beforeEach(() => {
            packageJson = {
                "dependencies": {
                    "foo": "1.2.3"
                }
            };

            githubRepositoryApi.getContentJson.withArgs({path: "package.json"}).returns(Promise.resolve({sha: "abc", content: packageJson}));
        });

        it("loads npm", () => {
            return processRepository(repositoryName, githubAuth, logbook, logger, githubRepositoryApi, npmApi, FakePassingPullRequest)
            .then(() => {
                expect(npmApi.load.callCount).to.equal(1);
            });
        });

        it("opens a PR when version is outdated", () => {
            return processRepository(repositoryName, githubAuth, logbook, logger, githubRepositoryApi, npmApi, FakePassingPullRequest)
            .then(pullRequests => {
                expect(pullRequests.length).to.equal(1);
                expect(pullRequests[0].dependency.name).to.equal("foo");
                expect(pullRequests[0].dependency.suggestedVersion).to.equal("2.0.0");
            });
        });

        it("avoids opening a PR when logbook indicates that this has already been done", () => {
            logbook.set(repositoryName, "foo", "2.0.0");
            return processRepository(repositoryName, githubAuth, logbook, logger, githubRepositoryApi, npmApi, FakePassingPullRequest)
            .then(pullRequests => {
                expect(pullRequests.length).to.equal(0);
            });
        });
    });

    context("handles multiple package.jsons", () => {
        let packageOneJson, packageTwoJson;

        beforeEach(() => {
            packageOneJson = {
                "dependencies": {
                    "foo": "1.2.3"
                }
            };

            packageTwoJson = {
                "dependencies": {
                    "foo": "0.0.1"
                }
            };

            depedencyUpdaterConfig.paths = ["one/package.json", "two/package.json"];

            githubRepositoryApi.getContentJson.withArgs({path: "one/package.json"}).returns(Promise.resolve({sha: "abc", content: packageOneJson}));
            githubRepositoryApi.getContentJson.withArgs({path: "two/package.json"}).returns(Promise.resolve({sha: "abc", content: packageTwoJson}));
        });

        it("creates separate PRs", () => {
            return processRepository(repositoryName, githubAuth, logbook, logger, githubRepositoryApi, npmApi, FakePassingPullRequest)
            .then(pullRequests => {
                expect(pullRequests.length).to.equal(2);

                expect(pullRequests[0].dependency.name).to.equal("foo");
                expect(pullRequests[0].dependency.packageJson.path).to.equal("one/package.json");
                expect(pullRequests[0].dependency.suggestedVersion).to.equal("2.0.0");

                expect(pullRequests[1].dependency.name).to.equal("foo");
                expect(pullRequests[1].dependency.packageJson.path).to.equal("two/package.json");
                expect(pullRequests[1].dependency.suggestedVersion).to.equal("2.0.0");
            });
        });
    });
});