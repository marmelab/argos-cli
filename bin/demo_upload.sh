#!/bin/bash

set -eu

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
echo "DIR is '$DIR'"

ARGOS="$DIR/argos.sh"
TMP_DIR="$DIR/../tmp"

$ARGOS drop project_a
$ARGOS drop project_b
$ARGOS drop project_c
$ARGOS drop project_realword

# $ARGOS upload "$TMP_DIR"/project_a/revision_a/{1..1}/*.*
$ARGOS upload "$TMP_DIR"/project_a/revision_a/1/*.*
# $ARGOS upload "$TMP_DIR"/project_b/{revision_a,revision_b}/{1..2}/*.*
$ARGOS upload "$TMP_DIR"/project_b/revision_a/1/*.*
$ARGOS upload "$TMP_DIR"/project_b/revision_a/2/*.*
$ARGOS upload "$TMP_DIR"/project_b/revision_b/1/*.*
$ARGOS upload "$TMP_DIR"/project_b/revision_b/2/*.*
# $ARGOS upload "$TMP_DIR"/project_c/revision_a/{1..5}/*.json
# $ARGOS upload "$TMP_DIR"/project_realworld/{initial_code,broken_code}/{1..10}/*.json
