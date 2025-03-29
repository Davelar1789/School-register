import "./Settings.modules.css";
import Cameralogo from "../../../assets/images/cameralogo3.png";

const Settings = () => {
  return (
    <div className="settings-page">
      <div className="settings-content">
        <main className="main-content">
          <h2>General Settings</h2>
          <div className="settings-form">
            <div className="upload-logo-section">
              <div className="logo-placeholder">
                <img src={Cameralogo} alt="Logo" className="logo-img" />
              </div>
              <a href="#" className="upload-logo">
                Upload Logo
              </a>
            </div>
            <div className="settings-fields">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="siteName">Site Name</label>
                  <input
                    type="text"
                    id="siteName"
                    className="form-input"
                    placeholder="Bright Web"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="copyRight">Copy Right</label>
                  <input
                    type="text"
                    id="copyRight"
                    className="form-input"
                    placeholder="All rights Reserved@brightweb"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="seoTitle">SEO Title</label>
                  <input
                    type="text"
                    id="seoTitle"
                    className="form-input"
                    placeholder="Bright web is a hybrid dashboard"
                  />
                </div>
                <div className="form-group seo-description-group">
                  <label htmlFor="seoDescription">SEO Description</label>
                  <textarea
                    id="seoDescription"
                    className="form-input seo-description"
                  >
                    Bright web is a hybrid dashboard
                  </textarea>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="seoKeywords">SEO Keywords</label>
                  <input
                    type="text"
                    id="seoKeywords"
                    className="form-input"
                    placeholder="CEO"
                  />
                </div>
              </div>
            </div>
            <div className="save-button-container">
              <button className="save-button">Save</button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Settings;
