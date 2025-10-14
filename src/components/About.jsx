import React from "react";
import "../styles/aboutus.css";
import img1 from "../assets/img1.jpg";

const About = () => {
  return (
    <section className="about-section">
      <div className="about-container">
        <div className="about-left">
          <h1>About Harmonix</h1>
          <p>
            A creative and user-friendly music experience. Built with care,
            designed to be fun, fast, and visually engaging.
          </p>

          <div className="profile-card">
            <div className="subtitle">Software Developer</div>
            <h2>Ankita M</h2>
            <div className="subtitle">Garden City University</div>

            <p>
              B.Tech CSE Student | Garden City University | Bangalore. I'm a
              Computer Science student passionate about building creative and
              user-friendly websites. I enjoy turning ideas into engaging and
              functional web pages.
            </p>

            <p>Feel free to reach out to me at:</p>
            <div className="contact-buttons">
              <a className="btn-neon" href="mailto:mallickankita0102@gmail.com">
                Email: mallickankita0102@gmail.com
              </a>
              <a className="btn-neon" href="tel:9380727424">
                Phone: 9380727424
              </a>
              <span className="btn-neon" style={{ pointerEvents: "none" }}>
                Roll No: 23BTCE198
              </span>
            </div>

            <div className="stats">
              <div className="stat-box">
                <div>Songs</div>
                <div>10+</div>
              </div>
              <div className="stat-box">
                <div>Features</div>
                <div>Flagged / Queue</div>
              </div>
              <div className="stat-box">
                <div>Themes</div>
                <div>3</div>
              </div>
            </div>
          </div>
        </div>      
      </div>
    </section>
  );
};

export default About;
