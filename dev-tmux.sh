#!/usr/bin/env bash
tmux new-session \; \
     split-window -h \; \
     send-keys "bun run dev:client" Enter \; \
     split-window \; \
     send-keys "bun run dev:server" Enter \; \
     select-layout main-vertical \; \
     select-pane -t 0
