stft
====
A streaming-ish [short time Fourier transform](http://en.wikipedia.org/wiki/Short-time_Fourier_transform).

## Example
```javascript
var shortTimeFT = require("stft")


function onFreq(re, im) {
  //Frequency stuff.  Process it here
  istft(re, im)
}

function onTime(v) {
  //Got data, emit it here
  console.log("out frame:", v)
}

var stft = shortTimeFT(1, 1024, onFreq)
var istft = shortTimeFT(-1, 1024, onTime)

//Feed stuff into signal
stft(new Float32Array([1, 0, 0, 0, ... ])
```

## Install

    npm install stft

### `require("stft")(direction, frame_size, ondata[, options])`
Creates a function for processing a signal with a short time Fourier transform.

* `direction` is a flag that determines whether the stft is forward or inverse
* `frame_size` is the size of a frame for the stft
* `ondata` is a callback that gets fired whenever data is ready to be processed
* `options` is an optional object that takes the following parameters

    + `options.hop_size` the amount of samples between stft hops
    + `options.window_func` a windowing function, which takes a parameter from `[0,1]` and returns a weight

**Returns** A function that can be called with a frame (either real or complex) that adds a chunk of data to the stft queue

### `require("stft").stft(frame_size, ondata[, options])`
Short cut for `require("stft")(1, frame_size, ondata, options)`

### `require("stft").istft(frame_size, ondata[, options])`
Short cut for `require("stft")(-1, frame_size, ondata, options)`

## Credits
(c) 2013 Mikola Lysenko. MIT License
