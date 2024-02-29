#!/bin/bash

if [ ! -d release/the-happy-app-darwin-x64/The\ Happy\ App.app ]; then
  mv release/the-happy-app-darwin-x64/the-happy-app.app \
     release/the-happy-app-darwin-x64/The\ Happy\ App.app
fi

cp -f ./docs/Instructions_MAC.pdf \
      release/the-happy-app-darwin-x64/INSTALL\ INSTRUCTIONS.pdf

 ./node_modules/.bin/electron-installer-dmg release/the-happy-app-darwin-x64/The\ Happy\ App.app the-happy-app --overwrite --icon=icons/Happy.icns --out=release/the-happy-app-mac-installer
