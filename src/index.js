'use strict';

const core = require('@actions/core');
const {installUbuntuPackages, installCrio} = require('./configure-environment');
const {download, configure, start} = require('./microshift');

const crioVersion = 'v1.22.5'; // latter versions won't work
const microShiftVersion = '4.8.0-0.microshift-2022-04-20-182108'; // latest binary available on GitHub
const baseDomain = '127.0.0.1.nip.io';

const indent = (bufferOrString, spaces = 4) => {
  const prefix = ' '.repeat(spaces);
  return bufferOrString
    .toString()
    .trim()
    .split('\n')
    .reduce((acc, l) => {
      acc += `${prefix}${l}\n`;
      return acc;
    }, '');
};

const run = async () => {
  core.info('MicroShift Installer');

  console.log(' ▪ Installing required packages');
  await installUbuntuPackages();

  console.log(' ▪ Installing CRI-O');
  const crioInfo = await installCrio({version: crioVersion});
  console.log(indent(crioInfo));

  console.log(' ▪ Downloading MicroShift');
  await download({version: microShiftVersion});

  console.log(' ▪ Configuring MicroShift');
  await configure({baseDomain});

  console.log(' ▪ Starting MicroShift...');
  await start();
  console.log(' ▪ MicroShift ready!');
  console.log(indent(`Base domain for routes: ${baseDomain}`));
};

run()
  .then(() => {
    console.log('Process completed!');
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
