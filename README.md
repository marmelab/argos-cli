# ARGOS

Auditing Reporter for Greener Ops Strategies

Tool to measure consumption of a given Docker command and see its performance evolution.
Argos CLI is able to measure CPU, memory, disk and network usage of Docker containers for a given command.
By measuring resource consumption of dockerized E2E tests, Argos allows to compare the consumption of an app between its different versions.

Argos uses the collected metrics to evaluate energy consumption and generate charts for Docker containers.

## Requirements for Argos CLI
-   A running API (Argos server)
-   nodeJS

## ARGOS-CLI

### Installation

```sh
make install
```

### Usage to measure

```sh
./bin/argos.sh run --help
```

```
argos run <path>

Positionals:
  path                                                       [string] [required]

Options:
      --help      Show help                                            [boolean]
  -r, --revision                                             [string] [required]
  -s, --samples                                            [number] [default: 1]

Examples:
  ./bin/argos.sh run ./my_project.yml -r my_revision
  ./bin/argos.sh run ./my_project.yml -r my_revision -s 2
```

**Configuration file .yml:**

An example is provided in `./realworld.argos.yml`

```yml
project: realworld

containers:
    - conduit_cypress_1
    - conduit_client_1
    - conduit_mongo_1
    - conduit_api_1

pre_commands: # Commands to run to setup the measured app before to run the measures
    - make -C ../argos-realworld setup-test
    - make -C ../argos-realworld restore

commands: # Commands to run to processes automated actions in the app to be measured (ie : with cypress)
    - make -C ../argos-realworld run-test

out_dir: ./measures_directory # Local path to stored measures

timeline: ./measures_directory/timeline.txt # Local path to timeline log
```

After the execution, measures files will be available in JSON format at:
`./measures_directory/tested_app/`

### Upload stats to API

```sh
./bin/argos.sh upload --help
```

```
argos upload <paths...>

Positionals:
  paths                                         [array] [required] [default: []]

Options:
      --help  Show help                                                [boolean]
  -u, --url                          [string] [default: "http://localhost:3001"]

Examples:
  argos upload measures_directory/my_project/my_revision-*.json
  argos upload measures_directory/**/*.json -- -u http://my-api-server.com
```

### Drop stats from API

```sh
./bin/argos.sh drop --help
```

```
argos drop <project>

Positionals:
  project                                                    [string] [required]

Options:
      --help  Show help                                                [boolean]
  -u, --url                          [string] [default: "http://localhost:3001"]

Examples:
  argos drop my_project
  argos drop my_project -- -u http://my-api-server.com
```

## Demo

You can find some demo scripts in `bin` folder.
Demos are using the [marmelab realworld application](https://github.com/marmelab/argos-realworld), so you need to clone this repository.

```sh
git clone git@github.com:marmelab/argos-realworld.git
```
