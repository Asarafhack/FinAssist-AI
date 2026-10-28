# Voice AI design proposal (not implemented)

This document describes a future integration path. The current repository implements text chat only; it does not implement WebRTC, telephony, streaming STT, streaming TTS, or integrations with Deepgram, LiveKit, ElevenLabs, or Cartesia.

## Proposed pipeline

```text
Browser / phone audio
  -> transport and session manager (WebRTC or provider telephony)
  -> streaming speech-to-text (STT)
  -> turn detection + interruption handling
  -> safety routing and retrieval-grounded response service
  -> streaming text-to-speech (TTS)
  -> audio playback / telephony stream
```

## Latency budget
Measure separately: network/transport, endpointing, STT finalization, retrieval, LLM time-to-first-token if a model is added, TTS first-audio latency, and playback buffering. Optimize for time to first useful response rather than only total completion time. Establish p50/p95 targets from real provider benchmarks and product requirements; do not assume fixed vendor latency.

## Failure behavior
- STT uncertainty: ask the caller to repeat or switch to keypad/text input.
- Provider timeout: return a short transparent retry message or transfer to a human queue.
- Retrieval miss: clarify or escalate; do not improvise financial facts.
- TTS failure: offer text or a verified handoff.
- Caller interruption: cancel stale generation and prioritize the latest turn.
- Sensitive intent: invoke the same safety/escalation policy used by text chat.

## Future implementation checklist
- Select providers and review data-processing terms.
- Implement session lifecycle, streaming, cancellation, retries, and idempotency.
- Measure language/accent performance with consented representative audio.
- Evaluate transcription error, task completion, escalation correctness, latency, and cost.
- Secure provider credentials and avoid recording audio unless explicitly required and governed.
- Test failure injection, concurrent sessions, and graceful fallback.
