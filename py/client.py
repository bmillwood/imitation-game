#!/usr/bin/env python3

import asyncio
import datetime
import json
import uuid
import websockets.asyncio.client as wsc

import protocol

def createdAt_now():
    return datetime.datetime.now(tz=datetime.timezone.utc).isoformat().replace("+00:00", "Z")

async def send(ws, msg: dict):
    msg["id"] = str(uuid.uuid4())
    msg["createdAt"] = createdAt_now()
    serialised = json.dumps(msg)
    print(">>", serialised)
    return await ws.send(serialised)

async def main():
    async with wsc.connect("wss://www.rpm.cc/imitation/ws") as ws:
        await ws.send(protocol.Ping(
            id=protocol.Id(root=uuid.uuid4()),
            createdAt=protocol.CreatedAt(root=datetime.datetime.now(tz=datetime.timezone.utc)),
            type="ping",
        ).model_dump_json())
        async for message in ws:
            print(json.loads(message))

if __name__ == "__main__":
    asyncio.run(main())
