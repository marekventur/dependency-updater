# dependency-updater

A simple bash script that checks out a list of github repositories, checks their package.json and sends a PR for every minor or major version update available. Your build server will check whether everything is alright and all you have to do is merge green PRs. For added ease of use just set it up as a cron job or as a daily task on your build server.

Node 4.0.0 or more recent only, sorry.

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