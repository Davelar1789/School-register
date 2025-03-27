import InfoBox from "../../../components/InfoBox";
import "./Dashboard.modules.css";
import axios from "axios";
import { useUserContext } from "../../../context/userContext";
import userIcon2 from "../../../assets/images/user2.png";
import orderIcon from "../../../assets/images/order.png";
import salesIcon from "../../../assets/images/sales.png";
import pendingIcon from "../../../assets/images/pending.png";
import Calendar from "react-calendar"; // Assume you import a calendar component
import 'react-calendar/dist/Calendar.css';
import { useEffect, useState } from "react";

const Dashboard = () => {
  const { currentUser } = useUserContext(); // Access currentUser from the user context

  const [pageDetails, setPageDetails] = useState({
    totalUsers: 0,
    totalTeachers: 0,
    totalStudents: 0,
  });

  const [recentApplications, setRecentApplications] = useState([
    { id: 1, name: "Application #123 - John Doe" },
    { id: 2, name: "Application #124 - Jane Smith" },
    { id: 3, name: "Application #125 - Michael Brown" },
  ]);

  const [timeGreeting, setTimeGreeting] = useState("");
  const [date, setDate] = useState(new Date());

  const [upcomingEvents, setUpcomingEvents] = useState([
    { day: "Saturday", description: "Lorem ipsum dolor sit amet", date: "Sep 9" },
    { day: "Sunday", description: "Consectetur adipiscing elit", date: "Sep 10" },
    { day: "Monday", description: "Sed do eiusmod tempor", date: "Sep 11" },
    { day: "Tuesday", description: "Ut enim ad minim veniam", date: "Sep 12" },
  ]);

  useEffect(() => {
    fetchDisplayInfo();
    setGreetingMessage();
  }, []);

  const fetchDisplayInfo = async () => {
    await axios
      .get("/api/teacher/get-dashboard-info")
      .then((res) => {
        setPageDetails(res.data.data);
      })
      .catch((err) => console.log(err));
  };

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
