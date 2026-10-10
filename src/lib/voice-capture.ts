export function wavAudio(chunks:Float32Array[],sampleRate:number):Blob{
 const samples=chunks.reduce((n,c)=>n+c.length,0),data=new ArrayBuffer(44+samples*2),v=new DataView(data);
 const word=(at:number,s:string)=>{for(let i=0;i<s.length;i++)v.setUint8(at+i,s.charCodeAt(i))};
 word(0,"RIFF");v.setUint32(4,36+samples*2,true);word(8,"WAVE");word(12,"fmt ");v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,sampleRate,true);v.setUint32(28,sampleRate*2,true);v.setUint16(32,2,true);v.setUint16(34,16,true);word(36,"data");v.setUint32(40,samples*2,true);
 let at=44;for(const chunk of chunks)for(const sample of chunk){const x=Math.max(-1,Math.min(1,sample));v.setInt16(at,x<0?x*32768:x*32767,true);at+=2}
 return new Blob([data],{type:"audio/wav"});
}
export class VoiceActivity{
 private lastSpeech=0;private speechFrames=0;
 constructor(private started:number){}
 observe(rms:number,now:number){if(rms>.012){this.lastSpeech=now;this.speechFrames++}return this.speechFrames>=3&&now-this.lastSpeech>1200||now-this.started>=25000}
 get heardSpeech(){return this.speechFrames>=3}
}
/** Uses the granted device directly; does not depend on Chrome's speech service. */
export class VoiceCapture{
 private source:MediaStreamAudioSourceNode|null=null;private processor:ScriptProcessorNode|null=null;private chunks:Float32Array[]=[];private detector:VoiceActivity|null=null;private callback:((audio:Blob|null)=>void)|null=null;
 constructor(private stream:MediaStream,private context:AudioContext){}
 async listen(callback:(audio:Blob|null)=>void){
  this.pause();await this.context.resume();this.callback=callback;this.detector=new VoiceActivity(Date.now());this.source=this.context.createMediaStreamSource(this.stream);this.processor=this.context.createScriptProcessor(2048,1,1);
  this.processor.onaudioprocess=e=>{const samples=e.inputBuffer.getChannelData(0);this.chunks.push(new Float32Array(samples));const rms=Math.sqrt(samples.reduce((sum,x)=>sum+x*x,0)/samples.length);if(this.detector?.observe(rms,Date.now()))this.finish()};
  this.source.connect(this.processor);this.processor.connect(this.context.destination);
 }
 private pause(){if(this.processor){this.processor.onaudioprocess=null;this.processor.disconnect()}this.source?.disconnect();this.processor=null;this.source=null;this.chunks=[]}
 cancelListening(){this.callback=null;this.pause()}
 finish(){const callback=this.callback,audio=this.detector?.heardSpeech?wavAudio(this.chunks,this.context.sampleRate):null;this.callback=null;this.pause();callback?.(audio)}
 close(){this.callback=null;this.pause();this.stream.getTracks().forEach(t=>t.stop());void this.context.close()}
}
