/* eslint-disable react/prop-types */
import "./InfoBox.css";

const InfoBox = ({ title, value, percentage, icon }) => {
  const isIncrease = percentage.includes("Up");
  const [percent, ...textParts] = percentage.split(" ");

  return (
    <div className="px-10 border w-full  border-slate-400 py-5 rounded-lg">
      <div className="">
        <div className="">
          <div className="info-title-icon">
            <div className="info-title">
              <p>{title}</p>
            </div>
            <div className="info-icon">
              <img src={icon} alt={`${title} icon`} />
            </div>
          </div>
          <p className="info-value">{value}</p>
          <div className="percentage-container">
            <span
              className={
                isIncrease ? "percentage increase" : "percentage decrease"
              }
            >
              {percent}
            </span>
            <span className="percentage-text">{textParts.join(" ")}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoBox;
