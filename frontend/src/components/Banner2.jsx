import "./Banner2.css";
import bannerImage from "../assets/images/banner2.png";

const Banner = () => (
  <div className="banner2">
    <div className="banner2-content">
      <h2>SAFETY TIPS!</h2>
      <p>
        The googles are worn<br></br>for protection <br></br>of the eyes
      </p>
    </div>
    <img
      src={bannerImage}
      alt="Construction Equipment"
      className="banner2-image"
    />
  </div>
);

export default Banner;
