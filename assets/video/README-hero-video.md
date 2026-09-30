# Hero video: how to replace it

The hero mockup on the home page plays `hero-dashboard.mp4`. It is muted, looped
and autoplayed by `scroll.js` once the frame scrolls into view.

## Three rules for any replacement

**1. Crop the browser chrome off.** The hero sits inside a browser mockup that
the page draws itself, with its own title bar and three dots. A recording that
still has Chrome's tab strip and address bar in it puts a browser inside a
browser, and the address bar shows a development URL. Cut it.

**2. The last frame has to match the first.** The video loops. Anything left
open at the end, a menu, a modal, a dimmed scrim, snaps shut on the join and the
loop reads as a glitch. The raw clip ended with Quick Actions open over a dimmed
page, so it was trimmed from 17.6s to 14.6s, where the dashboard is back to its
opening state. Quick Actions still appears, in the Night Dim stretch.

**3. Drop the audio track.** The video is muted and looping. An audio track is
weight nobody hears.

## The command that built the current file

Source: `Hero video.mp4` at the site root, a 1920x1080 60fps capture with audio.
In that capture the chrome was the top 88px and the window edge was the bottom
48px, leaving 1920x944 of app. Measure a fresh capture before reusing these
numbers, they are specific to that window.

```
ffmpeg -i "Hero video.mp4" -an -t 14.6 \
  -vf "crop=1920:944:0:88,fps=30" \
  -c:v libx264 -profile:v high -pix_fmt yuv420p \
  -preset slow -crf 27 -movflags +faststart \
  -y assets/video/hero-dashboard.mp4
```

### Finding the trim point

Compare candidate end frames against frame 0 and take the one that differs
least. Under about 0.5% of pixels differing is invisible on the join.

```
ffmpeg -ss 0    -i in.mp4 -frames:v 1 -y a.png
ffmpeg -ss 14.6 -i in.mp4 -frames:v 1 -y b.png
python -c "from PIL import Image,ImageChops; h=ImageChops.difference(Image.open('a.png').convert('RGB'),Image.open('b.png').convert('RGB')).convert('L').histogram(); print('%.2f%%'%(100*sum(h[25:])/sum(h)))"
```

The poster, taken one second in so the dashboard is fully drawn:

```
ffmpeg -ss 1.0 -i "Hero video.mp4" -frames:v 1 \
  -vf "crop=1920:944:0:88,scale=1280:-2" -y poster.png
```

then saved as WebP at quality 80 to `assets/video/hero-dashboard-poster.webp`.

## What each setting is doing

| Setting | Why |
|---|---|
| `-an` | Removes the audio track. |
| `crop=W:H:X:Y` | Cuts the browser chrome. X and Y are the top-left corner of what is kept. |
| `fps=30` | The capture is 60fps. Half the frames, roughly half the file, and no visible difference on a screen recording. |
| `-crf 27` | Checked against the source pixel for pixel at full size: no visible loss. 24 gives a 2.2MB file, 30 gives 1.2MB. |
| `-profile:v high -pix_fmt yuv420p` | Plays on every browser and on iOS. |
| `-t 14.6` | Trims the tail so the clip loops cleanly. See rule 2. |
| `-movflags +faststart` | Puts the index at the front of the file so playback can start before the whole thing has downloaded. |

Result: 1.3MB for 14.6 seconds. The clip it replaced was 1.1MB for 10.8 seconds,
so the bitrate is slightly lower than what was already shipping.

## If the shape changes

`index.html` carries `width` and `height` on the `<video>`, and `redesign.css`
(ROUND 16c) sets the frame's `aspect-ratio` to the clip's exact shape. Both have
to move together. The video is `object-fit: cover`, so a frame that does not
match the clip crops the left and right edges and takes the app's sidebar with
them.

## Filenames

The previous clip is still on disk as `hero-appearance.mp4` and
`hero-appearance-poster.webp`. Nothing loads them. A new name was used rather
than overwriting, so a cached copy of the old file at the old URL can never be
served in place of the new one.
