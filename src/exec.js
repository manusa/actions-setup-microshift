'use strict';

const child_process = require('child_process');

const execSync = command => child_process.execSync(command);

const logExecSync = command => {
  console.log(`$ ${command}`);
  child_process.execSync(command, {
    stdio: 'inherit'
  });
};

module.exports = {execSync, logExecSync};
