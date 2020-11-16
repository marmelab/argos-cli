# ARGOS

Auditing Reporter for Greener Ops Strategies

Tool to measure consumption of a given Docker command and see its performance evolution.
Argos is able to measure CPU, memory and network usage of Docker containers for a given command.
By measuring resource consumption of dockerized E2E tests, Argos allows to compare the consumption of an app between its different versions.

Argos use the collected metrics to generate chart per Docker container and metrics.

## Requirements

-   Docker
-   Docker Compose
-   yarn

The tool is divided into 3 packages:

-   **cli**: the CLI to collect metrics from other programs
-   **api**: the API to display and analyse collected metrics
-   **web**: the website to display and analyse collected metrics

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
  ./bin/argos.sh run ./my_project.yml -r my_revision -t 2
```

**Configuration file .yml:**

Example is provided in `./realworld.argos.yml`

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
  argos upload tmp/my_project/my_revision-*.json
  argos upload tmp/**/*.json -- -u http://example.com
```

## Database management

To connect to server db:

```sh
./bin/mongo.sh
```

There are 3 documents:

-   `measure`: Each individual measure for each container
-   `report`: Agregate measures for each container (these are computed and returned to the web interface)
-   `stat`

```sh
./bin/mongo.sh --eval='db.measure.find({}).pretty();'
./bin/mongo.sh --eval='db.report.find({}).pretty();'
./bin/mongo.sh --eval='db.stat.find({}).pretty();'
```

Resetting db is done with following command:

```sh
./bin/mongo.sh --eval='db.dropDatabase();'
```

## Demo

You can find some demo scripts in `bin` folder.
Demos are using the [marmelab realworld application](https://github.com/marmelab/argos-realworld), so you need to clone this repository.

```sh
git clone git@github.com:marmelab/argos-realworld.git
```
