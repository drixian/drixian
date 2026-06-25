import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, where, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { renderAuthPage, renderMainInterface } from './ui.js';

const firebaseConfig = {
  apiKey: "AIzaSyB2vGR4CJe5spSYk4oV8h7RUvDpmGg36fs",
  authDomain: "drixian.firebaseapp.com",
  projectId: "drixian",
  storageBucket: "drixian.firebasestorage.app",
  messagingSenderId: "979605593162",
  appId: "1:979605593162:web:e6483a9e21ed7e2cdb9ab3",
  measurementId: "G-LZMPEPPKC6"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let state = {
  user: null,
  username: "",
  activeCommunityId: null,
  activeChannelId: null,
  communities: [],
  channels: [],
  messages: [],
  currentServer: null
};

function triggerDOMUpdate(errorMessage = "", isRegistering = false) {
  const root = document.getElementById('drixian-root');
  if (!state.user) {
    root.innerHTML = renderAuthPage(errorMessage, isRegistering);
    bindAuthenticationEvents();
  } else {
    root.innerHTML = renderMainInterface(state);
    bindInterfaceEvents();
  }
}

function bindAuthenticationEvents() {
  document.getElementById('toggle-auth-mode')?.addEventListener('click', () => {
    const currentMode = document.getElementById('auth-mode').value;
    triggerDOMUpdate("", currentMode === 'login');
  });

  document.getElementById('auth-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const mode = document.getElementById('auth-mode').value;
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;

    try {
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const usernameInput = document.getElementById('auth-username').value.trim();
        if (!usernameInput) return;
        
        const credentials = await createUserWithEmailAndPassword(auth, email, password);
        
        await setDoc(doc(db, "users", credentials.user.uid), {
          username: usernameInput,
          createdAt: Date.now()
        });
      }
    } catch (err) {
      triggerDOMUpdate(err.message, mode === 'register');
    }
  });
}

function bindInterfaceEvents() {
  document.getElementById('logout-btn')?.addEventListener('click', () => signOut(auth));
  
  document.getElementById('home-navigation-btn')?.addEventListener('click', () => {
    state.activeCommunityId = null;
    state.activeChannelId = null;
    state.currentServer = null;
    state.messages = [];
    triggerDOMUpdate();
  });

  document.getElementById('create-community-btn')?.addEventListener('click', async () => {
    const name = prompt("Enter Server Name:");
    if (!name || !name.trim()) return;
    
    await addDoc(collection(db, "communities"), {
      name: name.trim(),
      ownerId: state.user.uid,
      ownerName: state.username || state.user.email.split('@')[0],
      metsContributed: (state.username || "").toLowerCase() === 'bluz' ? 500 : 0,
      createdAt: Date.now()
    });
  });

  document.getElementById('create-channel-btn')?.addEventListener('click', async () => {
    const name = prompt("Enter Channel Name:");
    if (!name || !name.trim()) return;
    
    await addDoc(collection(db, "channels"), {
      name: name.trim().toLowerCase().replace(/\s+/g, '-'),
      communityId: state.activeCommunityId,
      createdAt: Date.now()
    });
  });

  document.getElementById('chat-message-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const inputField = document.getElementById('chat-message-input');
    if (!inputField || !inputField.value.trim() || !state.activeChannelId) return;

    await addDoc(collection(db, "channels", state.activeChannelId, "messages"), {
      username: state.username || state.user.email.split('@')[0],
      content: inputField.value.trim(),
      timestamp: Date.now()
    });
    inputField.value = '';
  });
}

let unsubChannels = null;
window.drixianSelectCommunity = function(id) {
  state.activeCommunityId = id;
  state.activeChannelId = null;
  state.messages = [];
  state.currentServer = state.communities.find(c => c.id === id) || null;

  if (unsubChannels) unsubChannels();
  const q = query(collection(db, "channels"), where("communityId", "==", id));
  unsubChannels = onSnapshot(q, (snap) => {
    state.channels = [];
    snap.forEach(d => state.channels.push({ id: d.id, ...d.data() }));
    if (state.channels.length > 0 && !state.activeChannelId) {
      window.drixianSelectChannel(state.channels[0].id);
    } else {
      triggerDOMUpdate();
    }
  });
};

let unsubMessages = null;
window.drixianSelectChannel = function(id) {
  state.activeChannelId = id;
  if (unsubMessages) unsubMessages();
  
  const q = query(collection(db, "channels", id, "messages"), orderBy("timestamp", "asc"));
  unsubMessages = onSnapshot(q, (snap) => {
    state.messages = [];
    snap.forEach(d => state.messages.push({ id: d.id, ...d.data() }));
    
    const container = document.getElementById('chat-conversation-container');
    if (container) container.scrollTop = container.scrollHeight;
    
    triggerDOMUpdate();
  });
};

onAuthStateChanged(auth, async (user) => {
  state.user = user;
  if (user) {
    const profileSnap = await getDoc(doc(db, "users", user.uid));
    state.username = profileSnap.exists() ? profileSnap.data().username : user.email.split('@')[0];

    const q = query(collection(db, "communities"), orderBy("createdAt", "desc"));
    onSnapshot(q, (snap) => {
      state.communities = [];
      snap.forEach(d => state.communities.push({ id: d.id, ...d.data() }));
      triggerDOMUpdate();
    });
  } else {
    state.username = "";
    state.activeCommunityId = null;
    state.activeChannelId = null;
    triggerDOMUpdate();
  }
});
