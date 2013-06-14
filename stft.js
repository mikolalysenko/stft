"use strict"

var ndarray = require("ndarray")
var fft = require("ndarray-fft")

function hannWindowAnalysis(t) {
  return 0.5 * (1.0 - Math.cos(2.0 * Math.PI * t));
}

function hannWindowSynthesis(t) {
  return hannWindowAnalysis(t) * 2.0 / 3.0
}

function initWindow(frame_size, window_func) {
  var ftwindow = new Float32Array(frame_size)
  for(var i=0; i<frame_size; ++i) {
    ftwindow[i] = window_func(i / (frame_size-1))
  }
  return ftwindow
}

function forwardSTFT(frame_size, onstft, options) {
  options = options || {}
  
  var hop_size = options.hop_size || frame_size>>>2
  var buffer   = new Float32Array(frame_size * 2)
  var ptr      = 0
  var window   = initWindow(frame_size, options.window_func||hannWindowAnalysis)
  var out_x    = new Float32Array(frame_size)
  var out_y    = new Float32Array(frame_size)
  var real     = ndarray(out_x)
  var imag     = ndarray(out_y)
  
  function ondata(frame) {
    var n = frame_size
    var i, j, k
    var W = window, B = buffer, X = out_x, Y = out_y
    
    //Copy data into buffer
    B.set(frame, ptr)
    ptr += n
    
    //Emit frames
    for(j=0; j+n<=ptr; j+=hop_size) {
      for(i=0; i<n; ++i) {
        X[i] = B[i+j] * W[i]
      }
      for(i=0; i<n; ++i) {
        Y[i] = 0.0
      }
      fft(1, real, imag)
      onstft(X, Y)
    }
    
    //Shift buffer backwards
    k = ptr
    for(i=0; j<k; ++i, ++j) {
      B[i] = B[j]
    }
    ptr = i
  }
  
  return ondata
}

function inverseSTFT(frame_size, onistft, options) {
  options = options || {}
  
  var hop_size = options.hop_size || frame_size>>>2
  var buffer   = new Float32Array(frame_size * 2)
  var output   = buffer.subarray(0, frame_size)
  var sptr     = 0
  var eptr     = 0
  var window   = initWindow(frame_size, options.window_func||hannWindowSynthesis)
  var real     = ndarray(window)
  var imag     = ndarray(window)
  
  function ondata(X, Y) {
    var n = frame_size
    var i, j, k
    var W = window, B = buffer
    
    //FFT input signal
    real.data = X
    imag.data = Y
    fft(-1, real, imag)

    //Overlap-add
    k = eptr
    for(i=0, j=sptr; j<k; ++i, ++j) {
      B[j] += W[i] * X[i]
    }
    for(; i < n; ++i, ++j) {
      B[j] = W[i] * X[i]
    }
    sptr += hop_size
    eptr = j

    //Emit frames
    while(sptr >= n) {
      onistft(output)
      for(i=0, j=n; i<n; ++i, ++j) {
        B[i] = B[j]
      }
      eptr -= n
      sptr -= n
    }
  }
  
  return ondata
}

function STFT(dir, frame_size, ondata, options) {
  if(dir >= 0) {
    return forwardSTFT(frame_size, ondata, options)
  } else {
    return inverseSTFT(frame_size, ondata, options)
  }
}

module.exports = STFT
module.exports.stft = forwardSTFT
module.exports.istft = inverseSTFT