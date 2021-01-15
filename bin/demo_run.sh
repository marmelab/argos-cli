#!/bin/bash

# API_DIR=node-express
# CLIENT_DIR=react-redux
# BROKEN_PATCH=broken.diff
# SAMPLES=1

set -eu

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
echo "DIR is '$DIR'"

ARGOS="$DIR/argos.sh"
APP_PATH="$DIR/../../argos-realworld"
TIMELINE_PATH="$APP_PATH/tests/data/timeline.txt"

PROJECT="$API_DIR"-"$CLIENT_DIR"-"$SAMPLES"
DATA_DIR="$DIR/../data"
mkdir -p "$DATA_DIR"
# shellcheck disable=SC2115
rm -rfv "$DATA_DIR/$PROJECT"

cat << EOF > "$DATA_DIR/$PROJECT.yml"
project: $PROJECT

containers:
    - conduit_cypress_1
    - conduit_client_1
    - conduit_mongo_1
    - conduit_api_1

pre_commands:
    - make -C $APP_PATH setup-test API_DIR=$API_DIR CLIENT_DIR=$CLIENT_DIR
    - make -C $APP_PATH restore API_DIR=$API_DIR CLIENT_DIR=$CLIENT_DIR

commands:
    - make -C $APP_PATH run-test API_DIR=$API_DIR CLIENT_DIR=$CLIENT_DIR

out_dir: $DATA_DIR
timeline: $TIMELINE_PATH
EOF

echo "Run Argos on initial project"
$ARGOS run \
    "$DATA_DIR/$PROJECT.yml" \
    --revision="initial" \
    --samples="$SAMPLES"
rm -rf "$DATA_DIR"/"$PROJECT"/initial/0

if [[ -z "${BROKEN_PATCH+x}" ]]; then
    echo "no BROKEN_PATCH supplied";
else
    echo "BROKEN_PATCH=$BROKEN_PATCH";
    cd "$APP_PATH/$API_DIR"
    git apply "$BROKEN_PATCH"
    cd -

    echo "Run Argos on broken project"
    $ARGOS run \
        "$DATA_DIR/$PROJECT.yml" \
        --revision="$BROKEN_PATCH" \
        --samples="$SAMPLES"
    rm -rf "$DATA_DIR"/"$PROJECT"/"$BROKEN_PATCH"/0
    cd "$APP_PATH/$API_DIR"
    git apply --reverse "$BROKEN_PATCH"
    cd -
fi
