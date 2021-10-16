#!/bin/bash

mv release/the-happy-app-darwin-x64/the-happy-app.app \
   release/the-happy-app-darwin-x64/The\ Happy\ App.app

./node_modules/.bin/electron-installer-dmg release/the-happy-app-darwin-x64/The\ Happy\ App.app the-happy-app --overwrite --icon=icons/Happy.icns --out=release/the-happy-app-mac-installer
