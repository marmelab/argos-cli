#!/bin/bash

# API_DIR=node-express
# CLIENT_DIR=react-redux
# BROKEN_PATCH=broken.diff
# SAMPLES=1

set -eu

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
echo "DIR is '$DIR'"

ARGOS="$DIR/argos.sh"
DATA_DIR="$DIR/../data"
PROJECT="$API_DIR"-"$CLIENT_DIR"-"$SAMPLES"

$ARGOS drop "$PROJECT"

if [[ -z "${BROKEN_PATCH+x}" ]]; then
    echo "no BROKEN_PATCH supplied";
    $ARGOS upload "$DATA_DIR"/"$PROJECT"/initial/*/*.json
else
    echo "BROKEN_PATCH=$BROKEN_PATCH";
    $ARGOS upload "$DATA_DIR"/"$PROJECT"/{initial,"$BROKEN_PATCH"}/*/*.json
fi
