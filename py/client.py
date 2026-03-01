#!/usr/bin/env python3

import asyncio
import datetime
import json
import sys
import time
import uuid
import websockets.asyncio.client as wsc

import protocol

def compute_next_token(messages: list[protocol.Chat]) -> str:
    time.sleep(1)
    return " AAA"

async def main():
    remote = sys.argv[1] if len(sys.argv) > 1 else "wss://www.rpm.cc/imitation/ws"

    async with wsc.connect(remote) as ws:
        queue: asyncio.Queue[protocol.FromServer] = asyncio.Queue()
        await ws.send(protocol.Ping().model_dump_json())

        async def predictor():
            messages: list[protocol.Chat] = []
            while not messages:
                msg = await queue.get()
                if msg.root.type == "chat":
                    messages.append(msg.root)
            while True:
                token = await asyncio.get_running_loop().run_in_executor(
                    None, compute_next_token, messages
                )
                prediction = protocol.Predict(
                    after=messages[-1].id.root,
                    token=token,
                )
                print(f">> {prediction}")
                await ws.send(prediction.model_dump_json())
                while not queue.empty():
                    msg = queue.get_nowait()
                    if msg.root.type == "chat":
                        messages.append(msg.root)

        async def listener():
            async for message in ws:
                msg = protocol.FromServer.model_validate_json(message)
                print(f"<< {msg}")
                await queue.put(msg)

        await asyncio.gather(predictor(), listener())

if __name__ == "__main__":
    asyncio.run(main())
