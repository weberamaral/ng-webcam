#! /usr/bin/env node

console.log('patch-release');
var shell = require('shelljs');

shell.exec('git add -A . && git commit -a -m \'Update release\'');