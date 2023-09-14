'use strict';

const {execSync} = require('./exec');

const installCrio = async ({version}) => {
  await execSync(
    `curl https://raw.githubusercontent.com/cri-o/cri-o/${version}/scripts/get | sudo bash`
  );
  await execSync('sudo systemctl enable crio --now');
  // Show crictl debug info
  return execSync('sudo crictl version');
};

module.exports = {installCrio};
