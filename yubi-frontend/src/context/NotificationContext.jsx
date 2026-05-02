import { createContext, useContext, useMemo, useState } from "react";
const NotificationContext = createContext(null);
export function NotificationProvider({ children }) { const [notifications,setNotifications]=useState([]); const unread=notifications.filter(n=>!n.read).length; const markAllRead=()=>setNotifications(n=>n.map(x=>({...x,read:true}))); const value=useMemo(()=>({notifications,unread,markAllRead,push:(n)=>setNotifications(p=>[{id:Date.now(),...n},...p])}),[notifications,unread]); return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider> }
export const useNotifications=()=>useContext(NotificationContext);
