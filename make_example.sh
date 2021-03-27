#!/usr/bin/env bash
set -ex

cp -r examples/counter examples/$1
cd examples/$1
npm install