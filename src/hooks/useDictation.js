import { useCallback, useEffect, useRef, useState } from "react";

const SpeechRecognitionCtor =
  typeof window !== "undefined"
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null;

const SILENCE_TIMEOUT_MS = 8000; // auto-stop if no speech is detected for this long
const MAX_RECORDING_MS = 10 * 60 * 1000; // hard cap per recording session

// Wraps the browser's SpeechRecognition API with two safety nets: a rolling
// silence timeout (cancels a session that isn't picking up any speech) and
// an absolute duration cap, so a stuck/forgotten mic can't run forever.
export function useDictation() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [status, setStatus] = useState("");

  const recognitionRef = useRef(null);
  const finalTextRef = useRef("");
  const silenceTimerRef = useRef(null);
  const maxTimerRef = useRef(null);
  const heardSpeechRef = useRef(false);

  const isSupported = Boolean(SpeechRecognitionCtor);

  const clearTimers = useCallback(() => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (maxTimerRef.current) clearTimeout(maxTimerRef.current);
    silenceTimerRef.current = null;
    maxTimerRef.current = null;
  }, []);

  const stop = useCallback(
    (message) => {
      clearTimers();
      const recognition = recognitionRef.current;
      if (recognition) {
        recognition.onend = null;
        recognition.onresult = null;
        recognition.onerror = null;
        recognition.stop();
        recognitionRef.current = null;
      }
      setIsRecording(false);
      setStatus(message || "");
    },
    [clearTimers]
  );

  const armSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    silenceTimerRef.current = setTimeout(() => {
      stop(
        heardSpeechRef.current
          ? "Recording stopped after a period of silence."
          : "Recording cancelled — no audio detected."
      );
    }, SILENCE_TIMEOUT_MS);
  }, [stop]);

  const start = useCallback(() => {
    if (!isSupported || recognitionRef.current) return;

    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = navigator.language || "en-US";

    finalTextRef.current = "";
    heardSpeechRef.current = false;
    setTranscript("");
    setStatus("Listening…");
    setIsRecording(true);

    recognition.onresult = (event) => {
      heardSpeechRef.current = true;
      armSilenceTimer();

      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTextRef.current += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }
      setTranscript(finalTextRef.current + interim);
    };

    recognition.onerror = (event) => {
      if (event.error === "no-speech") return; // the silence timer owns this case
      stop(
        event.error === "not-allowed" || event.error === "service-not-allowed"
          ? "Microphone access denied."
          : `Dictation error: ${event.error}`
      );
    };

    recognition.onend = () => {
      // Some browsers end the session on their own (e.g. after a brief
      // pause) even with continuous = true. Restart transparently unless
      // we're the ones who stopped it.
      if (recognitionRef.current !== recognition) return;
      try {
        recognition.start();
      } catch {
        stop();
      }
    };

    recognitionRef.current = recognition;
    armSilenceTimer();
    maxTimerRef.current = setTimeout(() => {
      stop("Recording stopped — reached the 10 minute limit.");
    }, MAX_RECORDING_MS);

    try {
      recognition.start();
    } catch {
      stop("Could not start dictation.");
    }
  }, [isSupported, armSilenceTimer, stop]);

  // Stop on unmount so a lingering recognition session doesn't keep the mic hot.
  useEffect(() => () => stop(), [stop]);

  return { isSupported, isRecording, transcript, status, start, stop };
}
