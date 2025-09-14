import React from "react";
import "../styles/aboutus.css" // make sure aboutus.css is in src folder or adjust path
import img1 from "../assets/img1.jpg";
import img11 from "../assets/img11.jpg";

const About = () => {
  return (
    <div className="carousel">
      {/* Main profile item */}
      <div className="list">
        <div className="item">
          <img src={img1} alt="Ankita" />
          <div className="content">
            <div className="author">Software Developer</div>
            <div className="title">Ankita M</div>
            <div className="topic">Garden City University</div>
            <div className="des">
              B.Tech CSE Student | Garden City University | Bangalore <br />
              I'm a Computer Science student at Garden City University,
              Bangalore, passionate about building creative and user-friendly
              websites. Currently learning web development, I enjoy turning
              ideas into visually engaging and functional web pages. With a
              strong eye for design and a love for technology, I'm always
              exploring new ways to bring creativity into code.
              <p style={{ fontSize: "1.5rem" }}>
                Feel free to reach out to me at:
              </p>
            </div>
            <div className="buttons">
              <button>Email: mallickankita0102@gmail.com</button>
              <button>Phone: 9380727424</button>
              <button>Roll No: 23BTCE198</button>
            </div>
          </div>
        </div>
      </div>

      {/* Thumbnail profile */}
      <div className="thumbnail">
        <div className="item">
          <img src={img11} alt="Ankita Thumbnail" />
          <div className="content">
            <div className="title">Ankita M</div>
            <div className="description">Btech Robotics</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
