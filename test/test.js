var STFT = require("../stft.js")

function stftPassThru(frame_size, input) {
  var stft = STFT(1, frame_size, onfft)
  var istft = STFT(-1, frame_size, onifft)
  var output = new Float32Array(input.length)
  var in_ptr = 0
  var out_ptr = 0
 
  function onfft(x, y) {
    istft(x, y)
  }
  
  function onifft(v) {
    console.log(Array.prototype.slice.call(v))
    for(var i=0; i<v.length; ++i) {
      output[out_ptr++] = v[i]
    }
  }
  
  for(var i=0; i+frame_size<=input.length; i+=frame_size) {
    stft(input.subarray(i, i+frame_size))
  }
  stft(new Float32Array(frame_size))
  return output
}

console.log(Array.prototype.slice.call(stftPassThru(8, new Float32Array([
  0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
]))))

