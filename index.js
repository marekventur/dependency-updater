#!/usr/bin/env node
"use strict";

/*eslint-disable no-console*/

let path = require("path");
let _ = require("underscore");

let yargs = require("yargs")
    .usage(
        "Usage: dependency-updater [options] repository1 [repository2] [...]"+
        "\n\n" +
        "Repositories are of the format \"username/repository\" or \"organisation/repository\"."
    )
    .strict()
    .describe("username", "Github username. Can also be provided via GITHUB_USERNAME")
    .describe("password", "Github password. Can also be provided via GITHUB_PASSWORD")
    .describe("token", "Github oauth token. Can also be provided via GITHUB_TOKEN")
    .describe("client-id", "Github client id. Can also be provided via GITHUB_CLIENT_ID")
    .describe("secret", "Github secret. Can also be provided via GITHUB_SECRET")
    .describe("logbook", "A file to keep track of already opened pull requests. Defaults to ~/.dependency-updater-logbook.json")
    .requiresArg(["username", "password", "oauth-token", "client-id", "secret", "logbook"])
    .demand(1);

let argv = _.defaults(yargs.argv, {
    username: process.env.GITHUB_USERNAME,
    password: process.env.GITHUB_PASSWORD,
    token: process.env.GITHUB_TOKEN,
    "client-id": process.env.GITHUB_CLIENT_ID,
    secret: process.env.GITHUB_SECRET,
    logbook: path.join(process.env.HOME || process.env.USERPROFILE, ".dependency-updater-logbook.json")
});

// Determine method of authentication
let githubAuth = {};
if (argv.token) {
    githubAuth.type = "oauth";
    githubAuth.token = argv.token;
} else if (argv["client-id"] && argv.secret) {
    githubAuth.type = "oauth";
    githubAuth.key = argv["client-id"];
    githubAuth.secret = argv.secret;
} else if(argv.username && argv.password) {
    githubAuth.type = "basic";
    githubAuth.username = argv.username;
    githubAuth.password = argv.password;
} else {
    console.error("ERROR: Please provide at least one method of authentication:");
    console.error("- username and password");
    console.error("- oauth token");
    console.error("- client id and secret");
    process.exit(1);
}

// Process
let Logbook = require("./lib/logbook");
let processRepository = require("./lib/process_repository");
let GithubRepositoryApi = require("./lib/github_repository_api");
let NpmApi = require("./lib/npm_api");
let PullRequest = require("./lib/pull_request");
let logger = console;

let logbook = new Logbook(argv.logbook);

logbook.load()
.then(() => {
    return Promise.all(
        argv._.map(repositoryName => {
            let githubRepositoryApi = new GithubRepositoryApi(githubAuth, repositoryName);
            let npmApi = new NpmApi();
            return processRepository(repositoryName, githubAuth, logbook, logger, githubRepositoryApi, npmApi, PullRequest);
        })
    )
})
.then(() => logbook.save(), err => { logbook.save(); throw err; })
.catch(err => {
    console.error("ERROR:");
    console.error(err.stack || err);
    process.exit(1);
});

/*eslint-enable no-console*/
