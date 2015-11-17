"use strict";

let Dependency = require("../lib/dependency");
let expect = require("chai").expect;
let sinon = require("sinon");

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

        it("uses provided version for outdated check, [current]", () => {
            npmApi.view.returns(Promise.resolve([{versions: ["0.0.1", "3.0.1"]}]));

            return dependency.checkForNewerVersion("~2.0.1", log)
            .then(d => {
                expect(d.latestVersion).to.equal("3.0.1");
                expect(d.outdated).to.equal(true);
            });
        });
    });
});