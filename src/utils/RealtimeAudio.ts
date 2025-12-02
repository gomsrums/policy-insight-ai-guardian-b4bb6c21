
export class AudioRecorder {
  private stream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private processor: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;

  constructor(private onAudioData: (audioData: Float32Array) => void) {}

  async start() {
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        sampleRate: 24000,
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });
    this.audioContext = new AudioContext({ sampleRate: 24000 });
    this.source = this.audioContext.createMediaStreamSource(this.stream);
    this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);
    this.processor.onaudioprocess = (e) => {
      const inputData = e.inputBuffer.getChannelData(0);
      this.onAudioData(new Float32Array(inputData));
    };
    this.source.connect(this.processor);
    this.processor.connect(this.audioContext.destination);
  }

  stop() {
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }
    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

export const encodeAudioForAPI = (float32Array: Float32Array): string => {
  const int16Array = new Int16Array(float32Array.length);
  for (let i = 0; i < float32Array.length; i++) {
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  const uint8Array = new Uint8Array(int16Array.buffer);
  let binary = '';
  const chunkSize = 0x8000;

  for (let i = 0; i < uint8Array.length; i += chunkSize) {
    const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length));
    binary += String.fromCharCode.apply(null, Array.from(chunk));
  }

  return btoa(binary);
};

export class RealtimeChat {
  private ws: WebSocket | null = null;
  private recorder: AudioRecorder | null = null;
  private onEvent: (event: any) => void;
  private audioRef: React.RefObject<HTMLAudioElement>;

  constructor(onEvent: (event: any) => void, audioRef: React.RefObject<HTMLAudioElement>) {
    this.onEvent = onEvent;
    this.audioRef = audioRef;
  }

  async init() {
    // IMPORTANT: Use your deployed edge function websocket endpoint!
    this.ws = new WebSocket(
      "wss://takieoywodunrjoteclz.functions.supabase.co/functions/v1/realtime-chat"
    );

    this.ws.onopen = () => {
      // Start streaming audio as soon as socket opens.
      this.startRecording();
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "response.audio_transcript.delta") {
        this.onEvent(data);
      }
      if (data.type === "response.audio.delta") {
        // Play audio (PCM16 at 24kHz)
        this.playPCM16Audio(data.delta);
        this.onEvent(data);
      }
      if (data.type === "response.audio.done") {
        this.onEvent(data);
      }
      if (data.type === "error") {
        this.onEvent(data);
      }
    };

    this.ws.onerror = (err) => {
      this.onEvent({ type: "error", message: "WebSocket error: " + err });
    };

    this.ws.onclose = () => {
      // Cleanup on close
      this.stopRecording();
      this.onEvent({ type: "closed" });
    };
  }

  private async startRecording() {
    this.recorder = new AudioRecorder((audioData) => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(
          JSON.stringify({
            type: "input_audio_buffer.append",
            audio: encodeAudioForAPI(audioData),
          })
        );
      }
    });
    await this.recorder.start();
  }

  private stopRecording() {
    this.recorder?.stop();
    this.recorder = null;
  }

  disconnect() {
    this.stopRecording();
    if (this.ws) {
      this.ws.close();
    }
    this.ws = null;
  }

  private playPCM16Audio(base64: string) {
    // PCM16 at 24khz to WAV and play
    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    const wav = this.createWavFromPCM(bytes);
    const blob = new Blob([wav.buffer as ArrayBuffer], { type: "audio/wav" });
    const url = URL.createObjectURL(blob);
    const audioElement = this.audioRef.current;
    if (audioElement) {
      audioElement.src = url;
      audioElement.play().catch((e) => {
        // ignore autoplay errors on some browsers
      });
    }
  }

  // Convert PCM16 byte array to proper WAV header + PCM16
  private createWavFromPCM(pcmData: Uint8Array): Uint8Array {
    const sampleRate = 24000;
    const numChannels = 1;
    const bitsPerSample = 16;
    const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
    const blockAlign = (numChannels * bitsPerSample) / 8;
    const dataLength = pcmData.byteLength;

    const buffer = new ArrayBuffer(44 + dataLength);
    const view = new DataView(buffer);

    // ChunkID "RIFF"
    view.setUint32(0, 0x52494646, false);
    // ChunkSize
    view.setUint32(4, 36 + dataLength, true);
    // Format "WAVE"
    view.setUint32(8, 0x57415645, false);
    // Subchunk1ID "fmt "
    view.setUint32(12, 0x666d7420, false);
    // Subchunk1Size
    view.setUint32(16, 16, true);
    // AudioFormat
    view.setUint16(20, 1, true);
    // NumChannels
    view.setUint16(22, numChannels, true);
    // SampleRate
    view.setUint32(24, sampleRate, true);
    // ByteRate
    view.setUint32(28, byteRate, true);
    // BlockAlign
    view.setUint16(32, blockAlign, true);
    // BitsPerSample
    view.setUint16(34, bitsPerSample, true);
    // Subchunk2ID "data"
    view.setUint32(36, 0x64617461, false);
    // Subchunk2Size
    view.setUint32(40, dataLength, true);

    // PCM samples
    new Uint8Array(buffer, 44).set(pcmData);

    return new Uint8Array(buffer);
  }
}

