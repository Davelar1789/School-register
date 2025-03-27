import { useEffect, useState } from "react";

import "./Inbox.modules.css";
import labelIcon from "../../../assets/images/label.png";
import infoIcon from "../../../assets/images/emailinfo.png";
import deleteIcon from "../../../assets/images/delete.png";
import searchIcon from "../../../assets/images/search.png";
import ComposeEmail from "./ComposeEmail";
import axios from "axios";

const Inbox = () => {
  const [toggleCompose, setToggleCompose] = useState(true);

  const handleOnClick = () => {
    setToggleCompose(!toggleCompose);
  };

  const fetchMails = async () => {
    await axios
      .get("/api/admin/allMails", { withCredentials: true })
      .then((response) => {
        setEmails(response.data.data);
        console.log(response.data);
      });
  };

  const [emails, setEmails] = useState([]);

  const [selectedEmails, setSelectedEmails] = useState([]);
  const [deletedEmails, setDeletedEmails] = useState([]);
  const [currentFolder, setCurrentFolder] = useState("Inbox");
  const [selectedLabels, setSelectedLabels] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const handleLike = (id) => {
    setEmails(
      emails.map((email) =>
        email.id === id ? { ...email, liked: !email.liked } : email
      )
    );
  };

  const handleDelete = () => {};

  const openDeleteModal = () => {
    if (
      selectedEmails.length > 0 &&
      window.confirm("Are you sure you want to delete the selected email(s)?")
    ) {
      handleDelete();
    }
  };

  const handleCheckboxChange = (id) => {
    setSelectedEmails((prev) =>
      prev.includes(id) ? prev.filter((eId) => eId !== id) : [...prev, id]
    );
  };

  const handleFolderClick = (folder) => {
    const folderCounts = {
      Inbox: emails.length,
      Starred: emails.filter((e) => e.liked).length,
      Sent: 0,
      Drafts: 0,
      Spam: 0,
      Important: 0,
      Bin: deletedEmails.length,
    };

    if (folderCounts[folder] === 0) {
      setModalMessage(`You have no ${folder.toLowerCase()} messages.`);
      setShowModal(true);
    } else {
      setCurrentFolder(folder);
      setSelectedLabels([]); // Clear label selection when changing folders
    }
  };

  const filteredEmails = () => {
    let filtered = [];
    if (currentFolder === "Inbox") filtered = emails;
    if (currentFolder === "Starred") filtered = emails.filter((e) => e.liked);
    if (currentFolder === "Bin") filtered = deletedEmails;

    if (selectedLabels.length > 0) {
      filtered = filtered.filter((email) =>
        selectedLabels.includes(email.label)
      );
    }
    return filtered;
  };

  useEffect(() => {
    fetchMails();
  }, []);

  return (
    <div className="inbox-page">
      <div className="inbox-content">
        <main className="main-content">
          <h2>{currentFolder}</h2>
          <div className="email-container">
            <div className="email-sidebar">
              <button className="compose-btn" onClick={handleOnClick}>
                + Compose
              </button>
              <div className="email-heading">My Email</div>
              <div className="email-folder">
                <div
                  className={`folder-item ${
                    currentFolder === "Inbox" ? "selected" : ""
                  }`}
                  onClick={() => handleFolderClick("Inbox")}
                >
                  Sent <span className="item-count">{emails.length}</span>
                </div>

                <div
                  className={`folder-item ${
                    currentFolder === "Drafts" ? "selected" : ""
                  }`}
                  onClick={() => handleFolderClick("Drafts")}
                >
                  Drafts <span className="item-count">0</span>
                </div>
                <div
                  className={`folder-item ${
                    currentFolder === "Spam" ? "selected" : ""
                  }`}
                  onClick={() => handleFolderClick("Spam")}
                >
                  Spam <span className="item-count">0</span>
                </div>
                <div
                  className={`folder-item ${
                    currentFolder === "Important" ? "selected" : ""
                  }`}
                  onClick={() => handleFolderClick("Important")}
                >
                  Important <span className="item-count">0</span>
                </div>
                <div
                  className={`folder-item ${
                    currentFolder === "Bin" ? "selected" : ""
                  }`}
                  onClick={() => handleFolderClick("Bin")}
                >
                  Bin <span className="item-count">{deletedEmails.length}</span>
                </div>
              </div>
            </div>
            {toggleCompose ? (
              <div className="email-content">
                <div className="email-search">
                  <div className="search-bar-container">
                    <img
                      src={searchIcon}
                      alt="Search"
                      className="search-icon"
                    />
                    <input
                      type="text"
                      className="search-bar"
                      placeholder="Search mail"
                    />
                  </div>
                  <div className="search-icons">
                    <img src={labelIcon} alt="Label" className="icon" />
                    <img src={infoIcon} alt="Info" className="icon" />
                    <img
                      src={deleteIcon}
                      alt="Delete"
                      className="icon"
                      onClick={openDeleteModal}
                    />
                  </div>
                </div>
                <div className="email-list">
                  {filteredEmails()?.map((email) => (
                    <div key={email._id} className="py-2">
                      {/* <input
                        type="checkbox"
                        onChange={() => handleCheckboxChange(email._id)}
                        checked={selectedEmails.includes(email._id)}
                      /> */}
                      <span
                        className="email-star"
                        onClick={() => handleLike(email._id)}
                      >
                        {email.liked ? "★" : "☆"}
                      </span>
                      <span className="email-sender">{email.to}</span>
                      {/* <span
                        className={`email-label ${email.label.toLowerCase()}`}
                      >
                        {email.label}
                      </span> */}
                      <span className="email-subject">{email.subject}</span>
                      {/* <span className="email-time">{email.time}</span> */}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="email-content">
                <ComposeEmail handleOnClick={handleOnClick} />
              </div>
            )}
          </div>
        </main>
      </div>
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <p>{modalMessage}</p>
            <button onClick={() => setShowModal(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inbox;
