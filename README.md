Setup MicroShift GitHub Action
==============================
[<img src="https://github.com/manusa/actions-setup-microshift/actions/workflows/runner.yml/badge.svg"/>](https://github.com/manusa/actions-setup-microshift/actions/workflows/runner.yml)

Sets up a MicroShift 4.8 cluster in a GitHub Actions workflow job.

TODO: Support for BuildConfig (via hack)

## Usage

```yaml
name: Example workflow

on: [push]

jobs:
  example:
    name: Example Minikube-Kubernetes Cluster interaction
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      - name: Setup Minikube
        uses: manusa/actions-setup-microshift@v0.0.0
      - name: Interact with the cluster
        run: kubectl get nodes
```

## Why is only 4.8 supported?

- https://github.com/openshift/microshift/issues/1206
- https://issues.redhat.com/browse/USHIFT-395
- https://issues.redhat.com//browse/USHIFT-599
- Requirements for [OVN-Kubernetes](https://github.com/ovn-org/ovn-kubernetes/) network (can't be easily installed on Ubuntu)


## License

The scripts and documentation in this project are released under the [Apache 2.0](./LICENSE) license.
