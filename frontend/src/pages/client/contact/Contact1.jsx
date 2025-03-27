import { Link } from "react-router-dom";
import "./Contact1.modules.css";
import profilePic from "../../../assets/images/profilepic2.jpg"; // Placeholder image

const contacts = [
  {
    name: "Jason Price",
    email: "janick_parisian@yahoo.com",
    img: profilePic,
  },
  {
    name: "Jukkoe Sisao",
    email: "sibyl_kozey@gmail.com",
    img: profilePic,
  },
  {
    name: "Harriet King",
    email: "nadia_block@hotmail.com",
    img: profilePic,
  },
  {
    name: "Lenora Benson",
    email: "feil.wallace@kunde.us",
    img: profilePic,
  },
];

const Contact = () => {
  return (
    <div className="contact-page">
      <div className="contact-content">
        <main className="main-content">
          <div className="header-section">
            <h2>Contact</h2>
            <Link to="/contact1" className="add-contact-button">
              Add New Contact
            </Link>
          </div>
          <div className="contact-cards">
            {contacts.map((contact, index) => (
              <div className="contact-card" key={index}>
                <img
                  src={contact.img}
                  alt={contact.name}
                  className="contact-card-img"
                />
                <h4>{contact.name}</h4>
                <p>{contact.email}</p>
                <button className="message-button">
                  <i className="fa fa-envelope"></i> Message
                </button>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Contact;
