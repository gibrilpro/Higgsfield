#!/bin/bash
# Série 4 : 3 vidéos TikTok gratuites remontées à partir des plans existants (0 crédit)
F=/usr/local/lib/python3.11/dist-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2
L=..
N="scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30,setsar=1,format=yuv420p"
seg(){ $F -loglevel error -y -ss $2 -t $3 -i $1 -vf "$N" -af "aresample=48000,aformat=channel_layouts=stereo" -c:v libx264 -crf 18 -c:a aac -b:a 160k $4; }
cat_(){ out=$1; shift; : > list.txt; for s in "$@"; do echo "file '$s'" >> list.txt; done; $F -loglevel error -y -f concat -safe 0 -i list.txt -c copy $out; }
# V1 : 3 endroits
seg $L/serie2/avant_apres_brut.mp4 3.6 3 a.mp4
seg $L/serie3/pov_3h_brut.mp4 0.3 3 b.mp4
seg $L/applique_pov_brut.mp4 4.3 3.2 c.mp4
seg $L/serie3/chambre_avant_apres_brut.mp4 2.2 2.6 d.mp4
cat_ v1_brut.mp4 a.mp4 b.mp4 c.mp4 d.mp4
# V2 : avant / après
seg $L/serie2/avant_apres_brut.mp4 0 2.7 e.mp4
seg $L/serie2/avant_apres_brut.mp4 3.4 4.6 f.mp4
cat_ v2_brut.mp4 e.mp4 f.mp4
# V3 : POV nuit
seg $L/serie3/pov_3h_brut.mp4 0 5.8 g.mp4
seg $L/applique_pov_brut.mp4 4.3 3.6 h.mp4
cat_ v3_brut.mp4 g.mp4 h.mp4
rm -f a.mp4 b.mp4 c.mp4 d.mp4 e.mp4 f.mp4 g.mp4 h.mp4 list.txt
