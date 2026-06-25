import { evaluateServerPremium } from './premium.js';

export function renderAuthPage(errorMessage = "", isRegistering = false) {
  return `
    <div class="h-screen w-screen flex items-center justify-center bg-cover bg-center" style="background-image: url('branding/drixianbackround.png')">
      <div class="bg-bgSecondary p-8 rounded-lg shadow-2xl w-full max-w-md border border-bgTertiary/50 backdrop-blur-sm bg-opacity-95">
        <div class="flex flex-col items-center mb-6">
          <img src="branding/drixianlogo.png" alt="Drixian" class="w-16 h-16 object-contain mb-2 drop-shadow-md">
          <h2 class="text-2xl font-bold text-white tracking-wide">${isRegistering ? 'Create an Account' : 'Welcome Back!'}</h2>
          <p class="text-gray-400 text-xs mt-1">${isRegistering ? 'Sign up to start building communities.' : 'We\'re so excited to see you again!'}</p>
        </div>
        ${errorMessage ? `<div class="bg-drixDanger/20 text-drixDanger p-3 text-xs rounded mb-4 border border-drixDanger/30">${errorMessage}</div>` : ''}
        <form id="auth-form" class="space-y-4">
          <input type="hidden" id="auth-mode" value="${isRegistering ? 'register' : 'login'}">
          ${isRegistering ? `
          <div class="animate-fadeIn">
            <label class="text-xs font-bold text-gray-300 uppercase tracking-wider block mb-2">Username</label>
            <input type="text" id="auth-username" required placeholder="e.g., Bluz" class="w-full bg-bgTertiary text-white p-2.5 rounded focus:border-drixGreen outline-none border border-transparent transition placeholder-gray-600">
          </div>` : ''}
          <div>
            <label class="text-xs font-bold text-gray-300 uppercase tracking-wider block mb-2">Email Address</label>
            <input type="email" id="auth-email" required placeholder="name@domain.com" class="w-full bg-bgTertiary text-white p-2.5 rounded focus:border-drixGreen outline-none border border-transparent transition placeholder-gray-600">
          </div>
          <div>
            <label class="text-xs font-bold text-gray-300 uppercase tracking-wider block mb-2">Password</label>
            <input type="password" id="auth-password" required placeholder="••••••••" class="w-full bg-bgTertiary text-white p-2.5 rounded focus:border-drixGreen outline-none border border-transparent transition placeholder-gray-600">
          </div>
          <button type="submit" class="w-full bg-drixGreen hover:bg-emerald-600 text-white font-medium py-2.5 rounded transition shadow-md active:scale-[0.99] mt-2">
            ${isRegistering ? 'Sign In / Register' : 'Log In'}
          </button>
        </form>
        <div class="text-xs mt-4 text-left">
          <span class="text-gray-400">${isRegistering ? 'Already have an account?' : 'Need an account?'}</span>
          <button id="toggle-auth-mode" class="text-drixGreen hover:underline ml-1 font-medium">${isRegistering ? 'Log In' : 'Register'}</button>
        </div>
      </div>
    </div>
  `;
}

export function renderMainInterface(state) {
  const displayName = state.username || state.user.email.split('@')[0];
  const premium = evaluateServerPremium(state.currentServer?.metsContributed || 0, state.currentServer?.ownerName || "");
  const userAvatarColor = state.userProfile?.avatarColor || '#43b581';

  return `
    <div class="w-[72px] bg-bgTertiary h-full flex flex-col items-center py-3 space-y-2 flex-shrink-0">
      <button id="home-navigation-btn" class="relative group w-12 h-12 flex items-center justify-center bg-bgPrimary rounded-3xl hover:rounded-2xl hover:bg-drixGreen transition-all duration-200">
        <img src="branding/drixianlogo.png" alt="Home" class="w-7 h-7 object-contain">
      </button>
      <div class="w-8 h-[2px] bg-bgSecondary rounded my-1"></div>
      <div class="w-full flex flex-col items-center space-y-2 overflow-y-auto flex-1">
        ${state.communities.map(c => {
          const isActive = state.activeCommunityId === c.id;
          const isBluzServer = c.ownerName?.toLowerCase() === 'bluz';
          return `
            <button onclick="window.drixianSelectCommunity('${c.id}')" class="relative w-12 h-12 flex items-center justify-center font-bold text-white transition-all duration-200 ${isActive ? 'bg-drixGreen rounded-2xl' : 'bg-bgPrimary rounded-3xl hover:rounded-2xl hover:bg-drixGreen'} ${isBluzServer ? 'border-2 border-amber-400' : ''}">
              <span class="text-sm">${c.name.substring(0, 2).toUpperCase()}</span>
              ${isBluzServer ? '<span class="absolute -top-1 -right-1 text-[10px] bg-amber-500 rounded-full px-1 text-black font-bold">⭐</span>' : ''}
            </button>
          `;
        }).join('')}
        <button id="create-community-btn" class="w-12 h-12 bg-bgPrimary text-drixGreen rounded-3xl hover:rounded-2xl hover:bg-drixGreen hover:text-white transition-all text-xl font-light flex items-center justify-center">+</button>
      </div>
    </div>

    <div class="w-60 bg-bgSecondary h-full flex flex-col flex-shrink-0 overflow-hidden">
      <div class="h-12 border-b border-black/20 flex items-center justify-between px-4 shadow-sm text-white flex-shrink-0">
        <div class="overflow-hidden pr-2">
          <div class="font-bold truncate text-sm tracking-wide">${state.currentServer ? state.currentServer.name : "Direct Messages"}</div>
          ${premium.tier > 0 ? `<div class="text-[9px] text-amber-400 font-bold uppercase tracking-widest animate-pulse">${premium.label} Unlocked</div>` : ''}
        </div>
        ${state.currentServer ? `
          <button id="server-settings-btn" class="text-gray-400 hover:text-white transition text-lg p-1">⚙️</button>
        ` : ''}
      </div>
      
      <div class="flex-1 overflow-y-auto p-2 space-y-[2px]">
        ${state.activeCommunityId ? `
          <div class="text-[11px] font-bold text-gray-400 uppercase px-2 py-1 tracking-wider">Text Channels</div>
          ${state.channels.map(ch => `
            <button onclick="window.drixianSelectChannel('${ch.id}')" class="w-full flex items-center px-2 py-1.5 rounded text-sm font-medium transition ${state.activeChannelId === ch.id ? 'bg-[#393c43] text-white' : 'text-gray-400 hover:bg-[#34373c] hover:text-gray-200'}">
              <span class="text-gray-500 text-base mr-2">#</span><span class="truncate">${ch.name}</span>
            </button>
          `).join('')}
          <button id="create-channel-btn" class="w-full text-left text-xs text-drixGreen hover:underline p-2 font-medium">+ Add New Channel</button>
        ` : `
          <div class="text-[11px] font-bold text-gray-400 uppercase px-2 py-1 tracking-wider">Direct Communications</div>
          <div class="text-xs text-gray-500 p-2 italic">Select an active server terminal point to begin real-time streaming.</div>
        `}
      </div>
      
      <div class="bg-bgProfile flex flex-col border-t border-black/10 mt-auto flex-shrink-0">
        <div class="h-14 px-3 flex items-center justify-between">
          <div id="open-profile-settings-btn" class="flex items-center space-x-2 overflow-hidden cursor-pointer group">
            <div class="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 text-sm transition group-hover:opacity-80" style="background-color: ${userAvatarColor}">
              ${displayName.substring(0, 1).toUpperCase()}
            </div>
            <div class="flex flex-col overflow-hidden">
              <span class="text-sm font-bold text-white truncate leading-tight group-hover:text-drixGreen transition">${displayName}</span>
              <span class="text-[11px] text-gray-400 font-medium tracking-wide truncate">${state.userProfile?.customStatus || 'Mets Account Verified'}</span>
            </div>
          </div>
          <button id="logout-btn" class="text-gray-400 hover:text-white text-xs bg-bgTertiary px-2 py-1 rounded transition border border-black/20">Sign Out</button>
        </div>
        
        <div class="bg-bgTertiary/30 px-3 py-1 text-left border-t border-black/5 select-none pointer-events-none">
          <span class="text-[10px] font-mono tracking-wider text-white text-opacity-40 font-medium">DRIXIAN BUILD v1.1.0-MODALS</span>
        </div>
      </div>
    </div>

    <div class="flex-1 bg-bgPrimary flex h-full overflow-hidden min-w-0">
      <div class="flex-1 flex flex-col h-full overflow-hidden">
        <div class="h-12 border-b border-black/20 flex items-center px-4 justify-between font-bold text-white shadow-sm flex-shrink-0">
          <div class="flex items-center space-x-1.5 text-sm">
            <span class="text-gray-500 text-lg">#</span>
            <span class="tracking-wide">${state.channels.find(ch => ch.id === state.activeChannelId)?.name || 'live-feed'}</span>
          </div>
          ${premium.hasAnimatedBanner ? '<span class="text-[10px] bg-gradient-to-r from-purple-500 via-pink-500 to-amber-500 px-2 py-0.5 rounded text-white font-bold tracking-wider uppercase animate-pulse shadow-sm">✨ Premium Graphics Pipeline Engaged</span>' : ''}
        </div>
        
        <div class="flex-1 overflow-y-auto p-4 space-y-4" id="chat-conversation-container">
          ${state.messages.map(m => {
            const mUser = m.username || "User";
            const isMsgBluz = mUser.toLowerCase() === 'bluz';
            const roleBadge = m.userRole === 'admin' ? '🛡️ ADMIN' : m.userRole === 'shareholder' ? '💼 SHAREHOLDER' : '';
            const roleColor = m.userRole === 'admin' ? 'text-red-400' : m.userRole === 'shareholder' ? 'text-blue-400' : 'text-white';
            
            return `
              <div class="flex items-start space-x-3 group animate-fadeIn">
                <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 ${isMsgBluz ? 'border-2 border-amber-400 shadow-md' : ''}" style="background-color: ${m.avatarColor || '#202225'}">
                  ${mUser.substring(0,1).toUpperCase()}
                </div>
                <div class="min-w-0 flex-1">
                  <div class="flex items-baseline space-x-2">
                    <span class="text-sm font-bold cursor-pointer ${isMsgBluz || premium.hasGradientNames ? 'premium-gradient-text font-extrabold' : roleColor} hover:underline">
                      ${mUser}
                    </span>
                    ${roleBadge ? `<span class="text-[9px] px-1.5 py-0.5 rounded text-xs font-bold bg-bgTertiary text-opacity-90 border border-white/5">${roleBadge}</span>` : ''}
                    ${isMsgBluz ? '<span class="text-[9px] bg-amber-400 text-black px-1.5 rounded-sm font-black uppercase tracking-wider scale-90">CREATOR</span>' : ''}
                    <span class="text-[10px] text-gray-500">${new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p class="text-sm text-[#dcddde] mt-0.5 break-words selection:bg-drixGreen/30">${m.content}</p>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <form id="chat-message-form" class="px-4 pb-6 pt-1">
          <div class="bg-bgInput rounded-lg px-4 py-2.5 border border-transparent focus-within:border-drixGreen/40 transition">
            <input type="text" id="chat-message-input" placeholder="${state.activeChannelId ? 'Type a secure message...' : 'Select a community channel to unlock typing...'}" ${!state.activeChannelId ? 'disabled' : ''} class="bg-transparent text-sm text-[#dcddde] w-full focus:outline-none placeholder-gray-500" autocomplete="off">
          </div>
        </form>
      </div>

      <div class="w-56 bg-bgSecondary h-full border-l border-black/10 p-3 hidden lg:block flex-shrink-0 overflow-y-auto">
        <h4 class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Server Population</h4>
        <div class="space-y-3">
          <div class="flex items-center space-x-2.5 p-1 rounded hover:bg-bgPrimary/40 transition">
            <div class="w-8 h-8 rounded-full bg-bgTertiary flex items-center justify-center font-bold text-white border border-amber-400 shadow-sm text-xs">B</div>
            <div class="flex flex-col overflow-hidden">
              <span class="text-sm font-bold premium-gradient-text truncate">Bluz</span>
              <span class="text-[10px] text-amber-400 font-medium flex items-center gap-0.5">Founder 👑</span>
            </div>
          </div>
          
          ${state.serverUsers?.map(su => {
            const isSuBluz = su.username?.toLowerCase() === 'bluz';
            if (isSuBluz) return '';
            const roleLabel = su.role === 'admin' ? '🛡️ Admin' : su.role === 'shareholder' ? '💼 Shareholder' : '✉️ Member';
            const roleClass = su.role === 'admin' ? 'text-red-400' : su.role === 'shareholder' ? 'text-blue-400' : 'text-gray-400';
            return `
              <div class="flex items-center space-x-2.5 p-1 rounded hover:bg-bgPrimary/40 transition">
                <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs" style="background-color: ${su.avatarColor || '#202225'}">
                  ${su.username?.substring(0,1).toUpperCase()}
                </div>
                <div class="flex flex-col overflow-hidden">
                  <span class="text-sm font-medium text-gray-200 truncate">${su.username}</span>
                  <span class="text-[10px] ${roleClass} font-medium">${roleLabel}</span>
                </div>
              </div>
            `;
          }).join('') || ''}
        </div>
      </div>
    </div>

    <div id="drixian-modal-container" class="hidden fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div id="modal-content-wrapper" class="bg-bgSecondary w-full max-w-xl rounded-lg border border-bgTertiary text-white shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
      </div>
    </div>
  `;
}

export function renderProfileSettingsHTML(profile) {
  return `
    <div class="p-4 border-b border-black/20 flex justify-between items-center bg-bgTertiary">
      <h3 class="text-lg font-bold tracking-wide">Account Profile Customization</h3>
      <button type="button" onclick="document.getElementById('drixian-modal-container').classList.add('hidden')" class="text-gray-400 hover:text-white text-sm">✕</button>
    </div>
    <form id="profile-settings-form" class="p-6 space-y-4 overflow-y-auto flex-1">
      <div>
        <label class="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Display Name Handle</label>
        <input type="text" id="edit-profile-username" value="${profile.username || ''}" required class="w-full bg-bgTertiary text-white p-2.5 rounded border border-transparent focus:border-drixGreen outline-none">
      </div>
      <div>
        <label class="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Custom Status Pipeline</label>
        <input type="text" id="edit-profile-status" value="${profile.customStatus || ''}" placeholder="What's cooking, workspace?" class="w-full bg-bgTertiary text-white p-2.5 rounded border border-transparent focus:border-drixGreen outline-none">
      </div>
      <div>
        <label class="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Interface Avatar Color Theme</label>
        <div class="flex items-center gap-3">
          <input type="color" id="edit-profile-color" value="${profile.avatarColor || '#43b581'}" class="w-12 h-12 bg-transparent border-0 cursor-pointer rounded">
          <span class="text-xs text-gray-400 font-mono">Select native hex rendering point</span>
        </div>
      </div>
      <div class="pt-4 border-t border-black/10 flex justify-end space-x-3">
        <button type="button" onclick="document.getElementById('drixian-modal-container').classList.add('hidden')" class="bg-bgTertiary text-gray-300 px-4 py-2 rounded text-sm hover:bg-bgPrimary transition">Cancel</button>
        <button type="submit" class="bg-drixGreen text-white px-5 py-2 rounded text-sm hover:bg-emerald-600 font-medium shadow transition">Save Configuration</button>
      </div>
    </form>
  `;
}

export function renderServerSettingsHTML(server) {
  return `
    <div class="p-4 border-b border-black/20 flex justify-between items-center bg-bgTertiary">
      <h3 class="text-lg font-bold tracking-wide">Server Configuration Console</h3>
      <button type="button" onclick="document.getElementById('drixian-modal-container').classList.add('hidden')" class="text-gray-400 hover:text-white text-sm">✕</button>
    </div>
    <form id="server-settings-form" class="p-6 space-y-5 overflow-y-auto flex-1 text-sm">
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Community Matrix Name</label>
          <input type="text" id="edit-server-name" value="${server.name || ''}" required class="w-full bg-bgTertiary text-white p-2.5 rounded border border-transparent focus:border-drixGreen outline-none">
        </div>
        <div>
          <label class="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Mets Premium Contributions</label>
          <input type="number" id="edit-server-mets" value="${server.metsContributed || 0}" class="w-full bg-bgTertiary text-white p-2.5 rounded border border-transparent focus:border-drixGreen outline-none">
        </div>
      </div>
      
      <div class="p-3 bg-bgTertiary rounded border border-white/5 space-y-2">
        <h4 class="text-xs font-bold text-amber-400 uppercase tracking-wider">Active Role Distribution Hub</h4>
        <div class="grid grid-cols-2 gap-2 pt-1">
          <div>
            <label class="text-[10px] font-bold text-gray-500 uppercase block mb-1">Target Account Username</label>
            <input type="text" id="role-target-user" placeholder="e.g., JohnDoe" class="w-full bg-bgSecondary text-white p-2 text-xs rounded border border-transparent focus:border-drixGreen outline-none">
          </div>
          <div>
            <label class="text-[10px] font-bold text-gray-500 uppercase block mb-1">Assigned Operational Class</label>
            <select id="role-target-class" class="w-full bg-bgSecondary text-white p-2 text-xs rounded border border-transparent focus:border-drixGreen outline-none">
              <option value="member">✉️ Regular Member</option>
              <option value="shareholder">💼 Corporate Shareholder</option>
              <option value="admin">🛡️ System Administrator</option>
            </select>
          </div>
        </div>
        <button type="button" id="apply-role-assignment-btn" class="mt-2 w-full bg-bgPrimary hover:bg-bgSecondary border border-white/10 text-white text-xs py-1.5 rounded transition">Execute Classification Mapping</button>
      </div>

      <div class="pt-4 border-t border-black/10 flex justify-end space-x-3">
        <button type="button" onclick="document.getElementById('drixian-modal-container').classList.add('hidden')" class="bg-bgTertiary text-gray-300 px-4 py-2 rounded text-sm hover:bg-bgPrimary transition">Cancel</button>
        <button type="submit" class="bg-drixGreen text-white px-5 py-2 rounded text-sm hover:bg-emerald-600 font-medium shadow transition">Apply Changes</button>
      </div>
    </form>
  `;
}
