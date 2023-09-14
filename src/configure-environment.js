'use strict';

const {execSync} = require('./exec');

const installUbuntuPackages = async () => {
  await execSync('sudo apt update -y');
  await execSync(
    'sudo apt-get install -y' + // Install packaged dependencies
      ' conntrack' + // needed by cri-o / containers
      ' jq' // needed by cri-o install script
  );
};

const installCrio = async ({version}) => {
  await execSync(
    `curl https://raw.githubusercontent.com/cri-o/cri-o/${version}/scripts/get | sudo bash`
  );
  await execSync('sudo systemctl enable crio --now');
  // Show crictl debug info
  return execSync('sudo crictl version');
};

module.exports = {installCrio, installUbuntuPackages};
