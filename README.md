# Fiew

See your music!

These are some experiments to visualize music in an informative way: see the notes that you play real-time, visualize the harmonic structure, and plot the music's dynamics and rhythm.

There are many applications that visualize music.
In most cases, the focus is on aesthetics where a sound spectrum is animated in some way.
Guitar-hero inspired piano-role style visualizations are common on YouTube, but this is more a gamification of music.
Some scientific investigations have been done over the years.
However, their code is not easily available or uses complex and expensive hardware/software.
With this project I want to provide a simple (re)implementation in Javascript to play around with, and try some ideas of my own.

I am also curious how far I can get using Javascript; latency and rendering performance will probably become an issue later on.
For reference, I'm using a Kawai CA-67 piano with a Yamaha MD-BT01 Bluetooth LE adaptor, and visualize on a low end 2018 Samsung tablet.


Inspiration:

 * [The Tonnetz](https://en.wikipedia.org/wiki/Tonnetz)
 * [The Torii of phases](https://arxiv.org/abs/1208.4774)
 * [Forte's inventorisation of pitch class sets](https://en.wikipedia.org/wiki/List_of_pitch-class_sets), as described in _The Structure of Atonal Music_ (1973, ISBN 0-300-02120-8).
 * Mapping Tone Helixes to Cylindrical Lattices using Chiral Angles, Hanlin Hu, Brett Park and David Gerhard, ICMC2015

Resources:
 * [International Computer Music Association](http://www.computermusic.org/)

## Try it


### With MIDI hardware

Setup your MIDI devices, fi. over USB (on android, make sure the device connects as a MIDI device), or using BLE MIDI (on android, this probabaly requires an extra App).

Visit the demo site with a modern browser.

Select the relevant MIDI input and output devices by clicking on the midi icons in the bottom left.

### Without MIDI

You can use this program also without (hardware) MIDI.
On Fedora, there is a default *Midi Through Port-0* software midi device (provided by the ALSA sound system I suppose).

Find the address, and connect a midi player to it:

```bash
 $ aplaymidi -l
 Port    Client name                      Port name
 14:0    Midi Through                     Midi Through Port-0
130:0    FLUID Synth (4361)               Synth input port (4361:0)
 $ aplaymidi -p 14 myfile.mid
```
Alternatively, press the juxebox on the main page to play a demo song.

Then setup a synthesizer to play the sounds, fi. fluidsynth:

```bash
 $ fluidsynth -a pulseaudio -m alsa_seq /usr/share/soundfonts/FluidR3_GM.sf2
```
If you don't like the commandline, have a look at *qsynth* for a simple GUI.

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report

# run unit tests
npm run unit

# run all tests
npm test
```

For a detailed explanation on how things work, check out the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).
