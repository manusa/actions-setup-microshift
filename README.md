Setup MicroShift GitHub Action
==============================
[<img src="https://github.com/manusa/actions-setup-microshift/actions/workflows/runner.yml/badge.svg"/>](https://github.com/manusa/actions-setup-microshift/actions/workflows/runner.yml)

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

## License

The scripts and documentation in this project are released under the [Apache 2.0](./LICENSE) license.
