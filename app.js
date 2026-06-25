import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, where, doc, setDoc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { renderAuthPage, renderMainInterface, renderProfileSettingsHTML, renderServerSettingsHTML } from './ui.js';

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
  userProfile: {},
  activeCommunityId: null,
  activeChannelId: null,
  communities: [],
  channels: [],
  messages: [],
  serverUsers: [],
  currentServer: null,
  isAuthLoading: true
};

function triggerDOMUpdate(errorMessage = "", isRegistering = false) {
  const root = document.getElementById('drixian-root');
  if (!root) return;

  if (state.isAuthLoading) {
    root.innerHTML = `
      <div class="h-screen w-screen flex flex-col items-center justify-center bg-[#36393f]">
        <img src="branding/drixianlogo.png" alt="Loading" class="w-16 h-16 object-contain animate-pulse opacity-50 mb-4">
        <span class="text-xs font-mono text-white text-opacity-30 tracking-widest uppercase">Connecting to Stream...</span>
      </div>
    `;
    return;
  }

  if (!state.user) {
    root.innerHTML = renderAuthPage(errorMessage, isRegistering);
  } else {
    root.innerHTML = renderMainInterface(state);
  }
}

// ==========================================
// GLOBAL DELEGATED EVENT LISTENERS (CRITICAL FIX)
// ==========================================
document.addEventListener('click', async (e) => {
  // Toggle Auth Mode
  if (e.target && e.target.id === 'toggle-auth-mode') {
    const currentMode = document.getElementById('auth-mode')?.value;
    triggerDOMUpdate("", currentMode === 'login');
  }

  // Sign Out
  if (e.target && e.target.id === 'logout-btn') {
    signOut(auth);
  }

  // Return Home
  if (e.target && (e.target.id === 'home-navigation-btn' || e.target.closest('#home-navigation-btn'))) {
    state.activeCommunityId = null;
    state.activeChannelId = null;
    state.currentServer = null;
    state.messages = [];
    triggerDOMUpdate();
  }

  // Create Community
  if (e.target && e.target.id === 'create-community-btn') {
    const name = prompt("Enter Server Name:");
    if (!name || !name.trim()) return;
    await addDoc(collection(db, "communities"), {
      name: name.trim(),
      ownerId: state.user.uid,
      ownerName: state.username || state.user.email.split('@')[0],
      metsContributed: (state.username || "").toLowerCase() === 'bluz' ? 500 : 0,
      createdAt: Date.now()
    });
  }

  // Create Channel
  if (e.target && e.target.id === 'create-channel-btn') {
    const name = prompt("Enter Channel Name:");
    if (!name || !name.trim()) return;
    await addDoc(collection(db, "channels"), {
      name: name.trim().toLowerCase().replace(/\s+/g, '-'),
      communityId: state.activeCommunityId,
      createdAt: Date.now()
    });
  }

  // Open Profile Customization Modal
  if (e.target && (e.target.id === 'open-profile-settings-btn' || e.target.closest('#open-profile-settings-btn'))) {
    const container = document.getElementById('drixian-modal-container');
    const wrapper = document.getElementById('modal-content-wrapper');
    if (container && wrapper) {
      wrapper.innerHTML = renderProfileSettingsHTML(state.userProfile);
      container.classList.remove('hidden');
    }
  }

  // Open Server Configuration Modal
  if (e.target && (e.target.id === 'server-settings-btn' || e.target.closest('#server-settings-btn'))) {
    if (!state.currentServer) return;
    const container = document.getElementById('drixian-modal-container');
    const wrapper = document.getElementById('modal-content-wrapper');
    if (container && wrapper) {
      wrapper.innerHTML = renderServerSettingsHTML(state.currentServer);
      container.classList.remove('hidden');
    }
  }

  // Apply Role Assignment inside Server Settings Modal
  if (e.target && e.target.id === 'apply-role-assignment-btn') {
    const targetUser = document.getElementById('role-target-user')?.value.trim();
    const assignedClass = document.getElementById('role-target-class')?.value;
    if (!targetUser) return alert("Specify a valid username target");

    await setDoc(doc(db, "communities", state.activeCommunityId, "roles", targetUser.toLowerCase()), {
      username: targetUser,
      role: assignedClass,
      timestamp: Date.now()
    });
    alert(`Classification mapped: ${targetUser} is now recognized as ${assignedClass}`);
  }
});

// Forms Submit Interceptor
document.addEventListener('submit', async (e) => {
  e.preventDefault();

  // Auth Form Submit
  if (e.target && e.target.id === 'auth-form') {
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
          avatarColor: '#43b581',
          customStatus: 'Entering the stream...',
          createdAt: Date.now()
        });
      }
    } catch (err) {
      triggerDOMUpdate(err.message, mode === 'register');
    }
  }

  // Message Send Form Submit
  if (e.target && e.target.id === 'chat-message-form') {
    const inputField = document.getElementById('chat-message-input');
    if (!inputField || !inputField.value.trim() || !state.activeChannelId) return;

    const explicitRole = state.serverUsers?.find(su => su.username?.toLowerCase() === state.username.toLowerCase())?.role || 'member';

    await addDoc(collection(db, "channels", state.activeChannelId, "messages"), {
      username: state.username,
      userRole: explicitRole,
      avatarColor: state.userProfile?.avatarColor || '#202225',
      content: inputField.value.trim(),
      timestamp: Date.now()
    });
    inputField.value = '';
  }

  // Profile Form Submit
  if (e.target && e.target.id === 'profile-settings-form') {
    const updatedName = document.getElementById('edit-profile-username').value.trim();
    const updatedStatus = document.getElementById('edit-profile-status').value.trim();
    const updatedColor = document.getElementById('edit-profile-color').value;

    await updateDoc(doc(db, "users", state.user.uid), {
      username: updatedName,
      customStatus: updatedStatus,
      avatarColor: updatedColor
    });
    document.getElementById('drixian-modal-container').classList.add('hidden');
  }

  // Server Form Submit
  if (e.target && e.target.id === 'server-settings-form') {
    const updatedServerName = document.getElementById('edit-server-name').value.trim();
    const updatedMets = parseInt(document.getElementById('edit-server-mets').value) || 0;

    await updateDoc(doc(db, "communities", state.activeCommunityId), {
      name: updatedServerName,
      metsContributed: updatedMets
    });
    document.getElementById('drixian-modal-container').classList.add('hidden');
  }
});

// ==========================================
// SEAMLESS LIFECYCLE CHANNELS DATA HUB
// ==========================================
let unsubChannels = null;
let unsubServerUsers = null;
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

  if (unsubServerUsers) unsubServerUsers();
  const rq = query(collection(db, "communities", id, "roles"), orderBy("timestamp", "desc"));
  unsubServerUsers = onSnapshot(rq, (snap) => {
    state.serverUsers = [];
    snap.forEach(d => state.serverUsers.push({ id: d.id, ...d.data() }));
    triggerDOMUpdate();
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
    triggerDOMUpdate();
    
    const container = document.getElementById('chat-conversation-container');
    if (container) container.scrollTop = container.scrollHeight;
  });
};

triggerDOMUpdate();

// ==========================================
// PIPELINE AUTH STREAM REALIGNMENT (FIXED FALLBACK)
// ==========================================
onAuthStateChanged(auth, async (user) => {
  if (user) {
    state.user = user;
    
    // 1. Instantly pull document data to intercept any "Business" email fallbacks
    const profileSnap = await getDoc(doc(db, "users", user.uid));
    if (profileSnap.exists()) {
      state.userProfile = profileSnap.data();
      state.username = profileSnap.data().username || user.email.split('@')[0];
    } else {
      state.username = user.email.split('@')[0];
      state.userProfile = { username: state.username, avatarColor: '#43b581', customStatus: 'Mets Account Verified' };
    }

    // 2. Clear out loading flags immediately
    state.isAuthLoading = false;
    triggerDOMUpdate();

    // 3. Keep background listeners listening cleanly
    onSnapshot(doc(db, "users", user.uid), (snap) => {
      if (snap.exists()) {
        state.userProfile = snap.data();
        state.username = snap.data().username;
        triggerDOMUpdate();
      }
    });

    const q = query(collection(db, "communities"), orderBy("createdAt", "desc"));
    onSnapshot(q, (snap) => {
      state.communities = [];
      snap.forEach(d => {
        if (d.id === state.activeCommunityId) state.currentServer = { id: d.id, ...d.data() };
        state.communities.push({ id: d.id, ...d.data() });
      });
      triggerDOMUpdate();
    });

  } else {
    state.user = null;
    state.username = "";
    state.userProfile = {};
    state.activeCommunityId = null;
    state.activeChannelId = null;
    state.isAuthLoading = false;
    triggerDOMUpdate();
  }
});
