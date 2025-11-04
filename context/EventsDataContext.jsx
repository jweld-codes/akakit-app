// contexts/EventsDataContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUpcomingEvents } from '../services/GetUpcomingEvents';

const EventsDataContext = createContext();

export const useEventsData = () => {
  const context = useContext(EventsDataContext);
  if (!context) {
    throw new Error('useEventsData debe usarse dentro de EventsDataProvider');
  }
  return context;
};

export const EventsDataProvider = ({ children }) => {
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    setLoading(true);
    const events = await getUpcomingEvents(10);
    setUpcomingEvents(events);
    setLoading(false);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const value = {
    upcomingEvents,
    loading,
    refreshEvents: fetchEvents,
  };

  return (
    <EventsDataContext.Provider value={value}>
      {children}
    </EventsDataContext.Provider>
  );
};