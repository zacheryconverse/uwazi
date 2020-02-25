<!-- @format -->
<!-- markdownlint-disable-file commands-show-output -->

# Uwazi

![Uwazi Logo](https://www.uwazi.io/wp-content/uploads/2017/09/cropped-uwazi-color-logo-300x68.png)

[![devDependency Status](https://david-dm.org/huridocs/uwazidocs/dev-status.svg)](https://david-dm.org/huridocs/uwazi#info=devDependencies)
[![dependency Status](https://david-dm.org/huridocs/uwazidocs/status.svg)](https://david-dm.org/huridocs/uwazi#info=dependencies)
[![CircleCI](https://circleci.com/gh/huridocs/uwazi.svg?style=shield)](https://circleci.com/gh/huridocs/uwazi)
[![Maintainability](https://api.codeclimate.com/v1/badges/8c98a251ca64daf434f2/maintainability)](https://codeclimate.com/github/huridocs/uwazi/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/8c98a251ca64daf434f2/test_coverage)](https://codeclimate.com/github/huridocs/uwazi/test_coverage)

There are important stories within your documents. Uwazi helps you tell them. Uwazi is a free, open-source solution for organizing, analyzing and publishing your documents.

[Uwazi](https://www.uwazi.io/) | [HURIDOCS](https://huridocs.org/)

Read the [user guide](https://github.com/huridocs/uwazi/wiki)

## Installation guide

- [Dependencies](#dependencies)
- [Production](#production)
  - [Production Configuration](#production-configuration-advanced)
  - [Production Build](#production-build)
  - [Initial State](#initial-state)
  - [Production Run](#production-run)
  - [Upgrading Uwazi](#upgrading-uwazi-migrations)
- [Development](#development)
  - [Development Run](#development-run)
  - [Testing](#testing)
    - [Unit and Integration tests](#unit-and-integration-tests)
    - [End to End (e2e)](#end-to-end-e2e)
- [Docker](#docker)

## Dependencies

- **NodeJs 10.17.x** For ease of update, use nvm: <https://github.com/creationix/nvm>
- **ElasticSearch 7.4.1** <https://www.elastic.co/guide/en/elasticsearch/reference/7.4/install-elasticsearch.html> Please note that ElasticSearch requires java.
  Probably need to disable ml module in the elastic search config file:
  `xpack.ml.enabled: false`
- **MongoDB 4.0.3** instructions on how to [upgrade here](https://docs.mongodb.com/manual/release-notes/4.0-upgrade-standalone/)
- **Yarn** <https://yarnpkg.com/en/docs/install>
- **pdftotext (Poppler)** tested to work on version 0.26 but its recommended to use the latest available for your platform <https://poppler.freedesktop.org/.> Make sure to **install libjpeg-dev** if you build from source.

Before anything else you will need to install the application dependencies.
We also recommend changing some global settings:

```bash
$ npm config set scripts-prepend-node-path auto
```

If you want to use the latest development code:

```bash
$ git clone https://github.com/huridocs/uwazi.git
$ cd uwazi
$ yarn install
```

If you just want to only use the latest stable release (recommended for production):

```bash
$ git clone -b master --single-branch https://github.com/huridocs/uwazi.git
$ cd uwazi
$ yarn install
```

There may be an issue with pngquant not running correctly. If you encounter this issue, you are probably missing library **libpng-dev**. Please run:

```bash
$ sudo rm -rf node_modules
$ sudo apt-get install libpng-dev
$ yarn install
```

## Production

### Production Build

```bash
$ yarn production-build
```

The first time you run Uwazi, you will need to initialize the database with its default blank values. Do no run this command for existing projects, as this will erase the entire database. Note that from this point you need ElasticSearch and MongoDB running.

```bash
$ yarn blank-state
```

Then start the server by typing:

```bash
$ yarn run-production
```

By default, Uwazi runs on localhost on the port 3000. So point your browser to <http://localhost:3000> and authenticate yourself with the default username "admin" and password "change this password now".

Check out the user guide for [more configuration options](https://github.com/huridocs/uwazi/wiki/Install-Uwazi-on-your-server).

### Upgrading Uwazi and data migrations

Updating Uwazi is pretty straight forward using git:

```bash
$ cd uwazi
$ git pull
$ yarn install
$ yarn migrate
$ yarn production-build
$ yarn run-production
```

- If you are not using git, just download and overwrite the code in the Uwazi directory.
- 'yarn install' will automatically add, remove or replace any changes in module dependencies.
- 'yarn migrate' will track your last data version and, if needed, run a script over your data to modify it so that is up to date with your Uwazi version.

### Environment Variables

Uwazi supports the following environment variables to customize its deployment
(`.env` is supported but not stored in the repository):

- `DBHOST`: MongoDB hostname (default: `localhost`)
- `DATABASE_NAME`: MongoDB instance name (default: `uwazi_development`)
- `INDEX_NAME`: Elastic search index name (default: `DATABASE_NAME`)
- `ELASTICSEARCH_URL`: ElasticSearch connection URL (default: `http://localhost:9200`)
- `UPLOADS_FOLDER`: Folder on local filesystem where uploaded PDF and other files are written to (_TODO temporarily or permanently?_)

## Development

### Development Process

The following git hooks are set up to ensure the code that's pushed is good to go:

#### Pre-Commit

Fast checks go here.

- Develop on a branch other than `Master`.
- No merge conflict artifacts exist in touched files.

#### Pre-Push

Slower checks that are still useful go here.

- All objects declared in TypeScript (`.ts`) files should have types assigned to them.
- Prettier and ESLint checks should pass
- All unit tests should pass

### Development Run

```bash
$ yarn hot
```

This will launch a webpack server and nodemon app server for hot reloading any changes you make.

### Testing

#### Unit and Integration tests

We test using the JEST framework (built on top of Jasmine). To run the unit and integration tests, execute

```bash
$ yarn test
```

This will run the entire test suite, both on server and client apps.

If the api tests timeout, the issue might be with mongodb-memory-server. See https://github.com/nodkz/mongodb-memory-server/issues/204. Memory server explicitly depends on a version of MongoDB that depends on libcurl3, but Debian 10 and other OS's come with libcurl4 installed instead.

To fix this, update node_modules/mongodb-memory-server-core/lib/util/MongoBinary.js#70.
Set `exports.LATEST_VERSION = '4.3.3'` or a similar new version.

#### End to End (e2e)

For End-to-End testing, we have a full set of fixtures that test the overall functionality. Be advised that, for the time being, these tests are run ON THE SAME DATABASE as the default database (uwazi_development), so running these tests will DELETE any existing data and replace it with the testing fixtures. DO NOT RUN ON PRODUCTION ENVIRONMENTS!

Running end to end tests require a running Uwazi app.

```bash
$ yarn hot
```

On a different console tab, run

```bash
$ yarn e2e
```

Note that if you already have an instance running, this will likely throw an error of ports already been used. Only one instance of Uwazi may be run in a the same port at the same time.

E2E Tests depend on electron. If something appears to not be working, please run `node_modules/electron/dist/electron --help` to check for problems.

### Default login

The application's default log in is admin / change this password now

Note the subtle nudge ;)

## Docker

<https://github.com/fititnt/uwazi-docker> is a project with a Docker containerized version of Uwazi.
