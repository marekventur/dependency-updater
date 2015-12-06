# dependency-updater

[![Build Status](https://travis-ci.org/marekventur/dependency-updater.svg)](https://travis-ci.org/marekventur/dependency-updater)
[![Dependency Status](https://david-dm.org/marekventur/dependency-updater.svg)](https://david-dm.org/marekventur/dependency-updater)
[![devDependency Status](https://david-dm.org/marekventur/dependency-updater/dev-status.svg)](https://david-dm.org/marekventur/dependency-updater#info=devDependencies)


A simple bash script that checks out a list of github repositories, checks their package.json and sends a PR for every minor or major version update available. Your build server will check whether everything is alright and all you have to do is merge green PRs. For added ease of use just set it up as a cron job or as a daily task on your build server.

Node 4.0.0 or more recent only, sorry.

<img src="http://i.imgur.com/qaxh5gx.png" alt="Screenshot of PR with changelog in Github">

```bash
$ npm install dependency-updater -g
$ dependency-updater --username my-github-user --password my-github-password myname/myrepository anothername/another-repository
```

# Usage
```
dependency-updater [options] repository1 [repository2 [repository3 [...]]]

Repositories are of the format "username/repository" or "organisation/repository".

Options:
--username      Github username. Can also be provided via GITHUB_USERNAME
--password      Github password. Can also be provided via GITHUB_PASSWORD
--token         Github oauth token. Can also be provided via GITHUB_TOKEN
--client-id     Github client id. Can also be provided via GITHUB_CLIENT_ID
--secret        Github secret. Can also be provided via GITHUB_SECRET
--logbook       A file to keep track of already opened pull requests. Defaults to ~/.dependency-updater-logbook.json
```

At least one of those credentials needs to be provided:
* username and password
* oauth token
* client id and secret

The easiest way to create an oauth token for yourself is via <a href="https://github.com/settings/tokens/new">https://github.com/settings/tokens/new</a>. You only need "repo" and "public_repo" permissions

# Multiple package.json per repository
In case you have a package with more than one ```package.json``` (or just one, but in a different location) you can add a file called ```.dependency-updater.json``` to the root of your repository:

```json
{
    "paths": ["folder/one/package.json", "folder/two/package.json"]
}
```

# Notes
If you want to clean up all "dependency-updater" branches you can use this command:
```bash
$ git branch -a | grep "dependency-updater" | cut -d / -f 3 | xargs -I BRANCH /bin/bash -c "git push origin --delete BRANCH"
```
