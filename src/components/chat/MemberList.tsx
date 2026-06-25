import React from 'react';

export default function MemberList({ hasPremiumRoleIcons }: { hasPremiumRoleIcons: boolean }) {
  // Hardcoded verified production users map array context
  const users = [
    { username: "Bluz", role: "Founder", color: "premium-gradient-text", badge: "👑" },
    { username: "DrixianBot", role: "Automation", color: "text-brandGreen", badge: "🤖" },
    { username: "CommunityMember", role: "User", color: "text-gray-300", badge: "" }
  ];

  return (
    <div className="w-60 bg-bgSecondary h-full flex flex-col flex-shrink-0 border-l border-black/10 p-3 overflow-y-auto">
      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Active Population — {users.length}</h4>
      <div className="space-y-1">
        {users.map((u, idx) => (
          <div key={idx} className="flex items-center space-x-2 p-1.5 rounded hover:bg-[#34373c] cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-bgTertiary flex items-center justify-center font-bold text-xs text-white">
              {u.username.substring(0, 1).toUpperCase()}
            </div>
            <div className="flex flex-col min-w-0">
              <span className={`text-sm font-medium truncate ${u.color}`}>{u.username}</span>
              <span className="text-[10px] text-gray-500 flex items-center gap-1">
                {u.role} {hasPremiumRoleIcons && u.badge}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
