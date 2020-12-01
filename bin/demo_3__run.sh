#!/bin/bash

set -eu

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
echo "DIR is '$DIR'"

ARGOS="$DIR/argos.sh"
APP_PATH="$DIR/../../argos-realworld"
TIMELINE_PATH="$APP_PATH/tests/data/timeline.txt"

PROJECT="project_c"
DATA_DIR="$DIR/../data"
mkdir -p "$DATA_DIR"
# shellcheck disable=SC2115
rm -rfv "$DATA_DIR/$PROJECT"

echo "DATA_DIR is '$DATA_DIR'"
$ARGOS run <(echo "
project: $PROJECT

containers:
    - conduit_cypress_1
    - conduit_client_1
    - conduit_mongo_1
    - conduit_api_1

pre_commands:
    - make -C $APP_PATH setup-test
    - make -C $APP_PATH restore

commands:
    - make -C $APP_PATH run-test

out_dir: $DATA_DIR
timeline: $TIMELINE_PATH
") \
    --revision="revision_a" \
    --samples=5
