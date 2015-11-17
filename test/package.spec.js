"use strict";

let Package = require("../lib/package");
let expect = require("chai").expect;
let sinon = require("sinon");
let _ = require("underscore");

describe("Package", () => {
    let p, githubRepositoryApi, packageJson, type, name, version;

    beforeEach(() => {
        githubRepositoryApi = {
            getContentJson: sinon.stub()
        };
        p = new Package(githubRepositoryApi, packageJson, type, name, version);
    });

    context("#createDependencies", () => {
        it("returns all dependencies", () => {
            let config = {
                dependencies: {
                    "foo": "0.1.1",
                    "bar": "0.2.2"
                },
                devDependencies: {
                    "baz": "1.0.0"
                },
                peerDependencies: {
                    "foobar": "0.0.1"
                }
            }

            let sha = "abcdef";

            githubRepositoryApi.getContentJson.returns(Promise.resolve({ content: config, sha }));

            return p.createDependencies()
            .then(dependencies => {
                expect(dependencies.length).to.equal(4);
                expect(_.findWhere(dependencies, {name: "foo"}).version).to.contain("0.1.1");
                expect(_.findWhere(dependencies, {name: "bar"}).version).to.contain("0.2.2");
                expect(_.findWhere(dependencies, {name: "baz"}).version).to.contain("1.0.0");
                expect(_.findWhere(dependencies, {name: "foobar"}).version).to.contain("0.0.1");
            });
        });

        it("allows empty or missing dependencies", () => {
            githubRepositoryApi.getContentJson.returns(Promise.resolve({ content: {dependencies: {}}, sha: "abcdef" }));

            return p.createDependencies()
            .then(dependencies => {
                expect(dependencies).to.deep.equal([]);
            });
        });
    });

    context("#createVersionWithUpdatedDependency", () => {
        beforeEach(() => {
            p.content = {
                name: "test",
                peerDependencies: {
                    "foo": "1.2.3",
                    "bar": "0.0.1"
                }
            }
        });

        it("updates correctly", () => {
            let output = p.createVersionWithUpdatedDependency("peerDependencies", "foo", "2.3.4");
            expect(JSON.parse(output).peerDependencies.foo).to.equal("2.3.4");
        });

        it("keeps rest", () => {
            let output = p.createVersionWithUpdatedDependency("peerDependencies", "foo", "2.3.4");
            expect(JSON.parse(output).name).to.equal("test");
            expect(JSON.parse(output).peerDependencies.bar).to.equal("0.0.1");
        });

        it("keeps 'content' untouched", () => {
            p.createVersionWithUpdatedDependency("peerDependencies", "foo", "2.3.4");
            expect(p.content.peerDependencies.foo).to.equal("1.2.3");
        });
    });
});