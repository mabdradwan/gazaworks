// Continuous, low-latency microphone samples. Output stays silent to avoid feedback.
class GazaVoiceInput extends AudioWorkletProcessor {
 constructor(){super();this.samples=new Float32Array(512);this.index=0;}
 process(inputs){const input=inputs[0]?.[0];if(input)for(const sample of input){this.samples[this.index++]=sample;if(this.index===512){this.port.postMessage(this.samples,[this.samples.buffer]);this.samples=new Float32Array(512);this.index=0;}}return true;}
}
registerProcessor('gazaworks-voice-input',GazaVoiceInput);
