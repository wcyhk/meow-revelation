"""Render the two original 135 BPM score stems. Requires NumPy and FFmpeg."""
from pathlib import Path
import subprocess
import wave
import numpy as np

RATE = 44100
BEAT = 60 / 135
BARS = 16
SAMPLES = round(RATE * BEAT * BARS * 4)
RNG = np.random.default_rng(70618)
OUT = Path(__file__).resolve().parents[1] / 'eclipse' / 'audio'
OUT.mkdir(parents=True, exist_ok=True)
BASE = np.zeros((2, SAMPLES), np.float32)
PRESSURE = np.zeros_like(BASE)


def hz(midi):
    return 440 * 2 ** ((midi - 69) / 12)


def clock(seconds):
    return np.arange(round(RATE * seconds)) / RATE


def place(stem, beat, voice, gain, pan=0):
    start = round(beat * BEAT * RATE)
    indexes = (start + np.arange(len(voice))) % SAMPLES
    # Equal-power pan leaves the kick and sub centered.
    angle = (pan + 1) * np.pi / 4
    stem[0, indexes] += voice * gain * np.cos(angle)
    stem[1, indexes] += voice * gain * np.sin(angle)


def kick(low=48, tail=.22):
    t = clock(tail)
    pitch = low * t + 79 * .039 * (1 - np.exp(-t / .039))
    click = np.sin(2 * np.pi * 1900 * t) * np.exp(-t * 440) * .12
    return np.tanh((np.sin(2 * np.pi * pitch) + click) * 1.45) * np.exp(-t * 15)


def noise(duration, brightness):
    t = clock(duration)
    white = RNG.uniform(-1, 1, len(t))
    dark = np.convolve(white, np.ones(7) / 7, mode='same')
    return t, white - dark * brightness


def snare():
    t, raw = noise(.23, .82)
    body = np.sin(2 * np.pi * (171 * t + 4 * (1 - np.exp(-t * 21)))) * np.exp(-t * 35)
    rattle = raw * np.exp(-t * 18) * (.72 + .28 * np.cos(2 * np.pi * 77 * t))
    return (rattle * .73 + body * .45) * np.minimum(1, t * 1200)


def hat(duration):
    t, raw = noise(duration, 1)
    metallic = np.sin(2 * np.pi * 5673 * t) * np.sin(2 * np.pi * 8091 * t)
    return (.77 * raw + .23 * metallic) * np.exp(-t * (6.5 / duration)) * np.minimum(1, t * 2600)


def voice(midi, seconds, flavor):
    t = clock(seconds)
    f = hz(midi)
    phase = 2 * np.pi * f * t
    if flavor == 'sub':
        sound = np.sin(phase) + .26 * np.sin(phase * 2) + .10 * np.sin(phase * 3)
        envelope = np.minimum(1, t * 140) * np.exp(-t / .21)
    elif flavor == 'blade':
        bend = np.sin(2 * np.pi * 5.1 * t)
        sound = np.tanh(1.45 * (np.sin(phase + .025 * bend) + .42 * np.sin(phase * 2.002)
                                + .23 * np.sin(phase * 3.0 - .04 * bend)))
        envelope = np.minimum(1, t * 110) * np.exp(-t / .29)
    elif flavor == 'organ':
        sound = (.78 * np.sin(phase) + .31 * np.sin(phase * 2.002)
                 + .18 * np.sin(phase * 2.997) + .10 * np.sin(phase * .501))
        envelope = np.minimum(1, t * 8) * np.minimum(1, (seconds - t) * 2.4)
        envelope *= .83 + .17 * np.sin(2 * np.pi * 2.8 * t + .4)
    else:
        sound = np.sin(phase) * np.exp(-t * 4.8)
        sound += .42 * np.sin(phase * 2.003) * np.exp(-t * 13)
        sound += .13 * np.sin(phase * 4.18) * np.exp(-t * 24)
        envelope = np.minimum(1, t * 420)
    return sound * envelope * np.minimum(1, (seconds - t) * 76)


chords = [
    (38, (53, 57, 62)), (38, (57, 60, 65)), (39, (55, 58, 63)), (36, (55, 58, 62)),
    (38, (53, 57, 62)), (34, (53, 58, 65)), (39, (55, 58, 63)), (33, (52, 55, 61)),
    (38, (53, 57, 62)), (41, (53, 60, 65)), (34, (53, 58, 62)), (36, (55, 60, 63)),
    (38, (53, 57, 65)), (39, (55, 58, 63)), (34, (53, 58, 62)), (33, (52, 57, 61)),
]
motifs = [
    (74, None, 69, 72, None, 77, 76, None),
    (74, 72, None, 69, 65, None, 67, None),
    (75, None, 70, 74, None, 79, 77, None),
    (72, None, 67, None, 70, 69, None, 73),
    (74, 77, None, 81, 79, None, 77, 74),
    (70, None, 77, None, 74, 72, None, 69),
    (75, 79, None, 82, None, 79, 77, 75),
    (73, None, 76, 81, 79, None, 76, 73),
]

for bar, (root, chord) in enumerate(chords):
    start = bar * 4
    for pulse in range(4):
        beat = start + pulse
        place(BASE, beat, kick(), .66 if pulse == 0 else .49)
        place(BASE, beat + .006, voice(root - 12, BEAT * .86, 'sub'), .39)
        if pulse in (1, 3):
            place(BASE, beat, snare(), .29, -.08)
            place(PRESSURE, beat + .025, snare(), .17, .18)
        place(BASE, beat + .50, hat(.087 if pulse == 3 else .052), .19, .46 if pulse % 2 else -.37)
        place(PRESSURE, beat + .25, hat(.055), .17, -.38)
        place(PRESSURE, beat + .75, hat(.070), .19, .45)
    for offset in (0, .75, 1.5, 2, 2.75, 3.5):
        place(PRESSURE, start + offset, voice(root, .20, 'blade'), .24, -.15 if offset < 2 else .15)
    for index, pitch in enumerate(chord):
        place(BASE, start + index * .032, voice(pitch, 1.92, 'organ'), .10, (index - 1) * .67)
        if index != 1:
            place(PRESSURE, start + index * .03, voice(pitch + 12, 1.93, 'organ'), .045, (index - 1) * .63)
    for index, pitch in enumerate(motifs[bar % 8]):
        if pitch is None:
            continue
        when = start + index * .5
        pan = -.24 if index % 2 else .28
        place(BASE, when, voice(pitch, .39, 'bell'), .15 if index in (0, 4) else .105, pan)
        place(BASE, when + .75, voice(pitch, .33, 'bell'), .039, -pan * 2)
        if bar % 8 >= 4 and index % 2 == 0:
            place(PRESSURE, when, voice(pitch - 12, .24, 'blade'), .14, -pan)
    if bar % 4 == 3:
        for j, offset in enumerate((3.08, 3.34, 3.61, 3.82)):
            place(PRESSURE, start + offset, kick(91 - j * 12, .17), .23, .17 - j * .08)


def encode(name, data):
    try:
        import imageio_ffmpeg
        ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
    except ImportError:
        ffmpeg = 'ffmpeg'
    wav = OUT / (name + '.wav')
    peak = np.max(np.abs(data))
    audio = np.tanh(data / peak * .98) * .94
    with wave.open(str(wav), 'wb') as file:
        file.setparams((2, 2, RATE, SAMPLES, 'NONE', 'not compressed'))
        file.writeframes((audio.T * 32767).astype('<i2').tobytes())
    try:
        subprocess.run([ffmpeg, '-hide_banner', '-loglevel', 'error', '-y', '-i', str(wav),
                        '-codec:a', 'libmp3lame', '-b:a', '160k', str(OUT / (name + '.mp3'))], check=True)
    finally:
        wav.unlink()


encode('requiem-grove', BASE)
encode('requiem-pressure', PRESSURE)
