# cenv

[![Build Status](https://travis-ci.org/rodrigogs/cenv.svg?branch=master)](https://travis-ci.org/rodrigogs/cenv)
[![Code Climate](https://codeclimate.com/github/rodrigogs/cenv/badges/gpa.svg)](https://codeclimate.com/github/rodrigogs/cenv)
[![Test Coverage](https://codeclimate.com/github/rodrigogs/cenv/badges/coverage.svg)](https://codeclimate.com/github/rodrigogs/cenv/coverage)
[![Dependency Status](https://david-dm.org/rodrigogs/cenv/status.svg)](https://david-dm.org/rodrigogs/cenv#info=dependencies)
[![devDependency Status](https://david-dm.org/rodrigogs/cenv/dev-status.svg)](https://david-dm.org/rodrigogs/cenv#info=devDependencies)
[![npm](https://img.shields.io/npm/dt/cenv.svg)](https://www.npmjs.com/package/cenv)
[![npm version](https://badge.fury.io/js/cenv.svg)](https://badge.fury.io/js/cenv)

Load environment variables from the cloud, using the [cenv-registry](https://github.com/rodrigogs/cenv-registry). cenv may be used as a cli tool from a terminal to load an [environment](https://en.wikipedia.org/wiki/Environment_variable) against a command, or as a library in your [Node.js](nodejs.org) application to load your environment dynamically.

Install
-------
> ```$ npm install cenv```

Usage
-----
```
  Usage: cenv [options] <environment> <command...>


  Options:

    -V, --version                  output the version number
    -f, --file [file_path]         Config file path
    -r, --registry [registry_url]  Registry url
    -u, --username [username]      Registry username
    -p, --password [password]      Registry password
    -t, --token [token]            Registry authenticated token
    -o, --timeout [timeout]        Registry connection timeout
    -h, --help                     output usage information
```

#### Registry
---
**cenv** depends on it's [registry](https://github.com/rodrigogs/cenv-registry) to work. You can download and configure your own registry following the instructions in **[this](https://github.com/rodrigogs/cenv-registry)** repository.


#### Arguments
---
* ***environment** - Environment to retrieve from the registry
* ***command** - Command that will be executed after the environment is loaded


#### Options
---
* **-V, --version** - Output the version number
* **-f, --file [file_path]** - Sets the config file path
  - Defaults to **.cenv**
  - Use **false** as the file path to disable loading config from file
* **-r, --registry [registry_url]** - Sets the cenv-registry url
* **-u, --username [username]** - Sets registry username
* **-p, --password [password]** - Sets registry password
* **-t, --token [token]** - Sets registry authenticated token
* **-o, --timeout [timeout]** - Sets registry request timeout in milliseconds
  - Defaults to **1000**
* **-h, --help [timeout]** - Output usage information

Examples
--------
![Usage](https://github.com/rodrigogs/cenv/blob/master/media/usage.gif)

License
-------
[Licence](https://github.com/rodrigogs/cenv/blob/master/LICENSE) © Rodrigo Gomes da Silva
