import React, { useEffect } from 'react';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import './ContactUs.modules.css';
import contactbag from '../../../assets/images/contactbag.jpg';
import locationIcon from '../../../assets/images/location.png';

const ContactUs = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="contact-page" style={{ backgroundImage: `url(${contactbag})` }}>
            <Header />
            <main className="main-content2">
                <div className="contact-container">
                    <h2 className='contact-h2'>Get in touch</h2>
                    <p>Our friendly team would love to hear from you.</p>
                    <div className="contact-content">
                        <div className="contact-info">
                            <div className="location">
                                <img src={locationIcon} alt="location icon" className="location-icon" />
                                <div>
                                    <h3>GHANA</h3>
                                    <p>Greater Accra, Accra</p>
                                    <p>📞 +233 (0) 545256254</p>
                                </div>
                            </div>
                            <div className="location">
                                <img src={locationIcon} alt="location icon" className="location-icon" />
                                <div>
                                    <h3>USA</h3>
                                    <p>651 N Broad ST, Suite 206, New York</p>
                                    <p>📞 +43 664 93214399</p>
                                </div>
                            </div>
                        </div>
                        <div className="contact-form">
                            <h3>Send us your message</h3>
                            <form>
                                <input type="text" placeholder="Enter your name" />
                                <input type="email" placeholder="Enter your e-mail" />
                                <input type="text" placeholder="Subject" />
                                <textarea placeholder="Message"></textarea>
                                <button type="submit">Send</button>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default ContactUs;
