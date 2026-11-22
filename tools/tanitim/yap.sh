#!/bin/sh
# İki tanıtım videosunu üretir. Seslendirme dosyaları (vo1.mp3, vo2.mp3) çalışma klasöründe olmalı. Kullanım: sh yap.sh <çalışma klasörü>
set -e
D=${1:-.}; H=$(cd "$(dirname "$0")" && pwd)
for v in 1 2; do
  [ -f "$D/v$v.sessiz.mp4" ] && continue   # çekim uzun sürer; hazırsa yeniden çekme
  node "$H/render.js" $v "$D"
  ffmpeg -y -loglevel error -f concat -safe 0 -i "$D/v$v.txt" -c copy "$D/v$v.tmp.mp4" && mv "$D/v$v.tmp.mp4" "$D/v$v.sessiz.mp4"
done
python3 "$H/muzik.py" "$D/m1.wav" 28.0 120 Am,F,C,G 4.5 25.5
python3 "$H/muzik.py" "$D/m2.wav" 22.8 112 Dm,Bb,F,C 3.75 20.36
for v in 1 2; do
  [ $v = 1 ] && T=28.0 || T=22.8
  ffmpeg -y -loglevel error -i "$D/v$v.sessiz.mp4" -i "$D/m$v.wav" -i "$D/vo$v.mp3" -filter_complex "[2:a]adelay=700|700,aresample=44100,pan=stereo|c0=c0|c1=c0,volume=1.9,apad=whole_dur=$T,asplit=2[v1][v2];[1:a]volume=0.55[m];[m][v1]sidechaincompress=threshold=0.02:ratio=8:attack=15:release=350[md];[md][v2]amix=inputs=2:normalize=0:duration=first,alimiter=limit=0.85[a]" -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart "$D/yelek-v$v.tmp.mp4"
done
mv "$D/yelek-v1.tmp.mp4" "$D/yelek-tahmin.mp4"; mv "$D/yelek-v2.tmp.mp4" "$D/yelek-soyunma-odasi.mp4"
