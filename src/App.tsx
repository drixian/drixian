import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './config/firebase';
import AuthPage from './components/auth/AuthPage';
import ServerRail from './components/navigation/ServerRail';
import SubSidebar from './components/navigation/SubSidebar';
import ChatArea from './components/chat/ChatArea';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-screen bg-bgTertiary flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brandGreen"></div>
      </div>
    );
  }

  if (!user) return <AuthPage />;

  return (
    <div className="flex h-screen w-screen select-none overflow-hidden">
      <ServerRail />
      <SubSidebar />
      <ChatArea />
    </div>
  );
}
