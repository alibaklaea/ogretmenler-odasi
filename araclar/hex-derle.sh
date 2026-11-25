#!/bin/bash
# js/kodlar.js'deki bütün Arduino kodlarını derler ve hex/ klasörüne koyar (uygulamadan yükleme için).
# Gerekli: ~/arduino-cli/arduino-cli.exe + arduino:avr çekirdeği + Servo, DHT sensor library, Adafruit Unified Sensor, IRremote, LiquidCrystal I2C
set -e
K="$(cd "$(dirname "$0")/.." && pwd)"; CLI=~/arduino-cli/arduino-cli.exe; T=~/arduino-cli
cd "$T" && rm -rf derle && node "$K/araclar/hex-cikar.js" "$K"
for d in $(cat derle/liste.txt); do
  "$CLI" compile -b arduino:avr:uno --output-dir derle/$d/out derle/$d >/dev/null && cp derle/$d/out/$d.ino.hex "$K/hex/$d.hex" && echo "$d tamam"
done
node "$K/araclar/hex-gom.js"
