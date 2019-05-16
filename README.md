# harmonic-vue

> A Vue.js project

## Try it


### With MIDI

Setup your MIDI devices, fi. over USB (on android, make sure the device connects as a MIDI device), or using BLE MIDI (on android, this probabaly requires an extra App).

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

Then setup a synthesizer to play the sounds, fi. fluidsynth.
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
