import { useEffect, useState } from "react";
import "./Banner.css";
import bannerImage1 from "../assets/images/banner.png";
import bannerImage2 from "../assets/images/banner8.png";
import bannerImage3 from "../assets/images/banner9.png";
import bannerImage4 from "../assets/images/banner10.png";

const Banner = () => {
  const banners = [
    {
      title: "FLASH SALE!",
      description: "50% Off<br /> Construction<br /> equipments",
      image: bannerImage1,
      blend: false,
    },
    {
      title: "NEW ARRIVAL!",
      description: "Get the latest<br /> tools and<br /> accessories",
      image: bannerImage2,
      blend: false,
    },
    {
      title: "LIMITED TIME OFFER!",
      description: "30% Off<br /> on all<br /> safety gear",
      image: bannerImage3,
      blend: false,
    },
    {
      title: "MEGA DISCOUNT!",
      description: "Up to 70% Off<br /> on selected<br /> items",
      image: bannerImage4,
      blend: false,
    },
  ];

  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBannerIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [banners.length]);

  return (
    <div className="banner">
      <div className="banner-content">
        <h2>{banners[currentBannerIndex].title}</h2>
        <p
          dangerouslySetInnerHTML={{
            __html: banners[currentBannerIndex].description,
          }}
        ></p>
      </div>
      <div className="banner-image-container">
        <img
          src={banners[currentBannerIndex].image}
          alt={banners[currentBannerIndex].title}
          className={`banner-image ${
            banners[currentBannerIndex].blend ? "banner-image-blend" : ""
          }`}
        />
      </div>
    </div>
  );
};

export default Banner;
