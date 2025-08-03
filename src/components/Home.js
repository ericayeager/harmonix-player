// src/components/Home.js
import React, { useEffect, useRef, useState } from "react";
import "../style.css";
import logo from "../assets/logo.png";
import playingGif from "../assets/playing.gif";

const songs = [
  { songName: "Dekha hazaro dafaa", filePath: "songs/1.mp3", coverPath: "covers/1.jpg" },
  { songName: "Tu itni khoobsurat hai", filePath: "songs/2.mp3", coverPath: "covers/2.jpg" },
  { songName: "Nazar na lag jaaye", filePath: "songs/3.mp3", coverPath: "covers/3.jpg" },
  { songName: "Ishq De Fanniyar", filePath: "songs/4.mp3", coverPath: "covers/4.jpg" },
  { songName: "Ishq Bulaava", filePath: "songs/5.mp3", coverPath: "covers/5.jpg" },
  { songName: "Aahun Aahun", filePath: "songs/2.mp3", coverPath: "covers/6.jpg" },
  { songName: "Aa Zara", filePath: "songs/2.mp3", coverPath: "covers/7.jpg" },
  { songName: "Right Now Now", filePath: "songs/2.mp3", coverPath: "covers/8.jpg" },
  { songName: "Love Me Love Me", filePath: "songs/2.mp3", coverPath: "covers/9.jpg" },
  { songName: "Lat Lag Gayee", filePath: "songs/4.mp3", coverPath: "covers/10.jpg" },
];

const Home = () => {
  const audioRef = useRef(null);
  const [songIndex, setSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const playSong = (index) => {
    setSongIndex(index);
    setIsPlaying(true);
  };

  const nextSong = () => {
    setSongIndex((prev) => (prev + 1) % songs.length);
    setIsPlaying(true);
  };

  const prevSong = () => {
    setSongIndex((prev) => (prev === 0 ? songs.length - 1 : prev - 1));
    setIsPlaying(true);
  };

  const handleSeek = (e) => {
    const audio = audioRef.current;
    const newTime = (e.target.value / 100) * audio.duration;
    audio.currentTime = newTime;
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return "--:--";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  useEffect(() => {
  const audio = audioRef.current;
  if (isPlaying) {
    audio.play();
  } else {
    audio.pause();
  }
}, [songIndex, isPlaying]);


  return (
    <>
      <nav>
        <ul>
          <li className="brand">
            <img src={logo} alt="Spotify" /> Harmonix
          </li>
          <li>Home</li>
          <a id="aboutusankita" href="/aboutus.html" target="_blank">
            <li>About</li>
          </a>
        </ul>
      </nav>

      <div className="container">
        <div className="songList">
          <h1>My kinda bollywood</h1>
          <div className="songItemContainer">
            {songs.map((song, index) => (
              <div
                className="songItem"
                key={index}
                onClick={() => playSong(index)}
              >
                <img src={song.coverPath} alt="cover" />
                <span className="songName">{song.songName}</span> <br />
                <span className="songlistplay">
                  <span className="timestamp">
                    {formatTime(duration)}{" "}
                    <i
                      className={`far songItemPlay ${
                        isPlaying && songIndex === index
                          ? "fa-pause-circle"
                          : "fa-play-circle"
                      }`}
                    ></i>
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bottom">
        <input
          type="range"
          id="myProgressBar"
          min="0"
          max="100"
          value={progress}
          onChange={handleSeek}
        />
        <div className="icons">
          <i className="fas fa-3x fa-step-backward" onClick={prevSong}></i>
          <i
            className={`far fa-3x ${
              isPlaying ? "fa-pause-circle" : "fa-play-circle"
            }`}
            id="masterPlay"
            onClick={togglePlay}
          ></i>
          <i className="fas fa-3x fa-step-forward" onClick={nextSong}></i>
        </div>
        <div className="songInfo">
          <img
            src={playingGif}
            width="42px"
            alt="gif"
            id="gif"
            style={{ opacity: isPlaying ? 1 : 0 }}
          />
          <span id="masterSongName">{songs[songIndex].songName}</span>
        </div>
      </div>

      <audio
        ref={audioRef}
        src={songs[songIndex].filePath}
        onTimeUpdate={() => {
          const audio = audioRef.current;
          setProgress((audio.currentTime / audio.duration) * 100);
        }}
        onLoadedMetadata={() => {
          const audio = audioRef.current;
          setDuration(audio.duration);
        }}
        onEnded={nextSong}
      />
    </>
  );
};

export default Home;
