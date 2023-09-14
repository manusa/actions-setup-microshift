'use strict';

const {execSync} = require('./exec');

const kubeConfigPath = '/var/lib/microshift/resources/kubeadmin/kubeconfig';

const download = async ({version}) => {
  await execSync(
    `curl -LO https://github.com/openshift/microshift/releases/download/${version}/microshift-linux-amd64`
  );
  await execSync('sudo chmod a+x microshift-linux-amd64');
  await execSync('sudo mv microshift-linux-amd64 /usr/local/bin/microshift');
};

const configure = async ({baseDomain}) => {
  await execSync('sudo mkdir -p /etc/microshift');
  await execSync(`sudo sh -c 'cat > /etc/microshift/config.yaml' << EOF
    dns:
      baseDomain: ${baseDomain}
    cluster:
      domain: ${baseDomain}
  EOF`);
  // TODO: see if service can log to a file. Print log contents in case of failure
  await execSync(`sudo sh -c 'cat > /usr/lib/systemd/system/microshift.service' << EOF
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
};

const start = async () => {
  await execSync('sudo systemctl enable microshift.service --now');
  // Wait for MicroShift .kube/config file
  await execSync(
    `sudo bash -c 'SECONDS=0; until [ -s "${kubeConfigPath}" ] || (( SECONDS >= 30 )); do sleep 1; done'`
  );
  await execSync(`mkdir -p $HOME/.kube`);
  await execSync(`sudo cat ${kubeConfigPath} > ~/.kube/config`);
  // Wait for the Pods to be listed
  await execSync(
    "bash -c 'SECONDS=0; until kubectl get pods -A 2>/dev/null | grep kube-system || (( SECONDS >= 90 )); do sleep 1; done'"
  );
  await execSync(
    'kubectl wait --for=condition=ready --timeout=30s nodes --all'
  );
  await execSync(`kubectl get nodes`);
  await execSync(
    'kubectl wait --for=condition=ready --timeout=120s pods --all -A'
  );
};

module.exports = {download, configure, start};
