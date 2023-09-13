'use strict';

const core = require('@actions/core');
const {logExecSync} = require('./exec');

const crioVersion = 'v1.22.5'; // latter versions won't work
const microShiftVersion = '4.8.0-0.microshift-2022-04-20-182108'; // latest binary available on GitHub
const kubeConfigPath = '/var/lib/microshift/resources/kubeadmin/kubeconfig';

const run = async () => {
  core.info('Updating Environment configuration to support MicroShift');
  logExecSync('sudo apt update -y');
  logExecSync(
    'sudo apt-get install -y' + // Install packaged dependencies
      ' conntrack' + // needed by cri-o / containers
      ' jq' // needed by cri-o install script
  );

  logExecSync(
    `curl https://raw.githubusercontent.com/cri-o/cri-o/${crioVersion}/scripts/get | sudo bash`
  );
  logExecSync('sudo systemctl enable crio --now');
  // Show crictl debug info
  logExecSync('sudo crictl version');

  logExecSync(
    `curl -LO https://github.com/openshift/microshift/releases/download/${microShiftVersion}/microshift-linux-amd64`
  );
  logExecSync('sudo chmod a+x microshift-linux-amd64');
  logExecSync('sudo mv microshift-linux-amd64 /usr/local/bin/microshift');

  logExecSync(`sudo sh -c 'cat > /usr/lib/systemd/system/microshift.service' << EOF
    [Unit]
    Description=MicroShift
    After=crio.service
    
    [Service]
    WorkingDirectory=/usr/local/bin/
    ExecStart=/usr/local/bin/microshift run
    Restart=always
    User=root
    
    [Install]
    WantedBy=multi-user.target
  EOF`);
  logExecSync('sudo systemctl enable microshift.service --now');
  // TODO: see if service can log to a file. Print log contents in case of failure

  core.info('Waiting for MicroShift service to start');
  logExecSync('systemctl --no-pager status microshift.service');

  // Wait for MicroShift .kube/config file
  logExecSync(
    `sudo bash -c 'SECONDS=0; until [ -s "${kubeConfigPath}" ] || (( SECONDS >= 30 )); do sleep 1; done'`
  );
  logExecSync(`mkdir -p $HOME/.kube`);
  logExecSync(`sudo cat ${kubeConfigPath} > ~/.kube/config`);

  core.info('Waiting for MicroShift to be ready');
  // Wait for the Pods to be listed
  logExecSync(
    "bash -c 'SECONDS=0; until kubectl get pods -A | grep kube-system || (( SECONDS >= 90 )); do sleep 1; done'"
  );
  logExecSync('kubectl wait --for=condition=ready --timeout=30s nodes --all');
  logExecSync(`kubectl get nodes`);
  logExecSync('kubectl wait --for=condition=ready --timeout=120s pods --all -A');
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
