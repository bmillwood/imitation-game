#!/usr/bin/env python3

import asyncio
import datetime
import json
import uuid
import websockets.asyncio.client as wsc

import protocol

async def main():
    async with wsc.connect("wss://www.rpm.cc/imitation/ws") as ws:
        await ws.send(protocol.Ping().model_dump_json())
        async for message in ws:
            print(json.loads(message))

if __name__ == "__main__":
    asyncio.run(main())
