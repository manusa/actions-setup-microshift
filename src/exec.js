'use strict';

const child_process = require('child_process');
const fs = require('fs');

const execSync = async command => {
  const fileName = 'temp.log.txt';
  const stream = fs.createWriteStream(fileName, {flags: 'w'});
  return new Promise((resolve, reject) => {
    stream.on('open', () => {
      try {
        child_process.execSync(command, {
          stdio: ['ignore', stream, stream]
        });
        stream.end();
        resolve(fs.readFileSync(fileName));
      } catch (e) {
        reject(e);
      }
      fs.unlinkSync(fileName);
    });
  });
};

const spawnSync = command => child_process.spawnSync(command);

const logExecSync = command => {
  console.log(`$ ${command}`);
  child_process.execSync(command, {
    stdio: 'inherit'
  });
};

module.exports = {execSync, logExecSync, spawnSync};
