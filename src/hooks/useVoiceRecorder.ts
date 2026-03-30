"use client";

import { useState, useRef, useCallback } from "react";

export type RecordingState =
  | "idle"
  | "recording"
  | "processing"
  | "success"
  | "error";

interface ReminderResult {
  title: string;
  date: string;
  time: string | null;
  notes: string | null;
}

interface UseVoiceRecorderReturn {
  state: RecordingState;
  elapsedTime: number;
  result: ReminderResult | null;
  errorMessage: string | null;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  cancelRecording: () => void;
  reset: () => void;
}

const MAX_RECORDING_TIME = 30_000;

const SILENCE_THRESHOLD = 0.015;

const MIN_VOICE_SAMPLES = 3;

const MIN_PEAK_VOLUME = 0.04;

export function useVoiceRecorder(): UseVoiceRecorderReturn {
  const [state, setState] = useState<RecordingState>("idle");
  const [elapsedTime, setElapsedTime] = useState(0);
  const [result, setResult] = useState<ReminderResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const maxTimerRef = useRef<NodeJS.Timeout | null>(null);
  const cancelledRef = useRef(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const voiceSamplesRef = useRef(0);
  const peakVolumeRef = useRef(0);
  const silenceCheckRef = useRef<NodeJS.Timeout | null>(null);

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (maxTimerRef.current) {
      clearTimeout(maxTimerRef.current);
      maxTimerRef.current = null;
    }
    if (silenceCheckRef.current) {
      clearInterval(silenceCheckRef.current);
      silenceCheckRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    analyserRef.current = null;
    mediaRecorderRef.current = null;
    chunksRef.current = [];
    voiceSamplesRef.current = 0;
    peakVolumeRef.current = 0;
    setElapsedTime(0);
  }, []);

  const vibrate = useCallback((pattern: number | number[]) => {
    if (navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  }, []);

  const sendAudio = useCallback(
    async (blob: Blob) => {
      console.log("[meLembrAI] Enviando áudio...", blob.size, "bytes");
      setState("processing");

      try {
        const formData = new FormData();
        formData.append("audio", blob, `recording-${Date.now()}.webm`);

        const response = await fetch("/api/reminder-from-audio", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();
        console.log("[meLembrAI] Resposta da API:", data);

        if (!response.ok || !data.success) {
          throw new Error(data.error || "Não foi possível processar o áudio");
        }

        setResult(data.reminder);
        setState("success");
        vibrate(100);

        setTimeout(() => {
          setState("idle");
          setResult(null);
        }, 4000);
      } catch (error) {
        console.error("[meLembrAI] Erro:", error);
        const message =
          error instanceof Error
            ? error.message
            : "Não foi possível entender o lembrete. Tente novamente.";
        setErrorMessage(message);
        setState("error");
        vibrate([100, 50, 100]);

        setTimeout(() => {
          setState("idle");
          setErrorMessage(null);
        }, 3000);
      }
    },
    [vibrate]
  );

  const startRecording = useCallback(async () => {
    try {
      setResult(null);
      setErrorMessage(null);
      cancelledRef.current = false;
      voiceSamplesRef.current = 0;
      peakVolumeRef.current = 0;

      console.log("[meLembrAI] Solicitando microfone...");

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      console.log("[meLembrAI] Microfone autorizado");

      streamRef.current = stream;
      chunksRef.current = [];

      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);

      const bandpass = audioContext.createBiquadFilter();
      bandpass.type = "bandpass";
      bandpass.frequency.value = 1000;
      bandpass.Q.value = 0.5;
      source.connect(bandpass);

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 1024;
      bandpass.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Float32Array(analyser.fftSize);
      silenceCheckRef.current = setInterval(() => {
        if (!analyserRef.current) return;
        analyserRef.current.getFloatTimeDomainData(dataArray);

        let sum = 0;
        let peak = 0;
        for (let i = 0; i < dataArray.length; i++) {
          const abs = Math.abs(dataArray[i]);
          sum += dataArray[i] * dataArray[i];
          if (abs > peak) peak = abs;
        }
        const rms = Math.sqrt(sum / dataArray.length);

        if (rms > peakVolumeRef.current) {
          peakVolumeRef.current = rms;
        }

        if (rms > SILENCE_THRESHOLD) {
          voiceSamplesRef.current++;
        }
      }, 100);

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "audio/mp4";

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const voiceSamples = voiceSamplesRef.current;
        const peakVolume = peakVolumeRef.current;

        console.log(
          "[meLembrAI] Gravação parou.",
          "Cancelled:", cancelledRef.current,
          "Voice samples:", voiceSamples,
          "Peak volume:", peakVolume.toFixed(4),
          "Chunks:", chunksRef.current.length
        );

        if (cancelledRef.current) {
          cleanup();
          return;
        }

        const hasVoice =
          voiceSamples >= MIN_VOICE_SAMPLES && peakVolume >= MIN_PEAK_VOLUME;

        if (!hasVoice) {
          console.log(
            "[meLembrAI] Voz insuficiente. Samples:",
            voiceSamples,
            "Peak:",
            peakVolume.toFixed(4)
          );

          let msg = "Não detectei sua voz. ";
          if (peakVolume > SILENCE_THRESHOLD) {
            msg += "Há muito ruído de fundo. Tente em um lugar mais silencioso.";
          } else {
            msg += "Segure o botão e fale mais perto do microfone.";
          }

          setErrorMessage(msg);
          setState("error");
          cleanup();
          setTimeout(() => {
            setState("idle");
            setErrorMessage(null);
          }, 3000);
          return;
        }

        const blob = new Blob(chunksRef.current, { type: mimeType });
        console.log("[meLembrAI] Blob criado:", blob.size, "bytes");

        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        if (maxTimerRef.current) {
          clearTimeout(maxTimerRef.current);
          maxTimerRef.current = null;
        }
        if (silenceCheckRef.current) {
          clearInterval(silenceCheckRef.current);
          silenceCheckRef.current = null;
        }
        if (audioContextRef.current) {
          audioContextRef.current.close().catch(() => {});
          audioContextRef.current = null;
        }
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
        mediaRecorderRef.current = null;
        setElapsedTime(0);

        if (blob.size > 0) {
          sendAudio(blob);
        } else {
          setState("idle");
        }
      };

      mediaRecorder.start(250);
      setState("recording");
      vibrate(30);
      console.log("[meLembrAI] Gravando...");

      const startTime = Date.now();
      timerRef.current = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 200);

      maxTimerRef.current = setTimeout(() => {
        if (
          mediaRecorderRef.current &&
          mediaRecorderRef.current.state === "recording"
        ) {
          mediaRecorderRef.current.stop();
        }
      }, MAX_RECORDING_TIME);
    } catch (error) {
      console.error("[meLembrAI] Erro ao iniciar gravação:", error);
      setErrorMessage(
        "Permissão de microfone negada. Ative nas configurações."
      );
      setState("error");
      setTimeout(() => {
        setState("idle");
        setErrorMessage(null);
      }, 3000);
    }
  }, [cleanup, sendAudio, vibrate]);

  const stopRecording = useCallback(() => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      vibrate(30);
      mediaRecorderRef.current.stop();
    }
  }, [vibrate]);

  const cancelRecording = useCallback(() => {
    cancelledRef.current = true;
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
    }
    cleanup();
    setState("idle");
    vibrate([50, 30, 50]);
  }, [cleanup, vibrate]);

  const reset = useCallback(() => {
    cleanup();
    setState("idle");
    setResult(null);
    setErrorMessage(null);
  }, [cleanup]);

  return {
    state,
    elapsedTime,
    result,
    errorMessage,
    startRecording,
    stopRecording,
    cancelRecording,
    reset,
  };
}