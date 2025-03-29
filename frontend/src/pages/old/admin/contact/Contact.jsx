import { useEffect, useState } from "react";
import "./Contact1.modules.css";
import axios from "axios";
import ComposeEmail from "../inbox/ComposeEmail";

const Contact1 = () => {
  const [contacts, setContacts] = useState([]);
  const [toggleComposeEmail, setToggleComposeEmail] = useState(false);
  const [email, setEmail] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const contactsPerPage = 6;

  const fetchContactInfo = async () => {
    await axios
      .get("/api/admin/get-all-users", { withCredentials: true })
      .then((res) => {
        setContacts(res.data.data);
      });
  };

  useEffect(() => {
    fetchContactInfo();
  }, []);

  // Pagination logic
  const totalPages = Math.ceil(contacts.length / contactsPerPage);
  const indexOfLastContact = currentPage * contactsPerPage;
  const indexOfFirstContact = indexOfLastContact - contactsPerPage;
  const currentContacts = contacts.slice(indexOfFirstContact, indexOfLastContact);

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="contact-page2">
      <div className="contact-content2">
        <main className="main-content">
          <div className="header-section">
            <h2>Contact</h2>
          </div>
          {toggleComposeEmail && (
            <ComposeEmail
              email={email}
              handleOnClick={() => setToggleComposeEmail(!toggleComposeEmail)}
            />
          )}
          {!toggleComposeEmail && (
            <>
              <div className="gap-4 grid sm:grid-cols-2 lg:grid-cols-3 ">
                {currentContacts?.map((contact, index) => (
                  <div className="contact-card" key={index}>
                    <div className="flex items-center justify-center ">
                      <img
                        src={contact.profilePicture}
                        alt={contact.username}
                        className="w-[80px] h-[80px] rounded-full "
                      />
                    </div>
                    <h4 className="truncate">{contact.username}</h4>
                    <p className="truncate">{contact.email}</p>
                    <button
                      className="message-button"
                      onClick={() => {
                        setToggleComposeEmail(!toggleComposeEmail);
                        setEmail(contact.email);
                      }}
                    >
                      <i className="fa fa-envelope"></i> Message
                    </button>
                  </div>
                ))}
              </div>
              <div className="pagination">
                <button onClick={prevPage} disabled={currentPage === 1}>
                  Previous
                </button>
                <span>
                  Showing {indexOfFirstContact + 1}-{Math.min(indexOfLastContact, contacts.length)} of {contacts.length}
                </span>
                <button onClick={nextPage} disabled={currentPage === totalPages}>
                  Next
                </button>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Contact1;
