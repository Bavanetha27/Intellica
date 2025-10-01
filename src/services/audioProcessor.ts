import type { DocumentChunk } from '../types';

export class AudioProcessor {
  private recognition: any = null;

  constructor() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';
    }
  }

  async processAudio(file: File, documentId: string): Promise<DocumentChunk[]> {
    if (!this.recognition) {
      throw new Error('Speech recognition not supported in this browser');
    }

    return new Promise((resolve, reject) => {
      const audioUrl = URL.createObjectURL(file);
      const audioElement = new Audio(audioUrl);
      const transcripts: string[] = [];
      const timestamps: number[] = [];

      this.recognition.onresult = (event: any) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            const transcript = event.results[i][0].transcript;
            transcripts.push(transcript);
            timestamps.push(audioElement.currentTime);
          }
        }
      };

      this.recognition.onerror = (event: any) => {
        URL.revokeObjectURL(audioUrl);
        reject(new Error(`Speech recognition error: ${event.error}`));
      };

      audioElement.onended = () => {
        this.recognition.stop();

        const chunks: DocumentChunk[] = transcripts.map((transcript, index) => ({
          id: crypto.randomUUID(),
          documentId,
          content: transcript,
          chunkIndex: index,
          timestamp: timestamps[index],
          metadata: {
            source: 'audio',
            audioFile: file.name,
            duration: audioElement.duration,
          },
        }));

        URL.revokeObjectURL(audioUrl);
        resolve(chunks);
      };

      audioElement.onerror = () => {
        this.recognition.stop();
        URL.revokeObjectURL(audioUrl);
        reject(new Error('Failed to load audio file'));
      };

      this.recognition.start();
      audioElement.play();
    });
  }

  async transcribeAudioManually(audioBlob: Blob, documentId: string): Promise<DocumentChunk[]> {
    return new Promise((resolve, reject) => {
      if (!this.recognition) {
        reject(new Error('Speech recognition not supported'));
        return;
      }

      const transcripts: string[] = [];

      this.recognition.onresult = (event: any) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            transcripts.push(event.results[i][0].transcript);
          }
        }
      };

      this.recognition.onend = () => {
        const chunks: DocumentChunk[] = transcripts.map((transcript, index) => ({
          id: crypto.randomUUID(),
          documentId,
          content: transcript,
          chunkIndex: index,
          metadata: {
            source: 'audio-recording',
          },
        }));

        resolve(chunks);
      };

      this.recognition.onerror = (event: any) => {
        reject(new Error(`Speech recognition error: ${event.error}`));
      };

      this.recognition.start();
    });
  }

  isSupported(): boolean {
    return this.recognition !== null;
  }
}

export const audioProcessor = new AudioProcessor();
