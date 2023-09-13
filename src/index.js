'use strict';

const core = require('@actions/core');
const logExecSync = require('./exec').logExecSync;

const run = async () => {
  core.info('Updating Environment configuration to support MicroShift');
  logExecSync('sudo apt update -y');
  logExecSync(
    'sudo apt-get install -y' + // Install packaged dependencies
      ' conntrack' + // needed by cri-o / containers
      ' jq' // needed by cri-o install script
  );
  logExecSync(
    'curl https://raw.githubusercontent.com/cri-o/cri-o/v1.28.1/scripts/get | sudo bash'
  );
  logExecSync('sudo systemctl enable crio --now');
  logExecSync(
    'curl -LO https://github.com/openshift/microshift/releases/download/4.8.0-0.microshift-2022-04-20-182108/microshift-linux-amd64'
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

  core.info('Waiting for MicroShift service to start');
  logExecSync('systemctl --no-pager status microshift.service');
  // Should report (TODO: add check):
  // ● microshift.service - MicroShift
  //   Loaded: loaded (/lib/systemd/system/microshift.service; enabled; vendor preset: enabled)
  //   Active: active (running) since Wed 2023-09-13 11:10:01 UTC; 21ms ago
  //   Main PID: 2900 (microshift)
  //   Tasks: 6 (limit: 8300)
  //   Memory: 2.9M
  //   CPU: 7ms
  //   CGroup: /system.slice/microshift.service
  //              └─2900 /usr/local/bin/microshift run

  const kubeConfigPath = '/var/lib/microshift/resources/kubeadmin/kubeconfig';
  // Wait for MicroShift .kube/config file
  logExecSync(
    `sudo bash -c 'SECONDS=0; until [ -s "${kubeConfigPath}" ] || (( SECONDS >= 30 )); do sleep 1; done'`
  );
  logExecSync(`mkdir -p $HOME/.kube`);
  logExecSync(`sudo cp -f ${kubeConfigPath} $HOME/.kube/config`);
  logExecSync(`sudo chmod a+rw /home/runner/.kube/config`);

  core.info('Waiting for MicroShift to be ready');
  // Wait for the Pods to be listed

  logExecSync(
    "bash -c 'SECONDS=0; until kubectl get pods -A | grep kube-system || (( SECONDS >= 720 )); do sleep 1; done'"
  );
  logExecSync(`kubectl get nodes`);
  logExecSync(`kubectl get pods -A`);
  logExecSync(
    'kubectl wait --for=condition=ready --timeout=240s pods --all -n kube-system'
  );
  logExecSync(`kubectl get pods -A`);
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
