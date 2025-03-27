import React, { useEffect, useState } from "react";
import { useUserContext } from "../../../context/userContext";
import InfoBox from "../../../components/InfoBox";
import axios from '../../../api/axios';
import { toast } from "react-hot-toast"; // Import toast
import userIcon2 from "../../../assets/images/user2.png";
import orderIcon from "../../../assets/images/order.png";
import salesIcon from "../../../assets/images/sales.png";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';
import "./Dashboard.modules.css";

const Dashboard = () => {
  const { currentUser } = useUserContext();

  const [pageDetails, setPageDetails] = useState({
    totalUsers: 0,
    totalTeachers: 0,
    totalStudents: 0,
    totalSales: 0,
  });

  const [upcomingEvents, setUpcomingEvents] = useState([
    { day: "Saturday", description: "Lorem ipsum dolor sit amet", date: "Sep 9" },
    { day: "Sunday", description: "Consectetur adipiscing elit", date: "Sep 10" },
    { day: "Monday", description: "Sed do eiusmod tempor", date: "Sep 11" },
    { day: "Tuesday", description: "Ut enim ad minim veniam", date: "Sep 12" },
  ]);

  const [recentApplications, setRecentApplications] = useState([]);
  const [timeGreeting, setTimeGreeting] = useState("");
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    fetchDisplayInfo();
    // fetchUpcomingEvents(); // Fetch upcoming events
    setGreetingMessage();
  }, []);

  // Fetch dashboard info
  const fetchDisplayInfo = async () => {
    try {
      const response = await axios.get("/api/admin/get-dashboard-info");
      setPageDetails(response.data.data);
    } catch (error) {
      console.error("Error fetching dashboard info:", error);
      toast.error("Failed to load dashboard data"); // Show toast on error
    }
  };

  


  // Fetch upcoming events
  // const fetchUpcomingEvents = async () => {
  //   try {
  //     const response = await axios.get("/api/events/upcoming-events");
  //     setUpcomingEvents(response.data.data);
  //   } catch (error) {
  //     console.error("Error fetching upcoming events", error);
  //     toast.error("Failed to load upcoming events"); // Show toast on error
  //   }
  // };

  const setGreetingMessage = () => {
    const currentHour = new Date().getHours();
    if (currentHour < 12) {
      setTimeGreeting("Good Morning");
    } else if (currentHour < 18) {
      setTimeGreeting("Good Afternoon");
    } else {
      setTimeGreeting("Good Evening");
    }
  };

  return (
    <div className="dashboard pb-10">
      <div className="dashboard-content">
        <main className="main-content">
          {/* Dynamic Greeting */}
          <h2 className="greeting">
            {timeGreeting}, {currentUser?.username} 🌞
          </h2>

          {/* Info Boxes */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <InfoBox
              title="Total Users"
              value={pageDetails.totalUsers}
              percentage="8.5% Up from yesterday"
              icon={userIcon2}
            />
            <InfoBox
              title="Total Teachers"
              value={pageDetails.totalTeachers}
              percentage="1.3% Up from past week"
              icon={orderIcon}
            />
            <InfoBox
              title="Total Students"
              value={pageDetails.totalStudents}
              percentage="4.3% Down from yesterday"
              icon={salesIcon}
            />
          </div>

          
          {/* Calendar and Upcoming Events */}
          <section className="calendar-and-events mt-10">
            <div className="calendar-section">
              <h3>Calendar</h3>
              <Calendar onChange={setDate} value={date} />
            </div>

           {/* Styled Upcoming Events */}
           <div className="events-section">
              <h3>Upcoming Events</h3>
              <ul className="events-list">
                {upcomingEvents.map((event, index) => (
                  <li
                    key={index}
                    className={`event-item ${index % 2 === 0 ? 'cream-box' : 'green-box'}`}
                  >
                    <div className="event-day">{event.day}</div>
                    <div className="event-description">{event.description}</div>
                    <div className="event-date">{event.date}</div>
                  </li>
                ))}
              </ul>
            </div>
            
          </section>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
