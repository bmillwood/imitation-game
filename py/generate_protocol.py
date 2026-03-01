#!/usr/bin/env python

import contextlib
import io
import os
import tempfile

import datamodel_code_generator as dcg

schema_path = "../packages/protocol/schema.json"

json_schema = open(schema_path).read()

buf = io.StringIO()
with contextlib.redirect_stdout(buf):
    dcg.generate(
        input_=json_schema,
        input_file_type=dcg.InputFileType.JsonSchema,
        input_filename=schema_path,
        output_model_type=dcg.DataModelType.PydanticV2BaseModel,
        additional_imports=["datetime", "pydantic", "uuid"],
    )

preamble = """
def createdAt_now() -> CreatedAt:
    return CreatedAt(root=datetime.datetime.now(tz=datetime.timezone.utc))

""".lstrip()

code = buf.getvalue()
with open("protocol.py", "w") as pf:
    done_preamble = False
    for line in code.splitlines():
        if not done_preamble:
            if line and not line.startswith("#") and not "import" in line:
                pf.write(preamble)
                done_preamble = True

        match line:
            case "    id: Id":
                pf.write("    id: Id = pydantic.Field(default_factory=lambda: Id(root=uuid.uuid4()))\n")
            case "    createdAt: CreatedAt":
                pf.write("    createdAt: CreatedAt = pydantic.Field(default_factory=createdAt_now)\n")
            case _:
                if line.startswith("    type: Literal["):
                    type_value = line.split("[", 1)[1].split("]", 1)[0]
                    pf.write(f"{line} = {type_value}\n")
                else:
                    pf.write(f"{line}\n")
