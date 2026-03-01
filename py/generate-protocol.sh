#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail
datamodel-codegen \
  --input ../packages/protocol/schema.json \
  --output protocol.py \
  --output-model-type pydantic_v2.BaseModel
