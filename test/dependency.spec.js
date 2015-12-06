"use strict";

let Dependency = require("../lib/dependency");
let expect = require("chai").expect;
let sinon = require("sinon");
let _ = require("underscore");

describe("Dependency", () => {
    let dependency, githubRepositoryApi, npmApi, packageJson, type, name, version;

    beforeEach(() => {
        githubRepositoryApi = {
            getContentJson: sinon.stub()
        };

        npmApi = {
            view: sinon.stub()
        };

        packageJson = {};

        type = "dependency";

        name = "foo";

        version = "~1.0.1";

        dependency = new Dependency(githubRepositoryApi, npmApi, packageJson, type, name, version);
    });

    context("#checkForNewerVersion", () => {
        let log;

        beforeEach(() => {
            log = { info: sinon.spy() };
        });

        it("fetches the current version [outdated]", () => {
            npmApi.view.returns(Promise.resolve([{versions: ["0.0.1", "2.0.0"]}]));

            return dependency.checkForNewerVersion(null, log)
            .then(d => {
                expect(d.latestVersion).to.equal("2.0.0");
                expect(d.outdated).to.equal(true);
            });
        });

        it("fetches the current version [current]", () => {
            npmApi.view.returns(Promise.resolve([{versions: ["0.0.1", "1.0.1"]}]));

            return dependency.checkForNewerVersion(null, log)
            .then(d => {
                expect(d.latestVersion).to.equal("1.0.1");
                expect(d.outdated).to.equal(false);
            });
        });

        it("fetches the current version [matched by semver]", () => {
            npmApi.view.returns(Promise.resolve([{versions: ["0.0.1", "1.0.5"]}]));

            return dependency.checkForNewerVersion(null, log)
            .then(d => {
                expect(d.latestVersion).to.equal("1.0.5");
                expect(d.outdated).to.equal(false);
            });
        });

        it("uses provided version for outdated check [outdated]", () => {
            npmApi.view.returns(Promise.resolve([{versions: ["0.0.1", "2.0.1"]}]));

            return dependency.checkForNewerVersion("~2.0.1", log)
            .then(d => {
                expect(d.latestVersion).to.equal("2.0.1");
                expect(d.outdated).to.equal(false);
            });
        });

        it("ignores alpha, beta and pre-releases", () => {
            npmApi.view.returns(Promise.resolve([{versions: ["0.0.1", "2.0.1", "3.0.0-pre", "3.0.0-alpha", "3.0.0-beta"]}]));

            return dependency.checkForNewerVersion("~2.0.1", log)
            .then(d => {
                expect(d.latestVersion).to.equal("2.0.1");
                expect(d.outdated).to.equal(false);
            });
        });

        it("keeps ~ when suggesting new version", () => {
            npmApi.view.returns(Promise.resolve([{versions: ["0.0.1", "2.0.1"]}]));

            return dependency.checkForNewerVersion(null, log)
            .then(d => {
                expect(d.suggestedVersion).to.equal("~2.0.1");
                expect(d.outdated).to.equal(true);
            });
        });

        it("uses provided version for outdated check, [current]", () => {
            npmApi.view.returns(Promise.resolve([{versions: ["0.0.1", "3.0.1"]}]));

            return dependency.checkForNewerVersion("~2.0.1", log)
            .then(d => {
                expect(d.latestVersion).to.equal("3.0.1");
                expect(d.outdated).to.equal(true);
            });
        });

        it("never update packages that have a slash in the name", () => {
            dependency = new Dependency(githubRepositoryApi, npmApi, packageJson, type, name, "foo/bar");

            return dependency.checkForNewerVersion(null, log)
            .then(d => {
                expect(d.outdated).to.equal(false);
            });
        });
    });

    context("changelog", () => {
        let changelog, changelogAsJson, changelogAsMarkdown;

        beforeEach(() => {
            npmApi.view.returns(Promise.resolve([{versions: ["0.0.1", "2.0.0"]}]));

            changelogAsJson = {
                "something": "here",
                "versions": [
                    { version: "0.0.1"},
                    { version: "1.0.1"},
                    { version: "1.0.2"},
                    { version: "1.2.0"},
                    { version: "1.2.1"},
                    { version: "2.0.0"}
                ]
            };
            changelogAsMarkdown = "FOOBAR";

            changelog = {
                generate: sinon.stub().withArgs("foo").returns(Promise.resolve(changelogAsJson)),
                markdown: sinon.stub().returns(changelogAsMarkdown)
            }
        });

        it("returns the correct markdown", () => {
            return dependency.generateChangelog(changelog)
            .then(markdown => {
                expect(markdown).to.equal(changelogAsMarkdown);
            })
        });

        it("filters irrelevant versions out", () => {
            return dependency.generateChangelog(changelog)
            .then(() => {
                expect(_.pluck(changelog.markdown.args[0][0].versions, "version")).to.deep.equal(["1.2.0", "1.2.1", "2.0.0"]);
            })
        });
    })
});