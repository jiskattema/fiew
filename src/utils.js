export var delay = 200

// midi note 60 is C4, and 72 is C5
export var names = [
  'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'
]

export var players = {}

export function addPlayer (name, tick, noteOn, noteOff, scope) {
  console.log('Adding player', name)
  players[name] = {
    name: name,
    tick: tick,
    noteOn: noteOn,
    noteOff: noteOff,
    scope: scope
  }
}

export function removePlayer (name) {
  console.log('Removing player', name)
  delete players[name]
}

export function noteOn (evt) {
  Object.keys(players).forEach(name => {
    var player = players[name]
    if (player.noteOn) {
      player.noteOn.call(player.scope, evt)
    }
  })
}

export function noteOff (evt) {
  Object.keys(players).forEach(name => {
    var player = players[name]
    if (player.noteOff) {
      player.noteOff.call(player.scope, evt)
    }
  })
}

export function tick () {
  Object.keys(players).forEach(name => {
    var player = players[name]
    if (player.tick) {
      player.tick.call(player.scope)
    }
  })
  setTimeout(tick, delay)
}

export function midiNumberToNote (number) {
  number = 1 * number
  var octave = Math.floor(number / 12)
  var key = names[number - octave * 12]
  return {
    octave: octave,
    key: key
  }
}

export default {
  delay: delay,
  players: players,
  names: names,
  addPlayer: addPlayer,
  removePlayer: removePlayer,
  midiNumberToNote: midiNumberToNote,
  noteOn: noteOn,
  noteOff: noteOff,
  tick: tick
}
