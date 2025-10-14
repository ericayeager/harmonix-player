// src/components/Home.js
import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../auth/integrations/supabase/client";
import "../styles/base.css";
import "../styles/theme-professional.css";
import "../styles/theme-cute.css";
import "../styles/theme-colorful.css";
import logo from "../assets/logo.png";
import playingGif from "../assets/playing.gif";
import {
  FaPlayCircle,
  FaPauseCircle,
  FaStepForward,
  FaStepBackward,
  FaRandom,
  FaRedo,
  FaVolumeUp,
  FaVolumeMute,
  FaListUl,
  FaHeart,
  FaSearch,
  FaPalette,
  FaTrashAlt,
  FaPlus,
  FaTimes,
  FaEdit,
  FaSave,
} from "react-icons/fa";

/* -------------------- songs -------------------- */
const songs = [
  {
    songName: "Dekha hazaro dafaa",
    filePath: "/songs/1.mp3",
    coverPath: "/covers/1.jpg",
  },
  {
    songName: "Tu itni khoobsurat hai",
    filePath: "/songs/2.mp3",
    coverPath: "/covers/2.jpg",
  },
  {
    songName: "Nazar na lag jaaye",
    filePath: "/songs/3.mp3",
    coverPath: "/covers/3.jpg",
  },
  {
    songName: "Ishq De Fanniyar",
    filePath: "/songs/4.mp3",
    coverPath: "/covers/4.jpg",
  },
  {
    songName: "Ishq Bulaava",
    filePath: "/songs/5.mp3",
    coverPath: "/covers/5.jpg",
  },
  {
    songName: "Aahun Aahun",
    filePath: "/songs/6.mp3",
    coverPath: "/covers/6.jpg",
  },
  {
    songName: "Aa Zara",
    filePath: "/songs/7.mp3",
    coverPath: "/covers/7.jpg",
  },
  {
    songName: "Right Now Now",
    filePath: "/songs/8.mp3",
    coverPath: "/covers/8.jpg",
  },
  {
    songName: "Love Me Love Me",
    filePath: "/songs/9.mp3",
    coverPath: "/covers/9.jpg",
  },
  {
    songName: "Lat Lag Gayee",
    filePath: "/songs/10.mp3",
    coverPath: "/covers/10.jpg",
  },
];

const LS_KEYS = {
  THEME: "harmonix_theme_v1",
  FAVORITES: "harmonix_favs_v1",
  VOLUME: "harmonix_vol_v1",
  LAST_SONG: "harmonix_last_song_v1",
  QUEUE: "harmonix_queue_v1",
  REPEAT: "harmonix_repeat_v1",
  FAVPARTS: "harmonix_favparts_v1",
};

const THEME_META = {
  professional: {
    fontFamily:
      '"Poppins", system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial',
    fontUrl:
      "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap",
    accent: "#1db954",
    accent2: "#14b86b",
  },
  cute: {
    fontFamily:
      '"Nunito", system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial',
    fontUrl:
      "https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;600;700&display=swap",
    accent: "#ff7ab6",
    accent2: "#ffb3d9",
  },
  colorful: {
    fontFamily:
      '"Rubik", system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial',
    fontUrl:
      "https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;700&display=swap",
    accent: "#ff6b6b",
    accent2: "#ffd86b",
  },
};

const Home = () => {
  const audioRef = useRef(null);
  const progressRef = useRef(null);
  const progressWrapperRef = useRef(null);

  /* core playback state */
  const [songIndex, setSongIndex] = useState(
    () => Number(localStorage.getItem(LS_KEYS.LAST_SONG)) || 0
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);

  /* features state */
  const [shuffle, setShuffle] = useState(false);
  const [loop, setLoop] = useState(
    () => localStorage.getItem(LS_KEYS.REPEAT) === "true"
  );
  const [volume, setVolume] = useState(
    () => Number(localStorage.getItem(LS_KEYS.VOLUME)) || 1
  );
  const [muted, setMuted] = useState(false);
  const [queue, setQueue] = useState(() => {
    const raw = localStorage.getItem(LS_KEYS.QUEUE);
    if (raw) {
      try {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr) && arr.length) return arr;
      } catch {}
    }
    return songs.map((_, i) => i);
  });
  const [favorites, setFavorites] = useState(() => {
    const raw = localStorage.getItem(LS_KEYS.FAVORITES);
    if (raw) {
      try {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) return arr;
      } catch {}
    }
    return [];
  });

  // favParts example structure:
  // { id: 1639123, songIndex: 0, start: 150, end: 180, name: "Chorus", createdAt: 1639123 }
  const [favParts, setFavParts] = useState(() => {
    const raw = localStorage.getItem(LS_KEYS.FAVPARTS);
    if (raw) {
      try {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) return arr;
      } catch {}
    }
    return [];
  });

  const [recent, setRecent] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [queueOpen, setQueueOpen] = useState(false);
  const [theme, setTheme] = useState(
    () => localStorage.getItem(LS_KEYS.THEME) || "professional"
  );
  const [showMini, setShowMini] = useState(true);

  /* theme dropdown state */
  const [themeOpen, setThemeOpen] = useState(false);
  const themeRef = useRef(null);

  /* Clips: which song is selected for clip editing (null if none) */
  const [clipSongIndex, setClipSongIndex] = useState(null);

  /* Fav-part selector state (percent values 0..100) */
  const [startPercent, setStartPercent] = useState(0);
  const [endPercent, setEndPercent] = useState(10); // default small selection

  const draggingRef = useRef(null);
  const startPercentRef = useRef(startPercent);
  const endPercentRef = useRef(endPercent);
  const durationRef = useRef(duration);

  useEffect(() => {
    startPercentRef.current = startPercent;
  }, [startPercent]);
  useEffect(() => {
    endPercentRef.current = endPercent;
  }, [endPercent]);
  useEffect(() => {
    durationRef.current = duration;
  }, [duration]);

  /* editing and naming fav part */
  const [newFavName, setNewFavName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingNameValue, setEditingNameValue] = useState("");

  /* auto-stop behavior when playing a clip */
  const [autoStopAt, setAutoStopAt] = useState(null);

  /* persist important things */
  useEffect(() => {
    localStorage.setItem(LS_KEYS.THEME, theme);
  }, [theme]);
  useEffect(() => {
    localStorage.setItem(LS_KEYS.FAVORITES, JSON.stringify(favorites));
  }, [favorites]);
  useEffect(() => {
    localStorage.setItem(LS_KEYS.VOLUME, String(volume));
  }, [volume]);
  useEffect(() => {
    localStorage.setItem(LS_KEYS.QUEUE, JSON.stringify(queue));
  }, [queue]);
  useEffect(() => {
    localStorage.setItem(LS_KEYS.FAVPARTS, JSON.stringify(favParts));
  }, [favParts]);
  useEffect(() => {
    localStorage.setItem(LS_KEYS.REPEAT, loop ? "true" : "false");
  }, [loop]);
  useEffect(() => {
    localStorage.setItem(LS_KEYS.LAST_SONG, String(songIndex));
  }, [songIndex]);

  /* helper to inject font link once */
  const ensureFontLink = (url, id) => {
    if (!url) return;
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = url;
    document.head.appendChild(link);
  };

  /* apply theme side-effects: font + css variables + data attr for icon styling */
  const applyThemeEffects = (t) => {
    const meta = THEME_META[t] || THEME_META.professional;
    ensureFontLink(meta.fontUrl, `harmonix-font-${t}`);
    try {
      document.body.style.fontFamily = meta.fontFamily;
    } catch (err) {
      /* ignore */
    }
    document.documentElement.style.setProperty("--accent", meta.accent);
    document.documentElement.style.setProperty("--accent-2", meta.accent2);
    document.documentElement.setAttribute("data-icon-style", t);
  };

  useEffect(() => {
    applyThemeEffects(theme);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme]);

  // close theme dropdown when clicking outside — only attach listeners while open
  useEffect(() => {
    if (!themeOpen) return; // don't attach listeners unless menu is open

    const onOutside = (e) => {
      // if click/touch is outside the themed container, close
      if (themeRef.current && !themeRef.current.contains(e.target)) {
        setThemeOpen(false);
      }
    };

    const onKey = (e) => {
      if (e.key === "Escape") setThemeOpen(false);
    };

    document.addEventListener("mousedown", onOutside);
    document.addEventListener("touchstart", onOutside);
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("mousedown", onOutside);
      document.removeEventListener("touchstart", onOutside);
      document.removeEventListener("keydown", onKey);
    };
  }, [themeOpen]);

  // keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        togglePlay();
      } else if (e.code === "ArrowRight") nextSong();
      else if (e.code === "ArrowLeft") prevSong();
      else if (e.code === "KeyM") toggleMute();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line
  }, [isPlaying, songIndex, shuffle, loop, muted]);

  // mount audio element & sync state
  useEffect(() => {
    if (!audioRef.current) audioRef.current = document.createElement("audio");
    const audio = audioRef.current;
    audio.src = songs[songIndex].filePath;
    audio.volume = volume;
    audio.muted = muted;

    const timeUpdate = () => {
      const curr = audio.currentTime || 0;
      const dur = audio.duration || 0;
      setCurrentTime(curr);
      setDuration(dur);
      setProgress(dur ? (curr / dur) * 100 : 0);
      if (autoStopAt && curr >= autoStopAt - 0.15) {
        audio.pause();
        setIsPlaying(false);
        setAutoStopAt(null);
      }
    };
    const metaLoaded = () => {
      setDuration(audio.duration || 0);
      setCurrentTime(audio.currentTime || 0);
      setProgress(
        audio.duration ? (audio.currentTime / audio.duration) * 100 : 0
      );
    };
    audio.addEventListener("timeupdate", timeUpdate);
    audio.addEventListener("loadedmetadata", metaLoaded);
    return () => {
      audio.removeEventListener("timeupdate", timeUpdate);
      audio.removeEventListener("loadedmetadata", metaLoaded);
    };
    // eslint-disable-next-line
  }, [songIndex, autoStopAt]);

  // sync audio element when songIndex changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.src = songs[songIndex].filePath;
    audio.volume = volume;
    audio.muted = muted;
    if (isPlaying) {
      const playPromise = audio.play();
      if (playPromise && playPromise.catch)
        playPromise.catch(() => setIsPlaying(false));
    } else {
      audio.pause();
    }
    // eslint-disable-next-line
  }, [songIndex]);

  // handle ended (respects shuffle and loop)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onEnded = () => {
      if (loop) {
        audio.currentTime = 0;
        audio.play();
        return;
      }
      if (queue && queue.length) {
        const currentPos = queue.indexOf(songIndex);
        if (shuffle) {
          let rand;
          do {
            rand = Math.floor(Math.random() * songs.length);
          } while (rand === songIndex && songs.length > 1);
          setSongIndex(rand);
          setIsPlaying(true);
          addRecent(rand);
          return;
        }
        if (currentPos >= 0 && currentPos < queue.length - 1) {
          setSongIndex(queue[currentPos + 1]);
          setIsPlaying(true);
          addRecent(queue[currentPos + 1]);
          return;
        } else {
          setIsPlaying(false);
          return;
        }
      } else {
        if (shuffle) {
          let rand;
          do {
            rand = Math.floor(Math.random() * songs.length);
          } while (rand === songIndex && songs.length > 1);
          setSongIndex(rand);
          setIsPlaying(true);
          addRecent(rand);
          return;
        } else {
          if (songIndex === songs.length - 1) {
            setIsPlaying(false);
          } else {
            setSongIndex((s) => s + 1);
            setIsPlaying(true);
            addRecent(songIndex + 1);
          }
        }
      }
    };
    audio.addEventListener("ended", onEnded);
    return () => audio.removeEventListener("ended", onEnded);
  }, [songIndex, queue, shuffle, loop]);

  /* ---------- controls ---------- */
  const formatTime = (seconds) => {
    if (seconds === undefined || seconds === null || isNaN(seconds))
      return "--:--";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60)
      .toString()
      .padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const parseTimeInput = (str) => {
    // accepts mm:ss or m:ss or hh:mm:ss
    if (!str) return 0;
    const parts = str.split(":").map((p) => Number(p.trim()));
    if (parts.length === 1) return isNaN(parts[0]) ? 0 : parts[0];
    if (parts.length === 2)
      return (
        (isNaN(parts[0]) ? 0 : parts[0] * 60) + (isNaN(parts[1]) ? 0 : parts[1])
      );
    if (parts.length === 3)
      return (
        (isNaN(parts[0]) ? 0 : parts[0] * 3600) +
        (isNaN(parts[1]) ? 0 : parts[1] * 60) +
        (isNaN(parts[2]) ? 0 : parts[2])
      );
    return 0;
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      const playPromise = audio.play();
      if (playPromise && playPromise.catch)
        playPromise.catch(() => setIsPlaying(false));
      setIsPlaying(true);
    }
  };

  const playSong = (index) => {
    if (index < 0 || index >= songs.length) return;
    setSongIndex(index);
    setIsPlaying(true);
    addRecent(index);
    setQueue((q) => (q.includes(index) ? q : [index, ...q]));
  };

  const nextSong = () => {
    if (shuffle) {
      if (songs.length === 1) return;
      let rand;
      do {
        rand = Math.floor(Math.random() * songs.length);
      } while (rand === songIndex && songs.length > 1);
      setSongIndex(rand);
      setIsPlaying(true);
      addRecent(rand);
      return;
    }
    const idx = queue.indexOf(songIndex);
    if (idx >= 0 && idx < queue.length - 1) {
      setSongIndex(queue[idx + 1]);
      setIsPlaying(true);
      addRecent(queue[idx + 1]);
      return;
    }
    setSongIndex((prev) => {
      const next = prev + 1;
      if (next >= songs.length) {
        setIsPlaying(false);
        return prev;
      }
      return next;
    });
    setIsPlaying(true);
  };

  const prevSong = () => {
    const audio = audioRef.current;
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    const idx = queue.indexOf(songIndex);
    if (idx > 0) {
      setSongIndex(queue[idx - 1]);
      setIsPlaying(true);
      addRecent(queue[idx - 1]);
      return;
    }
    setSongIndex((prev) => {
      const next = prev - 1;
      if (next < 0) {
        return 0;
      }
      return next;
    });
    setIsPlaying(true);
  };

  const handleSeek = (e) => {
    const audio = audioRef.current;
    const value = Number(e.target.value);
    if (!audio || !audio.duration) return;
    const newTime = (value / 100) * audio.duration;
    audio.currentTime = newTime;
    setProgress(value);
  };

  const handleVolume = (e) => {
    const v = Number(e.target.value);
    setVolume(v);
    setMuted(v === 0);
    if (audioRef.current) {
      audioRef.current.volume = v;
      audioRef.current.muted = v === 0;
    }
  };

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    if (audioRef.current) audioRef.current.muted = next;
  };

  const toggleShuffle = () => setShuffle((s) => !s);
  const toggleLoop = () => setLoop((l) => !l);

  const addToQueue = (index) =>
    setQueue((q) => (q.includes(index) ? q : [...q, index]));
  const removeFromQueue = (index) =>
    setQueue((q) => q.filter((x) => x !== index));

  const toggleFavorite = (index) =>
    setFavorites((prev) => {
      const copy = new Set(prev);
      copy.has(index) ? copy.delete(index) : copy.add(index);
      return Array.from(copy);
    });

  const addRecent = (index) =>
    setRecent((r) => {
      const copy = [index, ...r.filter((x) => x !== index)];
      if (copy.length > 10) copy.pop();
      return copy;
    });

  /* ---------- Fav-part selection helpers ---------- */
  // convert percent -> seconds
  const percentToTime = (percent) => {
    if (!duration || isNaN(duration) || !isFinite(duration)) return 0;
    return (Math.max(0, Math.min(100, percent)) / 100) * duration;
  };
  // convert seconds -> percent
  const timeToPercent = (time) => {
    if (!duration || isNaN(duration) || !isFinite(duration) || duration === 0)
      return 0;
    return (time / duration) * 100;
  };

  const setStartToCurrent = () => setStartPercent(timeToPercent(currentTime));
  const setEndToCurrent = () => setEndPercent(timeToPercent(currentTime));

  const resetSelection = () => {
    setStartPercent(0);
    setEndPercent(Math.min(10, duration ? (10 / duration) * 100 : 10));
    setNewFavName("");
  };

  const saveFavPart = () => {
    // must have a song selected in Clips tab
    const targetSong =
      activeTab === "clips"
        ? clipSongIndex !== null
          ? clipSongIndex
          : songIndex
        : songIndex;
    const s = Math.max(0, percentToTime(Math.min(startPercent, endPercent)));
    const e = Math.max(0, percentToTime(Math.max(startPercent, endPercent)));
    if (!duration || e <= s || e - s < 0.5) {
      alert("Please choose a valid range (at least 0.5s).");
      return;
    }
    const name = newFavName.trim() || `${formatTime(s)} — ${formatTime(e)}`;
    const part = {
      id: Date.now() + Math.floor(Math.random() * 999),
      songIndex: targetSong,
      start: Math.round(s * 1000) / 1000,
      end: Math.round(e * 1000) / 1000,
      name,
      createdAt: Date.now(),
    };
    setFavParts((p) => [part, ...p]);
    setNewFavName("");
    alert("Saved favorite part!");
  };

  const playFavPart = (part) => {
    if (!part) return;
    setSongIndex(part.songIndex);
    const audio = audioRef.current;
    setTimeout(() => {
      if (audio) {
        audio.currentTime = Math.max(0, part.start);
        audio.play().catch(() => {});
        setIsPlaying(true);
        setAutoStopAt(part.end);
        addRecent(part.songIndex);
      }
    }, 60);
  };

  const deleteFavPart = (id) => {
    if (!window.confirm("Delete this favorite part?")) return;
    setFavParts((p) => p.filter((x) => x.id !== id));
  };

  const startEdit = (id, currentName) => {
    setEditingId(id);
    setEditingNameValue(currentName || "");
  };
  const cancelEdit = () => {
    setEditingId(null);
    setEditingNameValue("");
  };
  const saveEdit = (id) => {
    setFavParts((p) =>
      p.map((x) =>
        x.id === id ? { ...x, name: editingNameValue || x.name } : x
      )
    );
    setEditingId(null);
    setEditingNameValue("");
  };

  /* ---------- progress selection drag ---------- */
  const onHandlePointerDown = (which, ev) => {
    ev.preventDefault();
    draggingRef.current = which; // "start" or "end"

    const onMove = (e) => {
      if (!draggingRef.current) return;
      const wrapper = progressWrapperRef.current;
      if (!wrapper) return;
      const rect = wrapper.getBoundingClientRect();
      let clientX;
      if (e.touches && e.touches[0]) clientX = e.touches[0].clientX;
      else clientX = e.clientX;
      const pct = ((clientX - rect.left) / rect.width) * 100;
      const clamped = Math.max(0, Math.min(100, pct));
      const minGapSec = 0.5;
      const dur = durationRef.current || duration;
      const minGapPercent = dur ? Math.min(100, (minGapSec / dur) * 100) : 0.5;
      const sRef = startPercentRef.current;
      const eRef = endPercentRef.current;
      if (draggingRef.current === "start") {
        const newStart = Math.min(
          clamped,
          (eRef || endPercent) - minGapPercent
        );
        setStartPercent(Math.max(0, Math.min(newStart, 100)));
      } else if (draggingRef.current === "end") {
        const newEnd = Math.max(
          clamped,
          (sRef || startPercent) + minGapPercent
        );
        setEndPercent(Math.max(0, Math.min(newEnd, 100)));
      }
    };

    const onUp = () => {
      draggingRef.current = null;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onUp);
  };

  /* ---------- manual inputs for clip tab ---------- */
  const [manualStartInput, setManualStartInput] = useState("");
  const [manualEndInput, setManualEndInput] = useState("");
  useEffect(() => {
    const selStartSec = percentToTime(Math.min(startPercent, endPercent));
    const selEndSec = percentToTime(Math.max(startPercent, endPercent));
    setManualStartInput(formatTime(selStartSec));
    setManualEndInput(formatTime(selEndSec));
    // eslint-disable-next-line
  }, [startPercent, endPercent, songIndex, clipSongIndex]);

  const applyManualTimes = () => {
    const s = parseTimeInput(manualStartInput);
    const e = parseTimeInput(manualEndInput);
    if (!duration || s < 0 || e <= s || s >= duration) {
      alert("Invalid manual times for this song/duration.");
      return;
    }
    setStartPercent(timeToPercent(Math.max(0, Math.min(s, duration))));
    setEndPercent(timeToPercent(Math.max(0, Math.min(e, duration))));
  };

  /* ---------- filtered indices for song list ---------- */
  const filteredIndices = (() => {
    const q = searchTerm.trim().toLowerCase();
    let base = [];
    if (activeTab === "all") base = songs.map((_, i) => i);
    else if (activeTab === "favorites") base = favorites;
    else if (activeTab === "recent") base = recent;
    else if (activeTab === "queue") base = queue;
    else if (activeTab === "clips") {
      base = songs.map((_, i) => i);
    }
    if (!q) return base;
    return base.filter((i) => songs[i].songName.toLowerCase().includes(q));
  })();

  /* small helper to display selection times */
  const selStartSec = percentToTime(Math.min(startPercent, endPercent));
  const selEndSec = percentToTime(Math.max(startPercent, endPercent));

  /* ---------- helpers for saved-clips card rendering ---------- */
  const groupedFavParts = favParts.reduce((acc, p) => {
    const key = String(p.songIndex);
    if (!acc[key]) acc[key] = [];
    acc[key].push(p);
    return acc;
  }, {});

  /* ---------- render ---------- */
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {}
    try {
      localStorage.removeItem("auth-user");
    } catch {}
    navigate("/login");
  };

  return (
    <div className={`app theme-${theme}`}>
      <style>{
        /* small inline fixes to ensure drag handles and layout work without relying on base.css */ `
        .container { display:flex; gap:22px; align-items:flex-start; padding: 20px; max-width: 1200px; margin:auto; }
        .leftColumn { flex: 1 1 auto; min-width:0; }
        .rightColumn { width: 380px; flex-shrink: 0; position: relative; }
        .nowPlayingCard, .favPanel { position: sticky; top: 20px; z-index: 10; }
        .progressWrapper { position: relative; width: 100%; }
        .selectionOverlay { position: absolute; left: 0; top: 50%; transform: translateY(-50%); height: 8px; width: 100%; pointer-events: none; }
        .selectionRange { position: absolute; height: 8px; border-radius: 999px; background: linear-gradient(90deg, rgba(29,185,84,0.18), rgba(20,184,107,0.18)); box-shadow: 0 6px 24px rgba(20,184,107,0.08); z-index: 4; }
        .handle { position: absolute; top: 50%; transform: translate(-50%, -50%); width: 18px; height: 18px; border-radius: 50%; background: var(--accent); border: 2px solid rgba(255,255,255,0.08); box-shadow: 0 6px 18px rgba(0,0,0,0.2); cursor: grab; pointer-events: auto; z-index: 6; }
        .handle:active { cursor: grabbing; transform: translate(-50%, -50%) scale(1.02); }
        .favPanel { margin-bottom: 14px; padding: 12px; border-radius: 10px; background: var(--card-bg); border:1px solid var(--glass-border); box-shadow: var(--shadow-soft); }
        .favItem { display:flex; gap:8px; align-items:center; padding:8px; border-radius:8px; transition: background var(--t-fast); justify-content:space-between; }
        .favItem:hover { background: rgba(255,255,255,0.02); }
        .miniPlayer { position: fixed; left: 50%; transform: translateX(-50%); bottom: 14px; z-index: 25; width: 80%; max-width: 1000px; }
      `
      }</style>

      <nav className="nav">
        <ul>
          <li className="brand">
            <img src={logo} alt="Harmonix" /> Harmonix
          </li>
          <li className="nav-link">Home</li>
          <li className="nav-link">
            <Link className="aboutusankita" id="aboutusankita" to="/about">
              About
            </Link>
          </li>
          <li
            style={{
              marginLeft: "auto",
              display: "flex",
              gap: 8,
              alignItems: "center",
              position: "relative",
            }}
          >
            <div ref={themeRef} style={{ position: "relative", display:"flex", gap:8, alignItems:"center" }}>
              {/* NOTE: stopPropagation protects the outside-click detector from reacting to clicks inside this widget */}
              <button
                className="iconButton"
                onClick={(e) => {
                  e.stopPropagation();
                  setThemeOpen((s) => !s);
                }}
                aria-haspopup="true"
                aria-expanded={themeOpen}
                title="Theme"
              >
                <FaPalette />
              </button>

              {themeOpen && (
                <div
                  className={`themeDropdown ${themeOpen ? "open" : ""}`}
                  role="menu"
                  aria-label="Choose theme"
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <button
                    className={`themeOption ${
                      theme === "professional" ? "selected" : ""
                    }`}
                    onClick={() => {
                      setTheme("professional");
                      setThemeOpen(false);
                    }}
                  >
                    <span className="swatch swatch-professional" /> Professional
                  </button>
                  <button
                    className={`themeOption ${
                      theme === "cute" ? "selected" : ""
                    }`}
                    onClick={() => {
                      setTheme("cute");
                      setThemeOpen(false);
                    }}
                  >
                    <span className="swatch swatch-cute" /> Cute
                  </button>
                  <button
                    className={`themeOption ${
                      theme === "colorful" ? "selected" : ""
                    }`}
                    onClick={() => {
                      setTheme("colorful");
                      setThemeOpen(false);
                    }}
                  >
                    <span className="swatch swatch-colorful" /> Colorful
                  </button>
                </div>
              )}
              <button
                className="iconButton"
                onClick={handleLogout}
                title="Logout"
                style={{ marginLeft: 8 }}
              >
                Logout
              </button>
            </div>
          </li>
        </ul>
      </nav>

      <div className={`container tab-${activeTab}`}>
        {/* LEFT */}
        <div className="leftColumn">
          <h1>My kinda bollywood</h1>

          <div
            className="topControlsRow"
            style={{
              display: "flex",
              gap: 12,
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <div className="searchBar" style={{ flex: 1 }}>
              <FaSearch />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search songs, artists..."
              />
            </div>
            <div className="tabs">
              <button
                className={`tabBtn ${activeTab === "all" ? "active" : ""}`}
                onClick={() => {
                  setActiveTab("all");
                  setClipSongIndex(null);
                }}
              >
                All
              </button>
              <button
                className={`tabBtn ${
                  activeTab === "favorites" ? "active" : ""
                }`}
                onClick={() => {
                  setActiveTab("favorites");
                  setClipSongIndex(null);
                }}
              >
                Favorites
              </button>
              <button
                className={`tabBtn ${activeTab === "recent" ? "active" : ""}`}
                onClick={() => {
                  setActiveTab("recent");
                  setClipSongIndex(null);
                }}
              >
                Recent
              </button>
              <button
                className={`tabBtn ${activeTab === "queue" ? "active" : ""}`}
                onClick={() => {
                  setActiveTab("queue");
                  setClipSongIndex(null);
                }}
              >
                Queue
              </button>
              <button
                className={`tabBtn ${activeTab === "clips" ? "active" : ""}`}
                onClick={() => {
                  setActiveTab(
                    "clips"
                  ); /* user will select song in left grid */
                }}
              >
                Flagged
              </button>
            </div>
          </div>

          {/* Saved Clips card: shown only in Clips tab */}
          {activeTab === "clips" && (
            <div
              className="favPanel"
              aria-live="polite"
              style={{ marginBottom: 16 }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <h3 style={{ margin: 0 }}>Saved Clips</h3>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <small style={{ color: "var(--muted)" }}>
                    {Object.keys(groupedFavParts).length} songs
                  </small>
                  <button
                    className="iconButton small"
                    onClick={() => {
                      if (!window.confirm("Clear all saved clips?")) return;
                      setFavParts([]);
                    }}
                    title="Clear all"
                  >
                    <FaTrashAlt />
                  </button>
                </div>
              </div>

              {favParts.length === 0 && (
                <div className="emptyState">
                  No favorite parts yet — select a range and hit Save.
                </div>
              )}

              {Object.keys(groupedFavParts).length > 0 && (
                <div style={{ display: "grid", gap: 10 }}>
                  {Object.keys(groupedFavParts).map((songIdx) => {
                    const idx = Number(songIdx);
                    const parts = groupedFavParts[songIdx]
                      .slice()
                      .sort((a, b) => a.createdAt - b.createdAt);
                    return (
                      <div
                        key={songIdx}
                        style={{
                          borderRadius: 8,
                          padding: 8,
                          background: "rgba(255,255,255,0.02)",
                          display: "flex",
                          gap: 12,
                          alignItems: "flex-start",
                        }}
                      >
                        <img
                          src={songs[idx] ? songs[idx].coverPath : ""}
                          alt={songs[idx] ? songs[idx].songName : "song"}
                          style={{
                            width: 56,
                            height: 56,
                            objectFit: "cover",
                            borderRadius: 6,
                          }}
                        />
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              gap: 12,
                            }}
                          >
                            <div style={{ fontWeight: 700 }}>
                              {songs[idx] ? songs[idx].songName : `Song ${idx}`}
                            </div>
                            <div
                              style={{ color: "var(--muted)", fontSize: 13 }}
                            >
                              {parts.length} clip{parts.length > 1 ? "s" : ""}
                            </div>
                          </div>
                          <div
                            style={{
                              marginTop: 8,
                              display: "flex",
                              flexDirection: "column",
                              gap: 6,
                            }}
                          >
                            {parts.map((p) => (
                              <div
                                key={p.id}
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  gap: 8,
                                }}
                              >
                                <div style={{ minWidth: 0 }}>
                                  <div
                                    style={{ fontWeight: 600, fontSize: 14 }}
                                  >
                                    {p.name}
                                  </div>
                                  <div
                                    style={{
                                      color: "var(--muted)",
                                      fontSize: 13,
                                    }}
                                  >
                                    {formatTime(p.start)} — {formatTime(p.end)}
                                  </div>
                                </div>
                                <div style={{ display: "flex", gap: 8 }}>
                                  <button
                                    className="iconButton"
                                    onClick={() => playFavPart(p)}
                                    title="Play"
                                  >
                                    <FaPlayCircle />
                                  </button>
                                  <button
                                    className="iconButton"
                                    onClick={() => startEdit(p.id, p.name)}
                                    title="Rename"
                                  >
                                    <FaEdit />
                                  </button>
                                  <button
                                    className="iconButton"
                                    onClick={() => deleteFavPart(p.id)}
                                    title="Delete"
                                  >
                                    <FaTrashAlt />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Songs Grid */}
          <div className="songItemContainer">
            {filteredIndices.length === 0 && (
              <div className="emptyState">No songs found.</div>
            )}
            {filteredIndices.map((index) => {
              const song = songs[index];
              const playingThis = isPlaying && songIndex === index;
              const isFav = favorites.includes(index);
              const selectable = activeTab === "clips";
              const isSelectedForClip = clipSongIndex === index;
              return (
                <div
                  key={index}
                  className={`songItem ${playingThis ? "playing" : ""} ${
                    selectable && isSelectedForClip ? "queueActive" : ""
                  }`}
                  onClick={() => {
                    if (selectable) {
                      setClipSongIndex(index);
                      setSongIndex(index);
                      resetSelection();
                    } else {
                      playSong(index);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <img
                    src={song.coverPath}
                    alt={`${song.songName} cover`}
                    className="cover"
                  />
                  <div className="songMeta">
                    <div className="songTitleRow">
                      <span className="songName">{song.songName}</span>
                      <div className="songActions">
                        <button
                          className="iconButton"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(index);
                          }}
                          aria-label="favorite"
                        >
                          <FaHeart
                            style={{ color: isFav ? "#e74c3c" : undefined }}
                          />
                        </button>
                        {queue.includes(index) ? (
                          <button
                            className="iconButton"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFromQueue(index);
                            }}
                            aria-label="remove from queue"
                            title="Remove from queue"
                          >
                            <FaTimes />
                          </button>
                        ) : (
                          <button
                            className="iconButton"
                            onClick={(e) => {
                              e.stopPropagation();
                              addToQueue(index);
                            }}
                            aria-label="add to queue"
                            title="Add to queue"
                          >
                            <FaPlus />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  <div
                    className="songPlayIcon"
                    onClick={() => playSong(index)}
                    aria-hidden
                  >
                    {playingThis ? <FaPauseCircle /> : <FaPlayCircle />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT */}
        <div className="rightColumn">
          {/* Now Playing Card (keeps controls) */}
          <div
            className="nowPlayingCard"
            role="region"
            aria-label="Now playing"
          >
            <img
              src={songs[songIndex].coverPath}
              alt="Now cover"
              className="nowCover"
            />
            <div className="nowMeta">
              <div className="nowTitle">{songs[songIndex].songName}</div>

              <div className="nowControlsRow">
                <div className="buttonsRow">
                  <FaRandom
                    className={`controlIcon ${shuffle ? "active" : ""}`}
                    onClick={toggleShuffle}
                    title="Shuffle (S)"
                  />
                  <FaStepBackward
                    className="controlIcon"
                    onClick={prevSong}
                    title="Previous"
                  />
                  {isPlaying ? (
                    <FaPauseCircle
                      className="controlIcon playLarge"
                      onClick={togglePlay}
                    />
                  ) : (
                    <FaPlayCircle
                      className="controlIcon playLarge"
                      onClick={togglePlay}
                    />
                  )}
                  <FaStepForward
                    className="controlIcon"
                    onClick={nextSong}
                    title="Next"
                  />
                  <FaRedo
                    className={`controlIcon ${loop ? "active" : ""}`}
                    onClick={toggleLoop}
                    title={`Loop: ${loop ? "On" : "Off"}`}
                  />
                </div>

                <div className="volumeRow">
                  <button
                    className="iconButton"
                    onClick={toggleMute}
                    title="Mute (M)"
                  >
                    {muted || volume === 0 ? <FaVolumeMute /> : <FaVolumeUp />}
                  </button>
                  <input
                    className="volumeRange"
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={muted ? 0 : volume}
                    onChange={handleVolume}
                    aria-label="Volume"
                  />
                </div>
              </div>

              <div className="progressRow">
                <span className="time left">{formatTime(currentTime)}</span>

                <div
                  className="progressWrapper"
                  ref={progressWrapperRef}
                  style={{ flex: 1 }}
                >
                  <input
                    ref={progressRef}
                    className="progressBar"
                    type="range"
                    min="0"
                    max="100"
                    value={Math.min(100, Math.max(0, progress || 0))}
                    onChange={handleSeek}
                    aria-label="Seek"
                  />
                  <div className="selectionOverlay" aria-hidden>
                    <div
                      className="selectionRange"
                      style={{
                        left: `${Math.min(startPercent, endPercent)}%`,
                        width: `${Math.abs(endPercent - startPercent)}%`,
                      }}
                    />
                    <div
                      className="handle"
                      role="slider"
                      aria-label="selection start"
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={Math.round(startPercent)}
                      tabIndex={0}
                      style={{ left: `${startPercent}%` }}
                      onMouseDown={(e) => onHandlePointerDown("start", e)}
                      onTouchStart={(e) => onHandlePointerDown("start", e)}
                    />
                    <div
                      className="handle"
                      role="slider"
                      aria-label="selection end"
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={Math.round(endPercent)}
                      tabIndex={0}
                      style={{ left: `${endPercent}%` }}
                      onMouseDown={(e) => onHandlePointerDown("end", e)}
                      onTouchStart={(e) => onHandlePointerDown("end", e)}
                    />
                  </div>
                </div>

                <span className="time right">{formatTime(duration)}</span>
              </div>

              {/* Fav-part controls: show only when Clips tab is active */}
              {activeTab === "clips" && (
                <div className="favControls" style={{ alignItems: "center" }}>
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      alignItems: "center",
                      flexWrap: "wrap",
                    }}
                  >
                    <button
                      className="iconButton small"
                      onClick={setStartToCurrent}
                      title="Set start to current time"
                    >
                      Set start
                    </button>
                    <button
                      className="iconButton small"
                      onClick={setEndToCurrent}
                      title="Set end to current time"
                    >
                      Set end
                    </button>
                    <button
                      className="iconButton small"
                      onClick={resetSelection}
                      title="Reset selection"
                    >
                      Reset
                    </button>
                  </div>

                  <div
                    style={{
                      marginLeft: "auto",
                      display: "flex",
                      gap: 8,
                      alignItems: "center",
                      flexWrap: "wrap",
                    }}
                  >
                    <div
                      style={{ display: "flex", gap: 8, alignItems: "center" }}
                    >
                      <small style={{ color: "var(--muted)" }}>
                        {formatTime(selStartSec)}
                      </small>
                      <span style={{ color: "var(--muted)" }}>—</span>
                      <small style={{ color: "var(--muted)" }}>
                        {formatTime(selEndSec)}
                      </small>
                    </div>

                    <input
                      value={newFavName}
                      onChange={(e) => setNewFavName(e.target.value)}
                      placeholder="Name (optional)"
                      style={{
                        padding: "6px 8px",
                        borderRadius: 8,
                        border: "1px solid rgba(255,255,255,0.03)",
                        background: "transparent",
                        color: "var(--text)",
                        minWidth: 150,
                      }}
                    />
                    <button
                      className="iconButton small"
                      onClick={saveFavPart}
                      title="Save favorite part"
                    >
                      <FaSave style={{ marginRight: "0.5rem" }} />
                      Save
                    </button>
                  </div>
                </div>
              )}

              <div className="nowExtra">
                <img
                  src={playingGif}
                  alt="playing visual"
                  style={{ opacity: isPlaying ? 1 : 0 }}
                />
                <span className="masterSongName">
                  {songs[songIndex].songName}
                </span>
                <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                  <button
                    className="iconButton small"
                    onClick={() => setQueueOpen((v) => !v)}
                    title="Toggle queue"
                  >
                    <FaListUl />
                  </button>
                  <button
                    className="iconButton small"
                    onClick={() => setShowMini((s) => !s)}
                    title="Toggle mini player"
                  >
                    {showMini ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Clips UI: show only when Clips tab active (per-song editor & saved clips for selected song) */}
          {activeTab === "clips" && (
            <div
              className="favPanel"
              aria-live="polite"
              style={{ marginTop: 12 }}
            >
              <h3 style={{ marginTop: 0 }}>Clips — Select a song to edit</h3>

              <div
                style={{
                  display: "flex",
                  gap: 8,
                  alignItems: "center",
                  marginBottom: 8,
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <label
                    style={{
                      color: "var(--muted)",
                      display: "block",
                      fontSize: 13,
                    }}
                  >
                    Selected song
                  </label>
                  <select
                    value={clipSongIndex === null ? "" : clipSongIndex}
                    onChange={(e) => {
                      const val =
                        e.target.value === "" ? null : Number(e.target.value);
                      setClipSongIndex(val);
                      if (val !== null) setSongIndex(val);
                    }}
                    style={{
                      padding: 8,
                      borderRadius: 8,
                      background: "transparent",
                      color: "var(--text)",
                      border: "1px solid rgba(255,255,255,0.03)",
                    }}
                  >
                    <option value="">Choose song…</option>
                    {songs.map((s, idx) => (
                      <option key={idx} value={idx}>
                        {s.songName}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <div>
                    <label style={{ color: "var(--muted)", fontSize: 13 }}>
                      Start (mm:ss)
                    </label>
                    <input
                      value={manualStartInput}
                      onChange={(e) => setManualStartInput(e.target.value)}
                      placeholder="0:30"
                      style={{
                        padding: 6,
                        borderRadius: 8,
                        border: "1px solid rgba(255,255,255,0.03)",
                        background: "transparent",
                        color: "var(--text)",
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ color: "var(--muted)", fontSize: 13 }}>
                      End (mm:ss)
                    </label>
                    <input
                      value={manualEndInput}
                      onChange={(e) => setManualEndInput(e.target.value)}
                      placeholder="1:00"
                      style={{
                        padding: 6,
                        borderRadius: 8,
                        border: "1px solid rgba(255,255,255,0.03)",
                        background: "transparent",
                        color: "var(--text)",
                      }}
                    />
                  </div>

                  <button
                    className="iconButton small"
                    onClick={applyManualTimes}
                    title="Apply times"
                  >
                    Apply
                  </button>
                </div>
              </div>

              <div style={{ color: "var(--muted)", marginBottom: 8 }}>
                Tip: drag the handles on the progress bar OR use manual time
                inputs. Click "Set start" / "Set end" to snap to playback time.
              </div>

              <div style={{ marginTop: 8 }}>
                <h4 style={{ margin: "8px 0" }}>Saved clips for this song</h4>

                {clipSongIndex === null && (
                  <div className="emptyState">
                    No song selected — pick a song from the left to see its
                    clips.
                  </div>
                )}

                {clipSongIndex !== null &&
                  favParts.filter((p) => p.songIndex === clipSongIndex)
                    .length === 0 && (
                    <div className="emptyState">
                      No clips saved for this song yet.
                    </div>
                  )}

                {clipSongIndex !== null &&
                  favParts
                    .filter((p) => p.songIndex === clipSongIndex)
                    .map((p) => (
                      <div
                        key={p.id}
                        className="favItem"
                        style={{ justifyContent: "space-between" }}
                      >
                        <div className="favMeta">
                          {editingId === p.id ? (
                            <div
                              style={{
                                display: "flex",
                                gap: 8,
                                alignItems: "center",
                              }}
                            >
                              <input
                                value={editingNameValue}
                                onChange={(e) =>
                                  setEditingNameValue(e.target.value)
                                }
                                style={{
                                  padding: 6,
                                  borderRadius: 8,
                                  border: "1px solid rgba(255,255,255,0.03)",
                                  background: "transparent",
                                  color: "var(--text)",
                                }}
                              />
                              <button
                                className="iconButton small"
                                onClick={() => saveEdit(p.id)}
                                title="Save"
                              >
                                <FaSave />
                              </button>
                              <button
                                className="iconButton small"
                                onClick={cancelEdit}
                                title="Cancel"
                              >
                                <FaTimes />
                              </button>
                            </div>
                          ) : (
                            <>
                              <div style={{ fontWeight: 700 }}>{p.name}</div>
                              <small>
                                {formatTime(p.start)} — {formatTime(p.end)}
                              </small>
                            </>
                          )}
                        </div>

                        <div style={{ display: "flex", gap: 8 }}>
                          <button
                            className="iconButton"
                            onClick={() => playFavPart(p)}
                            title="Play part"
                          >
                            <FaPlayCircle />
                          </button>
                          <button
                            className="iconButton"
                            onClick={() => startEdit(p.id, p.name)}
                            title="Rename"
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="iconButton"
                            onClick={() => deleteFavPart(p.id)}
                            title="Delete part"
                          >
                            <FaTrashAlt />
                          </button>
                        </div>
                      </div>
                    ))}
              </div>
            </div>
          )}

          {queueOpen && (
            <div
              className="queuePanel"
              aria-live="polite"
              style={{ marginTop: 12 }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <h3 style={{ margin: 0 }}>Up Next</h3>
                <button
                  className="iconButton"
                  onClick={() => {
                    setQueue([]);
                  }}
                  title="Clear queue"
                >
                  <FaTrashAlt />
                </button>
              </div>
              <ul>
                {queue.length === 0 && (
                  <li className="emptyState">Queue is empty</li>
                )}
                {queue.map((i) => (
                  <li key={i} className={i === songIndex ? "queueActive" : ""}>
                    <img
                      src={songs[i].coverPath}
                      alt="qcover"
                      className="qCover"
                    />
                    <span className="qTitle">{songs[i].songName}</span>
                    <div className="qActions">
                      <button
                        onClick={() => {
                          setSongIndex(i);
                          setIsPlaying(true);
                          addRecent(i);
                        }}
                      >
                        Play
                      </button>
                      <button
                        className="iconButton"
                        onClick={() => removeFromQueue(i)}
                        title="Remove from queue"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {showMini && (
        <div className="miniPlayer" role="toolbar" aria-label="Mini player">
          <img src={songs[songIndex].coverPath} alt="mini cover" />
          <div className="miniMeta">
            <div className="miniTitle">{songs[songIndex].songName}</div>
            <div className="miniTime">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>
          <div className="miniControls">
            <FaStepBackward onClick={prevSong} />
            {isPlaying ? (
              <FaPauseCircle onClick={togglePlay} />
            ) : (
              <FaPlayCircle onClick={togglePlay} />
            )}
            <FaStepForward onClick={nextSong} />
          </div>
          <div className="miniProgress">
            <input
              className="miniProgressBar"
              type="range"
              min="0"
              max="100"
              value={Math.min(100, Math.max(0, progress || 0))}
              onChange={handleSeek}
              aria-label="Mini seek"
            />
          </div>
        </div>
      )}

      {/* keep audio element as fallback / for direct binding */}
      <audio ref={audioRef} src={songs[songIndex].filePath} />
    </div>
  );
};

export default Home;
