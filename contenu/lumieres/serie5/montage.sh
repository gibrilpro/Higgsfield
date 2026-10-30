#!/bin/bash
# Série 5 : 3 vidéos TikTok générées (Veo 3.1 Lite, 9:16, 6 s) à partir de la photo principale de l'applique
# Les clips sortent avec des bandes noires : on garde l'image utile (720x892) et on la pose sur un fond flouté 1080x1920
N="crop=720:892:0:194,split[a][b];[a]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=30:3,eq=brightness=-0.08[bg];[b]scale=1080:-2[fg];[bg][fg]overlay=0:(H-h)/2,fps=30,setsar=1,format=yuv420p"
for v in noel couleurs aimant; do
  ffmpeg -loglevel error -y -i ${v}_raw.mp4 -filter_complex "$N" -c:v libx264 -crf 18 -an ${v}_brut.mp4
  python3 ../sous_titres.py ${v}_brut.mp4 ${v}_tiktok.mp4 cap_${v}.json
done
