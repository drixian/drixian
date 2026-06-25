import { evaluateServerPremium } from './premium.js';

export function renderAuthPage(errorMessage = "") {
  return `
    <div class="h-screen w-screen flex items-center justify-center bg-cover bg-center" style="background-image: url('branding/drixianbackround.png')">
      <div class="bg-bgSecondary p-8 rounded-lg shadow-2xl w-full max-w-md border border-bgTertiary/50 backdrop-blur-sm bg-opacity-95">
        <div class="flex flex-col items-center mb-6">
          <img src="branding/drixianlogo.png" alt="Drixian" class="w-16 h-16 object-contain mb-2 drop-shadow-md">
          <h2 class="text-2xl font-bold text-white tracking-wide">Welcome to Drixian</h2>
          <p class="text-gray-400 text-xs mt-1">Enter an email and password to instantly register or login.</p>
        </div>
        ${errorMessage ? `<div class="bg-drixDanger/20 text-drixDanger p-3 text-xs rounded mb-4 border border-drixDanger/30">${errorMessage}</div>` : ''}
        <form id="auth-form" class="space-y-4">
          <div>
            <label class="text-xs font-bold text-gray-300 uppercase tracking-wider block mb-2">Email Address</label>
            <input type="email" id="auth-email" required class="w-full bg-bgTertiary text-white p-2.5 rounded focus:border-drixGreen outline-none border border-transparent transition">
          </div>
          <div>
            <label class="text-xs font-bold text-gray-300 uppercase tracking-wider block mb-2">Password</label>
            <input type="password" id="auth-password" required class="w-full bg-bgTertiary text-white p-2.5 rounded focus:border-drixGreen outline-none border border-transparent transition">
          </div>
          <button type="submit" class="w-full bg-drixGreen hover:bg-emerald-600 text-white font-medium py-2.5 rounded transition shadow-md active:scale-[0.99]">
            Access Platform
          </button>
        </form>
      </div>
    </div>
  `;
}

export function renderMainInterface(state) {
  const username = state.user.email.split('@')[0];
  const premium = evaluateServerPremium(state.currentServer?.metsContributed || 0, state.currentServer?.ownerName || "");

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

    <div class="w-60 bg-bgSecondary h-full flex flex-col flex-shrink-0">
      <div class="h-12 border-b border-black/20 flex flex-col justify-center px-4 shadow-sm text-white">
        <div class="font-bold truncate text-sm tracking-wide">${state.currentServer ? state.currentServer.name : "Direct Messages"}</div>
        ${premium.tier === 3 ? `<div class="text-[9px] text-amber-400 font-bold uppercase tracking-widest animate-pulse flex items-center gap-1">${premium.label} Unlocked</div>` : ''}
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
      
      <div class="h-14 bg-bgProfile px-3 flex items-center justify-between border-t border-black/10">
        <div class="flex items-center space-x-2 overflow-hidden">
          <div class="w-8 h-8 rounded-full bg-drixGreen flex items-center justify-center text-white font-bold flex-shrink-0 text-sm">
            ${username.substring(0, 1).toUpperCase()}
          </div>
          <div class="flex flex-col overflow-hidden">
            <span class="text-sm font-bold text-white truncate leading-tight">${username}</span>
            <span class="text-[11px] text-amber-400 font-semibold tracking-wide">Mets Account Verified</span>
          </div>
        </div>
        <button id="logout-btn" class="text-gray-400 hover:text-white text-xs bg-bgTertiary px-2 py-1 rounded transition border border-black/20">Sign Out</button>
      </div>
    </div>

    <div class="flex-1 bg-bgPrimary flex h-full overflow-hidden min-w-0">
      <div class="flex-1 flex flex-col h-full overflow-hidden">
        <div class="h-12 border-b border-black/20 flex items-center px-4 justify-between font-bold text-white shadow-sm flex-shrink-0">
          <div class="flex items-center space-x-1.5 text-sm">
            <span class="text-gray-500 text-lg">#</span>
            <span class="tracking-wide">live-feed</span>
          </div>
          ${premium.hasAnimatedBanner ? '<span class="text-[10px] bg-gradient-to-r from-purple-500 via-pink-500 to-amber-500 px-2 py-0.5 rounded text-white font-bold tracking-wider uppercase animate-pulse shadow-sm">✨ Premium Graphics Pipeline Engaged</span>' : ''}
        </div>
        
        <div class="flex-1 overflow-y-auto p-4 space-y-4" id="chat-conversation-container">
          ${state.messages.map(m => {
            const isMsgBluz = m.username?.toLowerCase() === 'bluz';
            return `
              <div class="flex items-start space-x-3 group animate-fadeIn">
                <div class="w-10 h-10 rounded-full bg-bgTertiary flex items-center justify-center font-bold text-white flex-shrink-0 ${isMsgBluz ? 'border-2 border-amber-400 shadow-md' : ''}">
                  ${(m.username || "U").substring(0,1).toUpperCase()}
                </div>
                <div class="min-w-0 flex-1">
                  <div class="flex items-baseline space-x-2">
                    <span class="text-sm font-bold cursor-pointer ${isMsgBluz || premium.hasGradientNames ? 'premium-gradient-text font-extrabold' : 'text-white'} hover:underline">
                      ${m.username}
                    </span>
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

      <div class="w-56 bg-bgSecondary h-full border-l border-black/10 p-3 hidden lg:block flex-shrink-0">
        <h4 class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Server Population</h4>
        <div class="space-y-2">
          <div class="flex items-center space-x-2.5 p-1 rounded hover:bg-bgPrimary/40 transition cursor-pointer">
            <div class="w-8 h-8 rounded-full bg-bgTertiary flex items-center justify-center font-bold text-white border border-amber-400 shadow-sm text-xs">B</div>
            <div class="flex flex-col overflow-hidden">
              <span class="text-sm font-bold premium-gradient-text truncate">Bluz</span>
              <span class="text-[10px] text-amber-400 font-medium flex items-center gap-0.5">Founder ${premium.hasCustomRoleIcons ? '👑' : ''}</span>
            </div>
          </div>
          <div class="flex items-center space-x-2.5 p-1 rounded hover:bg-bgPrimary/40 transition opacity-80 cursor-not-allowed">
            <div class="w-8 h-8 rounded-full bg-bgTertiary flex items-center justify-center font-bold text-drixGreen text-xs">D</div>
            <div class="flex flex-col overflow-hidden">
              <span class="text-sm font-medium text-gray-300 truncate">DrixianBot</span>
              <span class="text-[10px] text-gray-500">System Bot</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}
