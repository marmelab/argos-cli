# ARGOS

Auditing Reporter for Greener Ops Strategies

Tool to measure consumption of a given Docker command and see its performance evolution.
Argos CLI is able to measure CPU, memory, disk and network usage of Docker containers for a given command.
By measuring resource consumption of dockerized E2E tests, Argos allows to compare the consumption of an app between its different versions.

Argos uses the collected metrics to evaluate energy consumption and generate charts for Docker containers.

**This code has moved**

Argos is now called [GreenFrame](https://greenframe.io), and the Argos CLI has moved to [`marmelab/greenframe-cli`](https://github.com/marmelab/greenframe-cli).
