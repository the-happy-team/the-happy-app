#!/bin/bash

./node_modules/.bin/electron-installer-dmg ./release/the-happy-app-darwin-x64/the-happy-app.app the-happy-app --overwrite --icon=icons/Happy.icns --background=icons/dmg.png --out=release/the-happy-app-mac-installer
