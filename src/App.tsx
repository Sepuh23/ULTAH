import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Heart, 
  Mail, 
  Lock, 
  Gift, 
  Smile, 
  Volume2, 
  VolumeX, 
  Flame, 
  Check, 
  RotateCcw, 
  Camera, 
  MessageSquare, 
  Coffee, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft, 
  Music, 
  Volume1,
  Gamepad2,
  Users
} from "lucide-react";

// Types for polaroid images
interface PolaroidPhoto {
  url: string;
  caption: string;
}

// Custom sound synth using Web Audio API
class AudioService {
  private ctx: AudioContext | null = null;
  private melodyTimer: any = null;
  public isMuted: boolean = false;
  public isMusicPlaying: boolean = true;
  private currentNotes: OscillatorNode[] = [];
  private musicVolumeNode: GainNode | null = null;
  private currentScreenPlaying: string = "";

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  // Play a cute short "pop" button click sound (0.05 seconds oscillator)
  public playPop() {
    this.init();
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(450, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.05);
    
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    
    osc.start(now);
    osc.stop(now + 0.05);
  }

  // Play a celebration "ding"
  public playDing() {
    this.init();
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    
    notes.forEach((freq, i) => {
      if (!this.ctx) return;
      const t = now + i * 0.08;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, t);
      
      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      
      osc.start(t);
      osc.stop(t + 0.3);
    });
  }

  // Play "ding-ding-ding" (3 rising notes) for correct PIN
  public playPinCorrect() {
    this.init();
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    
    notes.forEach((freq, i) => {
      if (!this.ctx) return;
      const t = now + i * 0.09;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, t);
      
      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
      
      osc.start(t);
      osc.stop(t + 0.25);
    });
  }

  // Play "bzzzt" low noise buzzer for incorrect PIN
  public playPinWrong() {
    this.init();
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(80, now);
    osc.frequency.linearRampToValueAtTime(65, now + 0.28);
    
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.setValueAtTime(0.18, now + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
    
    osc.start(now);
    osc.stop(now + 0.28);
  }

  // Play a "whoops" error sound
  public playWhoops() {
    this.playPinWrong();
  }

  // Play camera shutter "click" sound for sliding polaroids
  public playCameraClick() {
    this.init();
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;
    
    // Crisp tick
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.connect(gain1);
    gain1.connect(this.ctx.destination);
    osc1.type = "triangle";
    osc1.frequency.setValueAtTime(1400, now);
    gain1.gain.setValueAtTime(0.06, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
    osc1.start(now);
    osc1.stop(now + 0.02);

    // Prompt drop shut
    const t2 = now + 0.04;
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.connect(gain2);
    gain2.connect(this.ctx.destination);
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(550, t2);
    gain2.gain.setValueAtTime(0.06, t2);
    gain2.gain.exponentialRampToValueAtTime(0.001, t2 + 0.035);
    osc2.start(t2);
    osc2.stop(t2 + 0.035);
  }

  // Play "whoosh" sound (frequency rising from 200Hz to 800Hz)
  public playWhoosh() {
    this.init();
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.35);
    
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.12, now + 0.12);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    
    osc.start(now);
    osc.stop(now + 0.35);
  }

  // Play "poof" + crackling pops for candle extinguished
  public playPoof() {
    this.init();
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;
    
    // Low pop poof
    const oscPoof = this.ctx.createOscillator();
    const gainPoof = this.ctx.createGain();
    oscPoof.connect(gainPoof);
    gainPoof.connect(this.ctx.destination);
    oscPoof.type = "sine";
    oscPoof.frequency.setValueAtTime(140, now);
    oscPoof.frequency.exponentialRampToValueAtTime(30, now + 0.3);
    gainPoof.gain.setValueAtTime(0.15, now);
    gainPoof.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    
    oscPoof.start(now);
    oscPoof.stop(now + 0.3);

    // Micro crackles
    for (let i = 0; i < 5; i++) {
      const crackleTime = now + 0.04 + Math.random() * 0.22;
      const oscCrack = this.ctx.createOscillator();
      const gainCrack = this.ctx.createGain();
      oscCrack.connect(gainCrack);
      gainCrack.connect(this.ctx.destination);
      oscCrack.type = "triangle";
      oscCrack.frequency.setValueAtTime(900 + Math.random() * 1600, crackleTime);
      gainCrack.gain.setValueAtTime(0.05, crackleTime);
      gainCrack.gain.exponentialRampToValueAtTime(0.001, crackleTime + 0.012);
      oscCrack.start(crackleTime);
      oscCrack.stop(crackleTime + 0.012);
    }
  }

  // Play "rip" tearing noise + "tadaa" brassy chord for gifts
  public playRipTadaa() {
    this.init();
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;
    
    // Tear rips
    for (let i = 0; i < 7; i++) {
      const ripTime = now + i * 0.025;
      const oscRip = this.ctx.createOscillator();
      const gainRip = this.ctx.createGain();
      oscRip.connect(gainRip);
      gainRip.connect(this.ctx.destination);
      oscRip.type = "sawtooth";
      oscRip.frequency.setValueAtTime(160 + Math.random() * 200, ripTime);
      gainRip.gain.setValueAtTime(0.06, ripTime);
      gainRip.gain.exponentialRampToValueAtTime(0.001, ripTime + 0.02);
      oscRip.start(ripTime);
      oscRip.stop(ripTime + 0.02);
    }
    
    // Tadaa brass trumpet fanfare after rip
    const tadaTime = now + 0.2;
    const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5 major chord
    notes.forEach((freq, idx) => {
      const playTime = tadaTime + (idx < 3 ? 0 : 0.12);
      const isLast = idx === 3;
      const duration = isLast ? 0.5 : 0.12;
      
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(freq, playTime);
      
      gain.gain.setValueAtTime(0.06, playTime);
      gain.gain.exponentialRampToValueAtTime(0.001, playTime + duration);
      
      osc.start(playTime);
      osc.stop(playTime + duration);
    });
  }

  // Play "boing" bouncing oscillator (frequency sweeps up and down)
  public playBoing() {
    this.init();
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(420, now + 0.1);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.26);
    
    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);
    
    osc.start(now);
    osc.stop(now + 0.26);
  }

  public playClick() {
    this.playPop();
  }

  // Play dynamic slide-specific backing melodies with fade effects
  public playBackgroundMelody(screen: string) {
    this.init();
    if (this.isMuted || !this.isMusicPlaying || !this.ctx) return;

    // Check if the current melody is already up to avoid resets
    if (this.currentScreenPlaying === screen && this.melodyTimer) {
      return;
    }

    const now = this.ctx.currentTime;
    const oldVolumeNode = this.musicVolumeNode;

    // 1. Fade-out the previous background track (0.2s duration)
    if (oldVolumeNode) {
      try {
        oldVolumeNode.gain.cancelScheduledValues(now);
        oldVolumeNode.gain.setValueAtTime(oldVolumeNode.gain.value, now);
        oldVolumeNode.gain.linearRampToValueAtTime(0, now + 0.2);
        
        if (this.melodyTimer) {
          clearTimeout(this.melodyTimer);
          this.melodyTimer = null;
        }

        const oldNotesToClose = [...this.currentNotes];
        this.currentNotes = [];
        setTimeout(() => {
          oldNotesToClose.forEach(note => {
            try { note.stop(); } catch(e) {}
          });
          try { oldVolumeNode.disconnect(); } catch(e) {}
        }, 220);
      } catch (err) {
        console.error("Fadeout error:", err);
      }
    } else {
      if (this.melodyTimer) {
        clearTimeout(this.melodyTimer);
        this.melodyTimer = null;
      }
      this.currentNotes.forEach(note => {
        try { note.stop(); } catch(e) {}
      });
      this.currentNotes = [];
    }

    this.currentScreenPlaying = screen;

    // 2. Prepare the new volume node starting from absolute zero
    const newVolumeNode = this.ctx.createGain();
    newVolumeNode.gain.setValueAtTime(0, now);
    newVolumeNode.connect(this.ctx.destination);
    this.musicVolumeNode = newVolumeNode;

    let tempo = 120;
    let type: OscillatorType = "sine";
    let notes: { f: number; h?: number; d?: number }[] = [];
    let releaseMultiplier = 0.9;
    let targetVolume = 0.08;

    // Polyphonic Beautiful "Happy Birthday To You" notes definitions
    // C4=261.63, D4=293.66, E4=329.63, F4=349.23, G4=392.00, A4=440.00, Bb4=466.16, C5=523.25, D5=587.33, E5=659.25
    const richHappyBirthdayMelody = [
      { f: 261.63, h: 130.81, d: 0.5 }, // Hap- (C4, C3)
      { f: 261.63, d: 0.5 },            // -py (C4)
      { f: 293.66, h: 174.61, d: 1.0 }, // Birth- (D4, F3)
      { f: 261.63, d: 1.0 },            // -day (C4)
      { f: 349.23, h: 261.63, d: 1.0 }, // to (F4, C4)
      { f: 329.63, h: 130.81, d: 2.0 }, // you (E4, C3)
      
      { f: 261.63, h: 130.81, d: 0.5 }, // Hap-
      { f: 261.63, d: 0.5 },            // -py
      { f: 293.66, h: 196.00, d: 1.0 }, // Birth- (D4, G3)
      { f: 261.63, d: 1.0 },            // -day (C4)
      { f: 392.00, h: 293.66, d: 1.0 }, // to (G4, G4)
      { f: 349.23, h: 174.61, d: 2.0 }, // you (F4, F3)
      
      { f: 261.63, h: 174.61, d: 0.5 }, // Hap-
      { f: 261.63, d: 0.5 },            // -py
      { f: 523.25, h: 349.23, d: 1.0 }, // dear (C5, F4)
      { f: 440.00, h: 261.63, d: 1.0 }, // Bes- (A4, C4)
      { f: 349.23, h: 174.61, d: 1.0 }, // -tie (F4, F3)
      { f: 329.63, h: 130.81, d: 1.0 }, // (E4, C3)
      { f: 293.66, h: 146.83, d: 2.0 }, // (D4, D3)
      
      { f: 466.16, h: 233.08, d: 0.5 }, // Hap- (A#4, A#3)
      { f: 466.16, d: 0.5 },            // -py
      { f: 440.00, h: 349.23, d: 1.0 }, // Birth- (A4, F4)
      { f: 349.23, h: 261.63, d: 1.0 }, // -day (F4, C4)
      { f: 392.00, h: 196.00, d: 1.0 }, // to (G4, G3)
      { f: 349.23, h: 130.81, d: 2.0 }  // you (F4, C3)
    ];

    switch (screen) {
      case "envelope":
        tempo = 110;
        type = "sine";
        // Rich happy birthday music-box vibe right at the start
        notes = richHappyBirthdayMelody;
        releaseMultiplier = 1.1;
        targetVolume = 0.085;
        break;
      case "pin":
        tempo = 100;
        type = "sawtooth";
        // Mystery minimal vibe: A3, G3, A2, F3
        notes = [
          { f: 220.00 }, { f: 196.00 }, { f: 220.00 }, { f: 174.61 },
          { f: 196.00 }, { f: 174.61 }, { f: 220.00 }, { f: 164.81 }
        ];
        releaseMultiplier = 1.3;
        targetVolume = 0.04;
        break;
      case "tease":
        tempo = 140;
        type = "sine";
        // Silly/playful jumps with custom frequency boing
        notes = [
          { f: 261.63 }, { f: 349.23 }, { f: 415.30 }, { f: 392.00 },
          { f: 349.23 }, { f: 261.63 }, { f: 293.66 }, { f: 311.13 }
        ];
        targetVolume = 0.095;
        break;
      case "photos":
        tempo = 90;
        type = "sine";
        // Nostalgic warm pentatonic
        notes = [
          { f: 349.23 }, { f: 440.00 }, { f: 523.25 }, { f: 587.33 },
          { f: 523.25 }, { f: 440.00 }, { f: 392.00 }, { f: 349.23 }
        ];
        releaseMultiplier = 1.25;
        targetVolume = 0.11;
        break;
      case "candle":
        tempo = 160;
        type = "sawtooth";
        // Tense/suspense fast chromatics
        notes = [
          { f: 220.00 }, { f: 233.08 }, { f: 220.00 }, { f: 233.08 },
          { f: 293.66 }, { f: 277.18 }, { f: 261.63 }, { f: 246.94 }
        ];
        releaseMultiplier = 0.6;
        targetVolume = 0.035;
        break;
      case "letter":
        tempo = 80;
        type = "sine";
        // Deeply acoustic heartfelt slow version of Happy Birthday
        notes = richHappyBirthdayMelody;
        releaseMultiplier = 1.45;
        targetVolume = 0.11;
        break;
      case "gift":
        tempo = 180;
        type = "triangle";
        // Tadaa brass-like bouncy fast motifs
        notes = [
          { f: 261.63 }, { f: 329.63 }, { f: 392.00 }, { f: 523.25 },
          { f: 659.25 }, { f: 523.25 }, { f: 392.00 }, { f: 329.63 }
        ];
        releaseMultiplier = 0.85;
        targetVolume = 0.088;
        break;
      case "quiz":
        tempo = 130;
        type = "triangle";
        // Game-show suspenseful syncopated upbeat
        notes = [
          { f: 392.00 }, { f: 392.00 }, { f: 523.25 }, { f: 440.00 },
          { f: 392.00 }, { f: 349.23 }, { f: 329.63 }, { f: 293.66 }
        ];
        releaseMultiplier = 0.82;
        targetVolume = 0.075;
        break;
      case "final":
        tempo = 132;
        type = "triangle";
        // Brilliant retro carnival celebratory chiptune Happy Birthday with multi-voice arpeggio chords!
        notes = richHappyBirthdayMelody;
        releaseMultiplier = 0.95;
        targetVolume = 0.1;
        break;
    }

    // 3. Fade-in the new volume node in exactly 0.2 seconds
    newVolumeNode.gain.linearRampToValueAtTime(targetVolume, now + 0.2);

    let noteIndex = 0;
    const noteInterval = (60 / tempo) * 1000;

    const playNextNote = () => {
      if (this.isMuted || !this.isMusicPlaying || !this.ctx || this.currentScreenPlaying !== screen) return;

      if (!notes || notes.length === 0) return;
      const item = notes[noteIndex];
      if (!item) {
        // Safe recovery or reset if index went out of bounds
        noteIndex = 0;
        return;
      }
      const durMultiplier = item.d || 1.0;
      const duration = noteInterval * durMultiplier;

      const playOsc = (frequency: number, volScale: number = 1.0) => {
        if (!this.ctx || frequency <= 0) return;
        try {
          const oscNow = this.ctx.currentTime;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc.connect(gain);
          gain.connect(newVolumeNode);

          osc.type = type;

          // Slide-specific comic effect for tease screen
          if (screen === "tease" && noteIndex % 4 === 3) {
            osc.frequency.setValueAtTime(frequency, oscNow);
            osc.frequency.exponentialRampToValueAtTime(frequency * 1.7, oscNow + (duration / 1000) * 0.4);
            osc.frequency.exponentialRampToValueAtTime(frequency, oscNow + (duration / 1000) * 0.82);
          } else {
            osc.frequency.setValueAtTime(frequency, oscNow);
          }

          gain.gain.setValueAtTime(0.24 * volScale, oscNow);
          gain.gain.exponentialRampToValueAtTime(0.001, oscNow + (duration / 1000) * releaseMultiplier);

          osc.start(oscNow);
          osc.stop(oscNow + (duration / 1000) * releaseMultiplier);
          this.currentNotes.push(osc);

          setTimeout(() => {
            this.currentNotes = this.currentNotes.filter(n => n !== osc);
          }, duration * 2.2);
        } catch (err) {
          console.error("Audio Synthesis error:", err);
        }
      };

      if (item.f > 0) {
        // Play lead melody note
        playOsc(item.f, 1.0);
      }
      if (item.h && item.h > 0) {
        // Play harmony/accompaniment chords (slightly quieter for perfect background blend)
        playOsc(item.h, 0.48);
      }

      noteIndex = (noteIndex + 1) % notes.length;
      this.melodyTimer = setTimeout(playNextNote, duration);
    };

    playNextNote();
  }

  public stopBackgroundMelody() {
    if (this.melodyTimer) {
      clearTimeout(this.melodyTimer);
      this.melodyTimer = null;
    }
    this.currentNotes.forEach(note => {
      try { note.stop(); } catch(e) {}
    });
    this.currentNotes = [];
    if (this.musicVolumeNode) {
      try { this.musicVolumeNode.disconnect(); } catch (e) {}
      this.musicVolumeNode = null;
    }
    this.currentScreenPlaying = "";
  }
}

// Single audio manager instance
const audio = new AudioService();

export default function App() {
  // Screens state
  const [screen, setScreen] = useState<"envelope" | "pin" | "tease" | "photos" | "candle" | "letter" | "gift" | "quiz" | "final">("envelope");
  
  // Custom interactive variables
  const [pin, setPin] = useState<string>("");
  const [pinError, setPinError] = useState<string>("");
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isMusicOn, setIsMusicOn] = useState<boolean>(true);
  const [teaseCount, setTeaseCount] = useState<number>(0);
  const [teaseMessage, setTeaseMessage] = useState<string>("");
  const [photoIndex, setPhotoIndex] = useState<number>(0);
  const [candleProgress, setCandleProgress] = useState<number>(0);
  const [candleBlown, setCandleBlown] = useState<boolean>(false);
  const [selectedGift, setSelectedGift] = useState<number | null>(null);
  const [quizEscapedCount, setQuizEscapedCount] = useState<number>(0);
  const [quizSuccess, setQuizSuccess] = useState<boolean>(false);
  const [noButtonPos, setNoButtonPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  
  // Mascot "Creamy" States
  const [creamyExpression, setCreamyExpression] = useState<"cool" | "laugh" | "angry" | "smile" | "sleeping" | "hearts">("smile");
  const [creamyBubble, setCreamyBubble] = useState<string>("Buka kado & amplopnya bray!");
  const [isIdle, setIsIdle] = useState<boolean>(false);
  const [confetti, setConfetti] = useState<Array<{ id: number; left: number; color: string; duration: number; size: number }>>([]);
  
  // Refs
  const idleTimerRef = useRef<any>(null);
  const audioContextStartedRef = useRef<boolean>(false);
  const microphoneStreamRef = useRef<MediaStream | null>(null);
  const micAnalyserRef = useRef<any>(null);

  // Unsplash cozy pictures chosen carefully to convey friendship & warmth without romance
  const photos: PolaroidPhoto[] = [
    {
      url: "/images/polaroid_1.jpg",
      caption: "Momen kocak kita pas ketawa sampe nangis 🤣"
    },
    {
      url: "/images/polaroid_2.jpg",
      caption: "Nongkrong absurd sambil bahas teori konspirasi duniawi ☕"
    },
    {
      url: "/images/polaroid_3.jpg",
      caption: "Ngemil + ngobrol asyik ga kerasa ampe lupa waktu 🤝"
    }
  ];

  // Confetti generator
  const triggerConfetti = () => {
    const colors = ["#FFF9F0", "#FDF3E7", "#D4A373", "#F5C4A1", "#A7C957", "#F4D35E", "#e11d48"];
    const newConfetti = Array.from({ length: 45 }).map((_, i) => ({
      id: Date.now() + i,
      left: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      duration: 2 + Math.random() * 3,
      size: 8 + Math.random() * 12
    }));
    setConfetti(newConfetti);
    
    // Clear out confetti after 5 seconds to reduce memory footprint
    setTimeout(() => {
      setConfetti([]);
    }, 5000);
  };

  // Idle Timer handlers
  const resetIdleTimer = useCallback(() => {
    setIsIdle(false);
    if (creamyExpression === "sleeping") {
      setCreamyExpression("smile");
      setCreamyBubble("Ah, halo lagi bestie! Aku ketiduran tadi 🧸");
    }
    
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }
    
    idleTimerRef.current = setTimeout(() => {
      setIsIdle(true);
      setCreamyExpression("sleeping");
      setCreamyBubble("Zzz... ngantuk euy nongkrong mulu...");
    }, 12000); // Wait 12 seconds
  }, [creamyExpression]);

  // Handle global mouse/touch movements for idle state tracking
  useEffect(() => {
    window.addEventListener("mousemove", resetIdleTimer);
    window.addEventListener("keydown", resetIdleTimer);
    window.addEventListener("touchstart", resetIdleTimer);
    
    resetIdleTimer();
    
    return () => {
      window.removeEventListener("mousemove", resetIdleTimer);
      window.removeEventListener("keydown", resetIdleTimer);
      window.removeEventListener("touchstart", resetIdleTimer);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [resetIdleTimer]);

  // Audio start trigger on interaction
  const triggerAudioInit = (overrideScreen?: string) => {
    if (!audioContextStartedRef.current) {
      audioContextStartedRef.current = true;
    }
    if (!isMuted && isMusicOn) {
      audio.playBackgroundMelody(overrideScreen || screen);
    }
  };

  // Toggle Mute
  const handleToggleMute = () => {
    const nextMute = !isMuted;
    audio.isMuted = nextMute;
    setIsMuted(nextMute);
    if (nextMute) {
      audio.stopBackgroundMelody();
    } else {
      if (isMusicOn) {
        audio.playBackgroundMelody(screen);
      }
    }
  };

  // Mascot Click Quote responses
  const handleMascotClick = () => {
    audio.playPop();
    const quotes = [
      "Halo Bestie! Gaskeun terus ya! 🔥",
      "Eh, jangan lupa traktiran seblak dilarang hemat! 🍲",
      "Kamu temen terbaik seantero jagat sigma! 🪐",
      "Semoga terus bestiean ampe tua peot ya! 🤜🤛",
      "Cupcake nya jangan cuma dipandangi, buruan ditiup! 🎂",
      "Kado nomor berapa yang bakal kamu pilih? 👀",
      "Kalau dipikir-pikir kita emang kocak banget wkwk 😂",
      "Aku ngirim salam hangat membara nih!"
    ];
    const rand = quotes[Math.floor(Math.random() * quotes.length)];
    setCreamyBubble(rand);
    setCreamyExpression(creamyExpression === "laugh" ? "cool" : "laugh");
  };

  // Expression modifier based on screen
  useEffect(() => {
    switch (screen) {
      case "envelope":
        setCreamyExpression("smile");
        setCreamyBubble("Halo Bestie! ✨ Ada paket misteri buat lu nih!");
        break;
      case "pin":
        setCreamyExpression("cool");
        setCreamyBubble("Masukin PIN nya ya, kodenya rahasia bgt! 🤫");
        break;
      case "tease":
        setCreamyExpression("smile");
        setCreamyBubble("Ingat tanggal ultah ga tuh? Kuy jawab! 😏");
        break;
      case "photos":
        setCreamyExpression("cool");
        setCreamyBubble("Foto-foto aib kita gemes kan? 😂🕶️");
        break;
      case "candle":
        setCreamyExpression("laugh");
        setCreamyBubble("Asik ada kue! Cepetan ditiup apinya bray! 🎂");
        break;
      case "letter":
        setCreamyExpression("hearts");
        setCreamyBubble("Terharu ga dapet surat tulus gini? 🥺🌷");
        break;
      case "gift":
        setCreamyExpression("laugh");
        setCreamyBubble("Pilih kadonya! Sumpah ga zonk kok! 🎁");
        break;
      case "quiz":
        setCreamyExpression("cool");
        setCreamyBubble("Uji kesetiaan bestie kita dulu donk! 🤜🤛");
        break;
      case "final":
        setCreamyExpression("hearts");
        setCreamyBubble("HBD Bestie! Gaskeun share ke WA ya! 🚀");
        break;
    }
  }, [screen]);

  // Synchronize adaptive background music to screen changes smoothly
  useEffect(() => {
    if (audioContextStartedRef.current && isMusicOn && !isMuted) {
      audio.playBackgroundMelody(screen);
    }
  }, [screen, isMusicOn, isMuted]);

  // PIN controls
  const handlePinInput = (num: string) => {
    audio.playPop();
    setPinError("");
    if (pin.length < 4) {
      const nextPin = pin + num;
      setPin(nextPin);
      
      if (nextPin.length === 4) {
        if (nextPin === "2112") {
          setTimeout(() => {
            audio.playPinCorrect();
            setScreen("tease");
            setPin("");
          }, 400);
        } else {
          setTimeout(() => {
            audio.playPinWrong();
            setPinError("Waduh bestie, PINnya salah tuh! Coba lagi ya! 😜");
            setCreamyExpression("angry");
            setCreamyBubble("Yaelah, masa lupa PIN? Tanya gih! 😤");
            setPin("");
          }, 350);
        }
      }
    }
  };

  const clearLastPinDigit = () => {
    audio.playPop();
    setPinError("");
    setPin(prev => prev.slice(0, -1));
  };

  // Teasing stage handler
  const handleTeaseWrong = () => {
    audio.playWhoosh();
    setTeaseCount(prev => prev + 1);
    const messages = [
      "Cuiih masa sih lupaa?! Ulang tahun bestie loe! 😒💔",
      "Yakin cuma hari biasa? Tega banget asli mau nangis nih... 😭",
      "Awas lu ya kalau beneran lupa! Gak gue traktir beneran ntar! 😡🤌",
      "Halah dusta! Klik tombol yang kanan sekarang juga! 🔫🤨"
    ];
    setTeaseMessage(messages[teaseCount % messages.length]);
    setCreamyExpression("angry");
    setCreamyBubble("Heeeh! Masa lupa hari ultah sendiri/bestie?! 😤💥");
  };

  // Microphone detection framework for birthday cake
  const startMicrophoneAudio = () => {
    audio.playPop();
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ audio: true, video: false })
        .then(stream => {
          microphoneStreamRef.current = stream;
          const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
          const ctx = new AudioCtx();
          const source = ctx.createMediaStreamSource(stream);
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 512;
          source.connect(analyser);
          
          micAnalyserRef.current = analyser;
          setCreamyBubble("Wih pinter! Sekarang tiup kenceng-kenceng ke mic! 🎙️");

          const bufferLength = analyser.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);
          
          const detectBlow = () => {
            if (candleBlown || !micAnalyserRef.current) {
              // cancel if blown
              stream.getTracks().forEach(t => t.stop());
              return;
            }
            
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < bufferLength; i++) {
              sum += dataArray[i];
            }
            const average = sum / bufferLength;

            // Blow detection threshold
            if (average > 40) {
              setCandleProgress(prev => {
                const next = prev + 10;
                if (next >= 100) {
                  triggerCandleSuccess();
                  stream.getTracks().forEach(t => t.stop());
                  return 100;
                }
                return next;
              });
            }
            requestAnimationFrame(detectBlow);
          };
          
          detectBlow();
        })
        .catch(err => {
          console.error("Mic access denied", err);
          setCreamyBubble("Yah mic gabisa, tapi gapapa kamu tinggal klik apinya aja! 🔥");
        });
    } else {
      setCreamyBubble("Hape/PC ga support mic, tenang ketuk apinya aja bray!");
    }
  };

  const handleManualFlameBlow = () => {
    if (candleBlown) return;
    audio.playPop();
    setCandleProgress(prev => {
      const next = prev + 15;
      if (next >= 100) {
        triggerCandleSuccess();
        return 100;
      }
      return next;
    });
    setCreamyExpression("laugh");
    setCreamyBubble("Terusss! Dikit lagi apinya mampus! 😂");
  };

  const triggerCandleSuccess = () => {
    setCandleBlown(true);
    audio.playPoof();
    triggerConfetti();
    setCreamyExpression("laugh");
    setCreamyBubble("YEEAAAY! Lilinnya padam! Harapanmu terkabul! ✨🍿");
    
    // Auto progress after 2 seconds
    setTimeout(() => {
      setScreen("letter");
    }, 2500);
  };

  // Gift Select
  const handleGiftSelect = (index: number) => {
    if (selectedGift !== null) return;
    setSelectedGift(index);
    audio.playRipTadaa();
    triggerConfetti();
    setCreamyExpression("laugh");
    
    const giftGained = [
      "Traktir Seblak + Es Teh Manis 🍲",
      "Nobar Film Favorit + Popcorn 🍿",
      "Temenin Nongkrong Seharian + Ngopi ☕"
    ][index];
    
    setCreamyBubble(`Mantap! Voucher ${giftGained.split(" ")[1]} diklaim! 🤜🤛`);
  };

  // Move Loyalty Quiz No Button
  const handleQuizEscape = () => {
    audio.playBoing();
    setQuizEscapedCount(prev => prev + 1);
    
    // Generate relative coordinates inside card container safely
    const containerWidth = 280;
    const containerHeight = 120;
    const randomX = (Math.random() - 0.5) * containerWidth;
    const randomY = (Math.random() - 0.5) * containerHeight;
    
    setNoButtonPos({ x: randomX, y: randomY });
    setCreamyExpression("angry");
    
    const remarks = [
      "Eits ga semudah itu ferguso! 😂",
      "Tangan lu lambat bener bray! 😜",
      "Masih dicoba dong, pantang mundur!",
      "Bestie durhaka mau ngeklik enggak wkwk 🔫",
    ];
    setCreamyBubble(remarks[Math.floor(Math.random() * remarks.length)]);
  };

  const handleQuizSuccess = () => {
    audio.playDing();
    triggerConfetti();
    setQuizSuccess(true);
    setCreamyExpression("hearts");
    setCreamyBubble("Yeeaay! Bestie sejati! Gila terharu bgt gua 🫶😭");
  };

  // WhatsApp reply builder
  const handleSendWhatsApp = () => {
    audio.playPop();
    const giftsText = [
      "Traktir Seblak + Es Teh Manis 🍲",
      "Nobar Film Favorit + Popcorn 🍿",
      "Temenin Nongkrong Seharian + Ngopi ☕"
    ];
    const prize = selectedGift !== null ? giftsText[selectedGift] : "Hadiah Misteri Tergokil";
    const baseMessage = `Makasih bestie! Kejutan ulang tahunnya kocak banget! 🎉🤜🤛 Aku dapet hadiah: "${prize}". Bestie selamanya!`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(baseMessage)}`, "_blank");
  };

  return (
    <div id="full-app-view" className="relative w-full max-w-[420px] min-h-[560px] bg-whipped-cream text-chocolate rounded-[32px] border-4 border-chocolate shadow-[12px_12px_0px_#D4A373] p-6 flex flex-col justify-between overflow-hidden z-10 select-none transition-transform duration-300">
      
      {/* Decorative Floating pattern tokens on margins */}
      <div className="absolute top-4 left-6 text-xl opacity-15 pointer-events-none select-none z-0">🧸</div>
      <div className="absolute top-1/4 right-8 text-2xl opacity-15 pointer-events-none select-none z-0">☕</div>
      <div className="absolute bottom-1/3 left-8 text-xl opacity-15 pointer-events-none select-none z-0">🤝</div>
      <div className="absolute bottom-10 right-28 text-2xl opacity-15 pointer-events-none select-none z-0">🎮</div>
      <div className="absolute top-12 right-12 text-lg opacity-15 pointer-events-none select-none z-0">☕</div>
      <div className="absolute bottom-20 left-16 text-2xl opacity-15 pointer-events-none select-none z-0">🧸</div>

      {/* Confetti canvas items rendering */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
        {confetti.map(c => (
          <div
            key={c.id}
            className="absolute top-0 animate-fall rounded-full"
            style={{
              left: `${c.left}%`,
              backgroundColor: c.color,
              width: `${c.size}px`,
              height: `${c.size}px`,
              "--fall-duration": `${c.duration}s`,
            } as any}
          />
        ))}
      </div>

      {/* HEADER SECTION: Title & Audio controls */}
      <div className="relative w-full flex items-center justify-between border-b-2 border-toffee/15 pb-3 mb-3 z-30">
        <div className="flex items-center gap-1.5 relative select-none" id="app-header-title">
          <Heart className="w-5 h-5 text-soft-peach fill-soft-peach animate-pulse" />
          <span className="font-extrabold text-xs tracking-wider uppercase text-chocolate/85">
            Bestie Day Spark 🎉
          </span>
          {/* Audio Wave Sound visualizer dots next to the title */}
          {isMusicOn && !isMuted && (
            <div className="flex items-center gap-0.5 ml-1.5 h-3" id="mini-audio-waves">
              <span className="w-1 bg-chocolate rounded-full animate-bounce h-2.5" style={{ animationDelay: '0ms', animationDuration: '0.4s' }} />
              <span className="w-1 bg-chocolate rounded-full animate-bounce h-1.5" style={{ animationDelay: '150ms', animationDuration: '0.3s' }} />
              <span className="w-1 bg-chocolate rounded-full animate-bounce h-3" style={{ animationDelay: '100ms', animationDuration: '0.45s' }} />
            </div>
          )}
        </div>
        
        {/* Dynamic Audio Control Panel */}
        <div className="flex items-center gap-1.5 select-none" id="audio-control-panel">
          {/* Play/Stop background music */}
          <button
            id="btn-music-toggle"
            onClick={() => {
              triggerAudioInit();
              audio.playPop();
              const nextMusicState = !isMusicOn;
              setIsMusicOn(nextMusicState);
              audio.isMusicPlaying = nextMusicState;
              if (nextMusicState) {
                audio.playBackgroundMelody(screen);
              } else {
                audio.stopBackgroundMelody();
              }
            }}
            className={`w-8 h-8 rounded-[12px] border-2 border-chocolate text-xs font-black transition active:scale-95 flex items-center justify-center cursor-pointer shadow-[2px_2px_0px_#7F4F24] active:shadow-none hover:bg-soft-peach/20 ${
              isMusicOn && !isMuted ? "bg-cream-puff text-chocolate" : "bg-white text-chocolate/40"
            }`}
            title="Play/Stop Musik Background"
          >
            <span className="text-xs">🎵</span>
          </button>

          {/* Mute/Unmute all sounds */}
          <button
            id="btn-sound-toggle"
            onClick={() => {
              triggerAudioInit();
              audio.playPop();
              handleToggleMute();
            }}
            className={`w-8 h-8 rounded-[12px] border-2 border-chocolate text-xs font-black transition active:scale-95 flex items-center justify-center cursor-pointer shadow-[2px_2px_0px_#7F4F24] active:shadow-none hover:bg-soft-peach/20 ${
              !isMuted ? "bg-cream-puff text-chocolate" : "bg-white text-chocolate/40"
            }`}
            title={isMuted ? "Unmute Semua" : "Mute Semua"}
          >
            {isMuted ? (
              <VolumeX className="w-3.5 h-3.5 text-rose-500" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-matcha fill-matcha" />
            )}
          </button>
        </div>
      </div>

      {/* SCREEN PROGRESS BAR (Except for envelope/pin screens) */}
      {screen !== "envelope" && screen !== "pin" && (
        <div className="w-full bg-[#e0d5c5] border-2 border-chocolate h-4 rounded-full overflow-hidden mb-4" id="slide-progress-bar">
          <div 
            className="bg-matcha h-full transition-all duration-300 border-r border-chocolate"
            style={{ 
              width: `${
                screen === "tease" ? 14 :
                screen === "photos" ? 28 :
                screen === "candle" ? 42 :
                screen === "letter" ? 56 :
                screen === "gift" ? 70 :
                screen === "quiz" ? 84 : 100
              }%` 
            }}
          />
        </div>
      )}

      {/* MAIN VIEW CONTENT CONTAINER */}
      <div className="flex-1 w-full flex flex-col justify-center items-center py-2 z-10" onClick={triggerAudioInit}>
        <AnimatePresence mode="wait">
          
          {/* SCREEN 1: ENVELOPE INTRO */}
          {screen === "envelope" && (
            <motion.div
              key="intro-screen"
              initial={{ opacity: 0, scale: 0.93 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full text-center space-y-5 py-3 flex flex-col items-center"
            >
              <div className="relative w-32 h-32 flex items-center justify-center animate-float">
                <div className="absolute inset-0 bg-soft-peach rounded-full blur-2xl opacity-20"></div>
                <span className="text-8xl select-none" id="main-envelope-emoji">✉️</span>
                <span className="absolute -top-1 -right-1 text-2xl">✨</span>
              </div>

              <div className="space-y-2">
                <h1 className="text-3xl font-black tracking-tight font-sans text-chocolate">
                  Halo Bestie! ✨
                </h1>
                <p className="text-xs text-chocolate/80 leading-relaxed font-semibold max-w-xs px-2">
                  Ada kejutan manis spesial <span className="text-toffee underline decoration-wavy">dari aku</span> nih... Bikin rukun dan hepi pokoknya!
                </p>
              </div>

              <div className="w-full max-w-[240px] pt-1">
                <button
                  id="btn-open-envelope"
                  onClick={() => { audio.playPop(); setScreen("pin"); }}
                  className="w-full py-3.5 px-6 rounded-[16px] bg-soft-peach border-3 border-chocolate text-chocolate font-extrabold text-sm tracking-wide shadow-[4px_4px_0px_#7F4F24] hover:shadow-[6px_6px_0px_#7F4F24] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-[0px_0px_0px_#7F4F24] transition-all duration-100 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Mail className="w-4 h-4 text-chocolate fill-chocolate" />
                  Buka Di Sini Ya 📨
                </button>
                <p className="text-sm font-handwritten text-toffee text-center mt-3 font-semibold select-none">
                  *Sambil ngopi tentunya ☕
                </p>
              </div>
            </motion.div>
          )}

          {/* SCREEN 2: SECURE PIN */}
          {screen === "pin" && (
            <motion.div
              key="pin-screen"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full max-w-[280px] mx-auto text-center space-y-4 py-2"
            >
              <div className="space-y-1">
                <div className="w-10 h-10 bg-toffee/15 rounded-full flex items-center justify-center mx-auto mb-1">
                  <Lock className="w-4 h-4 text-chocolate" />
                </div>
                <h2 className="text-xl font-extrabold text-[#7F4F24] font-sans">Gembok Bestie 🔐</h2>
                <p className="text-[11px] text-chocolate/75 leading-tight font-semibold">
                  Tanya PIN ke <span className="font-extrabold text-[#7F4F24]">aku</span> biar bisa buka kadonya! 🔐
                </p>
              </div>

              {/* Pin dots visualised */}
              <div className="flex justify-center gap-3.5 py-1">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-4 h-4 rounded-full border-2 border-chocolate transition-all duration-150 ${
                      i < pin.length ? "bg-chocolate scale-110" : "bg-transparent"
                    }`}
                  />
                ))}
              </div>

              {/* Error message */}
              <div className="h-5">
                {pinError && (
                  <span className="text-[11px] text-rose-600 font-bold animate-bounce block">
                    {pinError}
                  </span>
                )}
              </div>

              {/* Keypad block layout */}
              <div className="grid grid-cols-3 gap-3 py-1 px-4 max-w-[240px] mx-auto" id="pin-keypad-panel">
                {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
                  <button
                    key={num}
                    onClick={() => handlePinInput(num)}
                    className="w-12 h-12 bg-white hover:bg-cream-puff border-2 border-chocolate rounded-[12px] font-black text-sm text-chocolate flex items-center justify-center transition hover:-translate-y-0.5 active:translate-y-0.5 shadow-[2px_2px_0px_#7F4F24] active:shadow-none cursor-pointer"
                  >
                    {num}
                  </button>
                ))}
                
                <button
                  onClick={clearLastPinDigit}
                  className="w-12 h-12 bg-white hover:bg-cream-puff border-2 border-chocolate rounded-[12px] font-black text-xs text-rose-500 flex items-center justify-center transition hover:-translate-y-0.5 active:translate-y-0.5 shadow-[2px_2px_0px_#7F4F24] active:shadow-none cursor-pointer"
                >
                  ⌫
                </button>
                
                <button
                  onClick={() => handlePinInput("0")}
                  className="w-12 h-12 bg-white hover:bg-cream-puff border-2 border-chocolate rounded-[12px] font-black text-sm text-chocolate flex items-center justify-center transition hover:-translate-y-0.5 active:translate-y-0.5 shadow-[2px_2px_0px_#7F4F24] active:shadow-none cursor-pointer"
                >
                  0
                </button>
                
                <button
                  disabled={pin.length < 4}
                  onClick={() => {
                    if (pin === "2112") {
                      audio.playPinCorrect();
                      setScreen("tease");
                    } else {
                      audio.playPinWrong();
                      setPinError("Waduh bestie, PINnya salah tuh! Coba lagi ya! 😜");
                      setPin("");
                    }
                  }}
                  className={`w-12 h-12 border-2 border-chocolate rounded-[12px] font-black text-xs flex items-center justify-center transition ${
                    pin.length === 4 
                      ? "bg-matcha text-chocolate hover:bg-matcha/80 shadow-[2px_2px_0px_#7F4F24] cursor-pointer" 
                      : "bg-[#e0d5c5] text-chocolate/40 cursor-not-allowed"
                  }`}
                >
                  ✓
                </button>
              </div>

              <button
                onClick={() => { audio.playPop(); setScreen("envelope"); }}
                className="text-[11px] font-extrabold text-chocolate hover:underline block mx-auto mt-2 cursor-pointer"
              >
                Kembali ke Depan
              </button>
            </motion.div>
          )}

          {/* SCREEN 3: TEASING DATES */}
          {screen === "tease" && (
            <motion.div
              key="tease-screen"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full text-center space-y-4 py-2"
            >
              <h2 className="text-xl font-extrabold text-chocolate tracking-tight leading-snug">
                Eh bestie, hari ini tanggal berapa hayoo? 🤨
              </h2>
              <p className="text-[11px] text-chocolate/85 font-semibold leading-relaxed max-w-xs mx-auto">
                Jangan bilang kamu lupa hari ulang tahun terspesial kamu sendiri! Parah bgt klu lupa!
              </p>

              {teaseMessage && (
                <div className="bg-rose-100 border-2 border-rose-400/40 text-rose-600 text-[11px] p-3 rounded-2xl max-w-xs mx-auto font-bold animate-bounce my-2">
                  {teaseMessage}
                </div>
              )}

              <div className="flex flex-col gap-3 pt-3 max-w-[220px] mx-auto">
                <button
                  onClick={handleTeaseWrong}
                  className="px-4 py-2.5 rounded-[16px] bg-white border-2 border-[#7F4F24] text-xs font-bold text-rose-500 hover:bg-rose-50/50 transition cursor-pointer shadow-[2px_2px_0px_#7F4F24]"
                >
                  Hari Biasa Aja Sih... 🥱
                </button>
                <button
                  onClick={() => { audio.playDing(); setScreen("photos"); }}
                  className="px-4 py-3 rounded-[16px] bg-matcha border-3 border-chocolate text-chocolate font-black text-xs tracking-wide shadow-[4px_4px_0px_#7F4F24] hover:shadow-[6px_6px_0px_#7F4F24] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-[0px_0px_0px_#7F4F24] transition-all duration-100 flex items-center justify-center gap-1 cursor-pointer"
                >
                  Hari Spesialku Dong! ✨
                </button>
              </div>
            </motion.div>
          )}

          {/* SCREEN 4: POLAROID SLIDESHOW */}
          {screen === "photos" && (
            <motion.div
              key="photos-screen"
              initial={{ opacity: 0, x: 25 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -25 }}
              className="w-full text-center space-y-4 py-1 flex flex-col items-center"
            >
              <div>
                <span className="text-[10px] font-extrabold bg-toffee/15 text-toffee border border-toffee/35 px-2.5 py-0.5 rounded-full uppercase tracking-widest">
                  Polaroid Kenangan 📸
                </span>
                <h3 className="text-lg font-extrabold text-chocolate mt-2">Momen Kocak Bareng</h3>
              </div>

              {/* Polaroid Frame */}
              <div className="bg-white text-chocolate p-3 pb-6 rounded-lg border-3 border-chocolate shadow-[8px_8px_0px_#D4A373] max-w-[210px] rotate-2 hover:rotate-0 transition-transform duration-300 relative inline-block">
                <div className="w-full aspect-square bg-[#eee] border-2 border-chocolate rounded overflow-hidden">
                  <img 
                    src={photos[photoIndex].url} 
                    alt="Bestie Memory" 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover" 
                  />
                </div>
                <p className="text-xl font-handwritten text-center mt-3 leading-tight font-extrabold select-none text-chocolate/95">
                  {photos[photoIndex].caption}
                </p>
                
                <span className="absolute top-4 left-4 bg-chocolate text-[9px] text-cream-puff px-2 py-0.5 rounded-md font-mono font-bold select-none border border-chocolate">
                  {photoIndex + 1}/{photos.length}
                </span>
              </div>

              {/* Navigation icons */}
              <div className="flex gap-3 items-center">
                <button
                  onClick={() => {
                    audio.playCameraClick();
                    setPhotoIndex(prev => (prev === 0 ? photos.length - 1 : prev - 1));
                  }}
                  className="p-2.5 bg-whipped-cream rounded-[12px] border-2 border-chocolate text-chocolate hover:bg-soft-peach/30 transition active:scale-95 cursor-pointer shadow-[2px_2px_0px_#7F4F24]"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-black text-chocolate/90">Geser Album 📸</span>
                <button
                  onClick={() => {
                    audio.playCameraClick();
                    setPhotoIndex(prev => (prev === photos.length - 1 ? 0 : prev + 1));
                  }}
                  className="p-2.5 bg-whipped-cream rounded-[12px] border-2 border-chocolate text-chocolate hover:bg-soft-peach/30 transition active:scale-95 cursor-pointer shadow-[2px_2px_0px_#7F4F24]"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => { audio.playClick(); setScreen("candle"); }}
                className="w-full py-3.5 bg-soft-peach border-3 border-chocolate text-chocolate font-black text-xs rounded-[16px] flex items-center justify-center gap-1.5 transition active:scale-95 mt-1 cursor-pointer shadow-[4px_4px_0px_#7F4F24]"
              >
                Tiup Lilin Kuenya 🎂 →
              </button>
            </motion.div>
          )}

          {/* SCREEN 5: TIUP LILIN */}
          {screen === "candle" && (
            <motion.div
              key="candle-screen"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="w-full text-center space-y-4 py-2 flex flex-col items-center"
            >
              <div>
                <span className="text-[10px] font-extrabold bg-matcha/10 text-matcha border border-matcha/30 px-3 py-0.5 rounded-full uppercase tracking-wider">
                  Interactive Blow 🕯️
                </span>
                <h3 className="text-xl font-extrabold text-chocolate mt-2">Ayo tiup lilinnya! 🕯️</h3>
                <p className="text-[11px] text-chocolate/75 leading-relaxed max-w-xs mx-auto">
                  Tiup pake mic atau pencet apinya sampe mati. Gaskeun!
                </p>
              </div>

              {/* Cupcake cake illustration with SVG */}
              <div className="relative w-40 h-40 flex items-center justify-center my-1 select-none">
                {/* Candle Flame animation */}
                {!candleBlown && (
                  <div 
                    onClick={handleManualFlameBlow}
                    className="absolute top-4 left-1/2 -translate-x-1/2 w-5 h-9 cursor-pointer z-20 origin-bottom transform hover:scale-110 active:scale-90"
                    style={{ 
                      transform: `translateX(-50%) scale(${Math.max(0.3, (100 - candleProgress) / 100)})`,
                      filter: 'drop-shadow(0 0 10px rgba(244,211,94,0.8))'
                    }}
                  >
                    <div className="w-full h-full bg-gradient-to-t from-amber-500 via-warm-yellow to-orange-300 rounded-full animate-float"></div>
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-blue-400 rounded-full opacity-60"></div>
                  </div>
                )}

                {/* Smoke particle when blown */}
                {candleBlown && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: [0, 0.8, 0], y: [-10, -50], x: [0, 10, -10] }}
                    transition={{ duration: 1.8, repeat: Infinity }}
                    className="absolute top-8 left-1/2 -translate-x-1/2 text-2xl"
                  >
                    💨
                  </motion.div>
                )}

                {/* Cupcake Graphics */}
                <svg viewBox="0 0 100 100" className="w-28 h-28 transform translate-y-2">
                  {/* Candlestick item */}
                  <rect x="47" y="25" width="6" height="20" fill="#F5C4A1" rx="1" />
                  <path d="M47 30h6v3h-6z" fill="#D4A373" />
                  {/* Outer frosting layers */}
                  <path d="M25 70 C25 50, 75 50, 75 70 Z" fill="#FDF3E7" stroke="#D4A373" strokeWidth="2.5" />
                  {/* Cherry */}
                  <circle cx="50" cy="52" r="5" fill="#e11d48" />
                  {/* Cup wrap base */}
                  <path d="M30 70 L35 92 L65 92 L70 70 Z" fill="#D4A373" stroke="#7F4F24" strokeWidth="2.5" />
                  <line x1="40" y1="70" x2="42" y2="92" stroke="#7F4F24" strokeWidth="1.5" />
                  <line x1="50" y1="70" x2="50" y2="92" stroke="#7F4F24" strokeWidth="1.5" />
                  <line x1="60" y1="70" x2="58" y2="92" stroke="#7F4F24" strokeWidth="1.5" />
                </svg>
              </div>

              {/* Progress bar berbentuk biskuit cookie style representation text */}
              <div className="w-full max-w-[250px] space-y-1">
                <div className="flex justify-between text-[11px] font-black text-chocolate">
                  <span>🍪 Progress Tiupan:</span>
                  <span>{candleProgress}%</span>
                </div>
                
                {/* Progress bar visualizer */}
                <div className="w-full bg-cream-puff border-3 border-chocolate h-6 rounded-full overflow-hidden p-[2px] flex items-center shadow-inner">
                  <div 
                    className="bg-cream-puff h-full rounded-full transition-all duration-150 flex items-center justify-end"
                    style={{ width: `${candleProgress}%` }}
                  >
                    <div className="w-full h-full bg-[#fa0] flex items-center justify-end pr-1 text-xs select-none">
                      💥 🍪
                    </div>
                  </div>
                </div>
              </div>

              {/* Interface buttons */}
              <div className="flex gap-3 justify-center w-full max-w-[260px] pt-1">
                {microphoneStreamRef.current ? (
                  <span className="text-xs text-matcha font-black animate-pulse">
                    🎙️ Mik Aktif! Tiup kuat-kuat!
                  </span>
                ) : (
                  <button
                    onClick={startMicrophoneAudio}
                    className="px-3 py-2 rounded-[12px] bg-white border-2 border-chocolate text-[10px] font-black text-chocolate hover:bg-cream-puff transition active:scale-95 flex items-center gap-1 cursor-pointer shadow-[2px_2px_0px_#7F4F24]"
                  >
                    🎙️ Tiup via Mikrofon
                  </button>
                )}
                
                <button
                  onClick={triggerCandleSuccess}
                  className="px-3 py-2 rounded-[12px] bg-white border-2 border-chocolate text-[10px] font-black text-chocolate hover:bg-cream-puff transition active:scale-95 cursor-pointer shadow-[2px_2px_0px_#7F4F24]"
                >
                  Langsung Padam 🍰
                </button>
              </div>

              {candleBlown && (
                <div className="text-center font-bold text-xs text-matcha bg-matcha/10 border border-matcha/30 p-2.5 rounded-2xl animate-pulse mt-2">
                  Selamat! Harapan bestie udah kesampean! ✨
                </div>
              )}
            </motion.div>
          )}

          {/* SCREEN 6: WISH LETTER */}
          {screen === "letter" && (
            <motion.div
              key="letter-screen"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="w-full text-center space-y-4 py-2"
            >
              <div>
                <span className="text-[10px] font-extrabold bg-toffee/15 text-toffee border border-toffee/35 px-3 py-0.5 rounded-full uppercase tracking-wider">
                  Surat Harapan Cinta 📜
                </span>
                <h3 className="text-xl font-black text-chocolate mt-2">Wish Letter dari Aku</h3>
              </div>

              {/* Scroll paper container styling */}
              <div className="bg-white text-chocolate p-5 rounded-2xl border-3 border-chocolate shadow-[6px_6px_0px_#D4A373] text-left max-h-[340px] overflow-y-auto leading-relaxed text-xs relative">
                <div className="absolute top-2 right-3 text-[9px] text-[#A68870] font-mono italic">
                  Private Mail Box 🤝
                </div>
                
                <h4 className="text-center font-black text-sm tracking-wide text-chocolate mb-3 font-sans">
                  ✨ SURAT BUAT BESTIE ✨
                </h4>
                
                <p className="whitespace-pre-line font-medium leading-relaxed italic text-[12px] font-sans">
                  Selamat ulang tahun ya, bestie! 🎉✨
                  {"\n\n"}
                  Di hari yang spesial ini, aku ingin mengucapkan terima kasih karena kamu telah hadir di dunia dan menjadi bagian dari perjalanan hidup orang-orang di sekitarmu. Kehadiranmu membawa warna, tawa, cerita, dan banyak kenangan indah yang begitu berarti.
                  {"\n\n"}
                  Semoga di usia yang baru ini, kamu selalu diberikan kesehatan yang kuat, hati yang tenang, pikiran yang damai, dan langkah yang dimudahkan dalam setiap urusan. Semoga segala doa yang selama ini kamu simpan dalam diam perlahan menemukan jalannya untuk menjadi kenyataan.
                  {"\n\n"}
                  Aku juga berdoa agar kamu selalu dikelilingi oleh orang-orang yang tulus menyayangimu, yang hadir bukan hanya saat bahagia, tetapi juga saat kamu membutuhkan tempat untuk bersandar. Semoga setiap kesedihan yang pernah kamu rasakan digantikan dengan kebahagiaan yang lebih besar, dan setiap kegagalan yang pernah kamu alami menjadi jalan menuju keberhasilan yang lebih indah.
                  {"\n\n"}
                  Semoga rezekimu semakin luas, karier dan pendidikanmu semakin gemilang, serta segala impian yang sedang kamu perjuangkan diberikan kemudahan untuk tercapai. Semoga kamu selalu diberi kekuatan untuk menghadapi setiap tantangan, keberanian untuk mengambil langkah baru, dan kebijaksanaan dalam setiap keputusan yang kamu pilih.
                  {"\n\n"}
                  Jangan pernah meragukan dirimu sendiri. Kamu adalah pribadi yang berharga, kuat, dan pantas mendapatkan hal-hal baik dalam hidup. Tetaplah menjadi dirimu yang hangat, baik hati, dan selalu membawa energi positif bagi orang-orang di sekitarmu.
                  {"\n\n"}
                  Terima kasih karena sudah bertahan sejauh ini. Terima kasih atas semua kebaikan, perhatian, dan cerita yang telah kamu bagikan. Semoga tahun ini menjadi salah satu bab terbaik dalam hidupmu, penuh dengan kesempatan baru, kebahagiaan yang tak terduga, dan momen-momen yang akan selalu dikenang.
                  {"\n\n"}
                  Selamat bertambah usia, bestie. 🎂🎈
                </p>
                
                <div className="text-right font-black mt-4 text-chocolate text-[12px]">
                  — Saya
                </div>
              </div>

              <button
                onClick={() => { audio.playClick(); setScreen("gift"); }}
                className="w-full py-4 bg-soft-peach border-3 border-chocolate text-chocolate font-black text-xs rounded-[16px] flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer shadow-[4px_4px_0px_#7F4F24] mt-2"
              >
                Intip Kado Spesial Kamu 🎁
              </button>
            </motion.div>
          )}

          {/* SCREEN 7: MYSTERY GIFT CHOICE */}
          {screen === "gift" && (
            <motion.div
              key="gift-screen"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="w-full text-center space-y-4 py-2 flex flex-col items-center"
            >
              <div>
                <span className="text-[10px] font-extrabold bg-toffee/15 text-toffee border border-toffee/35 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Select Kado 🎁
                </span>
                <h3 className="text-lg font-black text-chocolate mt-2">Nah ini dia hadiahnya! 🎁</h3>
                <p className="text-[11px] text-chocolate/75 leading-relaxed max-w-xs mx-auto">
                  Pilih salah satu kotak. Tapi inget... Pilihannya cuma satu!
                </p>
              </div>

              {/* Shaking gift box selection cards */}
              <div className="grid grid-cols-3 gap-4 w-full max-w-[310px] py-1 select-none">
                {[0, 1, 2].map((i) => {
                  const isSelected = selectedGift === i;
                  const isAnySelected = selectedGift !== null;
                  return (
                    <button
                      key={i}
                      onClick={() => handleGiftSelect(i)}
                      disabled={isAnySelected}
                      className={`aspect-square rounded-[16px] border-3 p-2 flex flex-col items-center justify-center gap-1.5 transition-all duration-300 ${
                        isSelected 
                          ? "bg-matcha border-chocolate scale-105 shadow-[4px_4px_0px_#7F4F24]"
                          : isAnySelected 
                          ? "opacity-40 border-chocolate/40"
                          : "bg-white border-chocolate hover:border-chocolate active:scale-95 hover:scale-105 shadow-[4px_4px_0px_#7F4F24] cursor-pointer"
                      }`}
                    >
                      <span className="text-4xl">🎁</span>
                      <span className="text-[9px] font-black text-chocolate tracking-wider">BOX #{i + 1}</span>
                    </button>
                  );
                })}
              </div>

              {/* Revealed gift block display */}
              {selectedGift !== null && (
                <div className="w-full max-w-[290px] bg-white border-3 border-chocolate p-4 rounded-[20px] shadow-[4px_4px_0px_#7F4F24] space-y-1 mt-1 text-center animate-bounce">
                  <span className="text-[10px] uppercase font-mono font-black text-matcha tracking-widest block">
                    Voucher Didapatkan 🌸
                  </span>
                  <p className="text-sm font-black text-chocolate leading-normal">
                    {[
                      "Traktir Seblak + Es Teh Manis 🍲",
                      "Nobar Film Favorit + Popcorn 🍿",
                      "Temenin Nongkrong Seharian + Ngopi ☕"
                    ][selectedGift]}
                  </p>
                  <p className="text-[10px] text-chocolate/75 italic font-bold">
                    *Tapi kita patungan ya bestie, jangan heboh melulu wkwk
                  </p>
                </div>
              )}

              {selectedGift !== null && (
                <button
                  onClick={() => { audio.playClick(); setScreen("quiz"); }}
                  className="w-full py-3.5 bg-soft-peach border-3 border-chocolate text-chocolate font-black text-xs rounded-[16px] transition active:scale-95 cursor-pointer shadow-[4px_4px_0px_#7F4F24] mt-2"
                >
                  Yuk Lanjut Bestie Quiz 🙋‍♀️
                </button>
              )}
            </motion.div>
          )}

          {/* SCREEN 8: LOYALTY ESCAPE BUTTON QUIZ */}
          {screen === "quiz" && (
            <motion.div
              key="quiz-screen"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="w-full text-center space-y-4 py-2 flex flex-col items-center"
            >
              <div>
                <span className="text-[10px] font-extrabold bg-toffee/15 text-toffee border border-toffee/35 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Bestie Quiz 🤜🤛
                </span>
                <h3 className="text-lg font-black text-chocolate mt-2">Kita tuh bestie sejati kan? 🤜🤛</h3>
              </div>

              {/* Escape container */}
              <div className="relative w-full h-36 border-3 border-chocolate bg-white rounded-[24px] flex items-center justify-center p-2 mt-1 shadow-[4px_4px_0px_#7F4F24]">
                {!quizSuccess ? (
                  <>
                    <button
                      onClick={handleQuizSuccess}
                      className="absolute left-3 px-3 py-2.5 bg-soft-peach border-2 border-chocolate text-chocolate text-[10px] font-black rounded-[12px] z-20 shadow-[2px_2px_0px_#7F4F24] tracking-wider transition active:scale-90 cursor-pointer"
                    >
                      BESTIE SELAMANYA! 🤜🤛
                    </button>

                    <button
                      onMouseEnter={handleQuizEscape}
                      onTouchStart={handleQuizEscape}
                      onClick={handleQuizEscape}
                      style={{ 
                        transform: `translate(${noButtonPos.x}px, ${noButtonPos.y}px)`,
                        transition: 'transform 0.1s ease-out'
                      }}
                      className="absolute right-3 px-3 py-2 bg-slate-100 border-2 border-[#7F4F24] text-[#7F4F24] text-[10px] font-black rounded-[12px] z-10 opacity-85 shadow-[2px_2px_0px_#7F4F24]"
                    >
                      Biasa Aja Sih 😐
                    </button>
                  </>
                ) : (
                  <div className="text-center space-y-1 animate-bounce flex flex-col items-center">
                    <span className="text-3xl">🤜💥🤛</span>
                    <h4 className="text-[11px] font-black text-matcha">Yeeaay! Bestie sejati! Makasih ya udah jadi sahabat terbaik! 🫶</h4>
                  </div>
                )}
              </div>

              {quizSuccess && (
                <button
                  onClick={() => { audio.playClick(); setScreen("final"); }}
                  className="w-full py-3.5 bg-[#A7C957] border-3 border-chocolate text-chocolate font-black text-xs rounded-[16px] transition active:scale-95 cursor-pointer shadow-[4px_4px_0px_#7F4F24] mt-2"
                >
                  Selesai & Ke WA 📲
                </button>
              )}
            </motion.div>
          )}

          {/* SCREEN 9: FINAL & WHATSAPP REDIRECT */}
          {screen === "final" && (
            <motion.div
              key="final-screen"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full text-center space-y-4 py-1 flex flex-col items-center"
            >
              <div className="text-center">
                <span className="text-[10px] font-extrabold bg-toffee/15 text-toffee border border-toffee/35 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Success Celebration 🎉
                </span>
                <h3 className="text-xl font-black text-chocolate mt-2">🎉 MAKASIH BESTIE! 🎉</h3>
              </div>

              {/* Chat Bubble Presentation */}
              <div className="w-full max-w-[280px] bg-white border-3 border-chocolate p-4 rounded-[20px] shadow-[4px_4px_0px_#7F4F24] space-y-2 text-left relative inline-block">
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-soft-peach flex items-center justify-center text-sm font-bold border-2 border-chocolate">
                    🧸
                  </div>
                  <div className="flex-1 bg-cream-puff p-2.5 rounded-[16px] rounded-tl-none text-xs text-chocolate leading-relaxed font-extrabold">
                    Bestie lu kereeeen! Makasih yaaa ❤️
                  </div>
                </div>
              </div>

              <div className="w-full space-y-2 pt-2">
                <button
                  onClick={handleSendWhatsApp}
                  className="w-full py-3.5 bg-matcha border-3 border-chocolate text-chocolate font-black text-xs rounded-[16px] flex items-center justify-center gap-1.5 transition active:scale-95 shadow-[4px_4px_0px_#7F4F24] cursor-pointer"
                >
                  📲 Kirim Pesan ke WA
                </button>
                
                <button
                  onClick={() => {
                    audio.playPop();
                    setScreen("envelope");
                    setCandleBlown(false);
                    setCandleProgress(0);
                    setSelectedGift(null);
                    setQuizSuccess(false);
                    setTeaseCount(0);
                    setTeaseMessage("");
                    setPin("");
                  }}
                  className="w-full py-2 bg-transparent text-[#7F4F24] hover:text-chocolate font-black text-xs flex items-center justify-center gap-1 cursor-pointer mt-2"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Ulangi Kejutan
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* DETAILED AMBIENT MASCOT "Creamy" at bottom right corner */}
      <div 
        id="creamy-mascot-visual"
        className="relative w-full flex items-center justify-between bg-[#FDF3E7] border-3 border-chocolate p-3 rounded-[20px] gap-3 mt-4 select-none z-30 shadow-[4px_4px_0px_#D4A373]"
      >
        <div className="flex-1 flex flex-col text-left">
          <span className="font-extrabold text-[11px] text-chocolate/90 leading-tight">
            Creamy (Beruang Bestie) 🧸
          </span>
          <p className="text-[10px] font-bold text-[#7F4F24]/80 leading-snug mt-1">
            "{creamyBubble}"
          </p>
        </div>

        {/* Interactive Bear SVG icon with changing expressions relative to state */}
        <div 
          onClick={handleMascotClick}
          className="w-14 h-14 bg-whipped-cream border-2 border-toffee rounded-full flex items-center justify-center cursor-pointer transition transform hover:scale-110 active:scale-95 shadow-inner relative flex-shrink-0 animate-float"
        >
          {/* Sleep zzz particles visualised if idle */}
          {creamyExpression === "sleeping" && (
            <span className="absolute -top-3 -left-1 text-xs text-toffee font-mono font-bold animate-pulse">
              Zzz..
            </span>
          )}
          
          <svg viewBox="0 0 100 100" className="w-11 h-11">
            {/* Bear shape ears */}
            <circle cx="28" cy="28" r="14" fill="#D4A373" stroke="#7F4F24" strokeWidth="4.5" />
            <circle cx="72" cy="28" r="14" fill="#D4A373" stroke="#7F4F24" strokeWidth="4.5" />
            
            {/* Inner ears */}
            <circle cx="28" cy="28" r="7" fill="#F5C4A1" />
            <circle cx="72" cy="28" r="7" fill="#F5C4A1" />
            
            {/* main round face */}
            <circle cx="50" cy="55" r="35" fill="#D4A373" stroke="#7F4F24" strokeWidth="4.5" />
            
            {/* white snout mouth area */}
            <circle cx="50" cy="67" r="11" fill="#FFF9F0" />
            
            {/* Nose */}
            <polygon points="45,63 55,63 50,69" fill="#7F4F24" />

            {/* Mouth expression state visualizer */}
            {creamyExpression === "laugh" && (
              <path d="M46 72 Q50 78, 54 72" stroke="#7F4F24" strokeWidth="3" fill="none" strokeLinecap="round" />
            )}
            {creamyExpression === "smile" && (
              <path d="M48 72 Q50 74, 52 72" stroke="#7F4F24" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            )}
            {creamyExpression === "angry" && (
              <line x1="45" y1="73" x2="55" y2="73" stroke="#7F4F24" strokeWidth="3" strokeLinecap="round" />
            )}
            {creamyExpression === "cool" && (
              <path d="M46 72 Q50 75, 54 72" stroke="#7F4F24" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            )}
            {creamyExpression === "hearts" && (
              <path d="M45 71 Q50 77, 55 71" stroke="#7F4F24" strokeWidth="3" fill="none" strokeLinecap="round" />
            )}
            {creamyExpression === "sleeping" && (
              <line x1="47" y1="73" x2="53" y2="73" stroke="#7F4F24" strokeWidth="2.5" />
            )}

            {/* Eyes state expressions */}
            {creamyExpression === "smile" && (
              <>
                <circle cx="36" cy="50" r="3.5" fill="#7F4F24" />
                <circle cx="64" cy="50" r="3.5" fill="#7F4F24" />
              </>
            )}
            {creamyExpression === "laugh" && (
              <>
                {/* Happy curved eyes ^ ^ */}
                <path d="M31 52 Q35 48, 39 52" stroke="#7F4F24" strokeWidth="3.5" fill="none" strokeLinecap="round" />
                <path d="M59 52 Q63 48, 67 52" stroke="#7F4F24" strokeWidth="3.5" fill="none" strokeLinecap="round" />
              </>
            )}
            {creamyExpression === "angry" && (
              <>
                {/* 斜め眉毛 + 怒り目 */}
                <line x1="28" y1="41" x2="40" y2="47" stroke="#7F4F24" strokeWidth="3.5" strokeLinecap="round" />
                <line x1="72" y1="41" x2="60" y2="47" stroke="#7F4F24" strokeWidth="3.5" strokeLinecap="round" />
                <circle cx="35" cy="52" r="3" fill="#7F4F24" />
                <circle cx="65" cy="52" r="3" fill="#7F4F24" />
              </>
            )}
            {creamyExpression === "cool" && (
              <>
                {/* Sunglasses 😎 */}
                <rect x="25" y="44" width="22" height="11" rx="4" fill="#1e293b" />
                <rect x="53" y="44" width="22" height="11" rx="4" fill="#1e293b" />
                <line x1="47" y1="49" x2="53" y2="49" stroke="#1e293b" strokeWidth="3.5" />
              </>
            )}
            {creamyExpression === "hearts" && (
              <>
                {/* Heart eyes! */}
                <path d="M31 48 Q35 44, 39 48 Q39 54, 35 57 Q31 54, 31 48 Z" fill="#e11d48" />
                <path d="M59 48 Q63 44, 67 48 Q67 54, 63 57 Q59 54, 59 48 Z" fill="#e11d48" />
              </>
            )}
            {creamyExpression === "sleeping" && (
              <>
                {/* Sgleeping eyes _ _ */}
                <line x1="31" y1="50" x2="41" y2="50" stroke="#7F4F24" strokeWidth="3" strokeLinecap="round" />
                <line x1="59" y1="50" x2="69" y2="50" stroke="#7F4F24" strokeWidth="3" strokeLinecap="round" />
              </>
            )}
          </svg>
        </div>
      </div>

    </div>
  );
}
