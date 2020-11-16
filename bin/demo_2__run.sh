#!/bin/bash

set -eu

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
echo "DIR is '$DIR'"

ARGOS="$DIR/argos.sh"
APP_PATH="$DIR/../../argos-realworld"

PROJECT="project_b"
TMP_DIR="$DIR/../tmp"
mkdir -p "$TMP_DIR"
# shellcheck disable=SC2115
rm -rfv "$TMP_DIR/$PROJECT"

cat << EOF > "$TMP_DIR/$PROJECT.yml"
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

out_dir: $TMP_DIR
EOF

$ARGOS run \
    "$TMP_DIR/$PROJECT.yml" \
    --revision="revision_a" \
    --samples=2

cd "$APP_PATH"
git apply broken.diff
cd -

$ARGOS run \
    "$TMP_DIR/$PROJECT.yml" \
    --revision="revision_b" \
    --samples=2

cd "$APP_PATH"
git apply --reverse broken.diff
