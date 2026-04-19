import { createContext, useContext, useState, useCallback } from "react";

const NotifContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const notify = useCallback((message, type = "success") => {
    const id = Date.now() + Math.random();
    setNotifications((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 4500);
  }, []);

  return (
    <NotifContext.Provider value={{ notify }}>
      {children}
      <div className="toast-stack">
        {notifications.map((n) => (
          <div key={n.id} className={`toast-item ${n.type}`}>
            <span className="toast-dot" />
            {n.message}
          </div>
        ))}
      </div>
    </NotifContext.Provider>
  );
}

export function useNotify() {
  return useContext(NotifContext);
}
