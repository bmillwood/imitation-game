#!/usr/bin/env python

from pathlib import Path

import datamodel_code_generator as dcg

schema_path = "../packages/protocol/schema.json"

json_schema = open(schema_path).read()
result = dcg.generate(
    input_=json_schema,
    input_file_type=dcg.InputFileType.JsonSchema,
    input_filename=schema_path,
    output_model_type=dcg.DataModelType.PydanticV2BaseModel,
    output=Path("protocol.py"),
)
