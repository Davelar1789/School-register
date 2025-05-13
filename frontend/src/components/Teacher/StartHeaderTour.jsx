// StartHeaderTour.jsx
import { useEffect, useContext } from 'react';
import jwtDecode from 'jwt-decode';
import api from '../../api/axios';
import { ShepherdTourContext } from 'react-shepherd';

const StartHeaderTour = () => {
  const tourContext = useContext(ShepherdTourContext);

  const getTeacherData = () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;
      const decodedToken = jwtDecode(token);
      return {
        id: decodedToken?.id || null,
        seenTutorial: decodedToken?.seenTutorial || false,
      };
    } catch (error) {
      console.error('❌ Error decoding token:', error);
      return null;
    }
  };

  useEffect(() => {
    const teacherData = getTeacherData();

    if (!teacherData || teacherData.seenTutorial) return;

    const notificationEl = document.querySelector('.notification-wrapper');

    if (notificationEl && tourContext) {
      tourContext.start();

      tourContext.on('complete', async () => {
        try {
          await api.put(`/mark-tutorial-seen/${teacherData.id}`);

          const updatedToken = jwtDecode(localStorage.getItem('token'));
          updatedToken.seenTutorial = true;
          localStorage.setItem('token', JSON.stringify(updatedToken));
        } catch (err) {
          console.error('Error marking tutorial as seen:', err);
        }
      });
    }
  }, [tourContext]);

  return null;
};

export default StartHeaderTour;
