#! /usr/bin/env node

console.log('patch-release');
var shell = require('shelljs');

shell.exec('gulp clean && gulp build');
shell.exec('npm version patch');
shell.exec('git add -A . && git commit -a -m \'Update release\'');
shell.exec('git push origin master --force');
shell.exec('git push origin --tags');
