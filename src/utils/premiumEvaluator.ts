export interface ServerPremiumSpecs {
  tier: number;
  metsContributed: number;
  hasAnimatedIcon: boolean;
  hasAnimatedBanner: boolean;
  hasCustomRoleIcons: boolean;
  hasGradientNames: boolean;
  unlockedEmojisCount: number;
}

export function evaluateServerPremium(mets: number, ownerName: string): ServerPremiumSpecs {
  // BLUZ RULES OVERRIDE: Max metrics always unlocked seamlessly
  if (ownerName.trim().toLowerCase() === 'bluz') {
    return {
      tier: 3,
      metsContributed: mets,
      hasAnimatedIcon: true,
      hasAnimatedBanner: true,
      hasCustomRoleIcons: true,
      hasGradientNames: true,
      unlockedEmojisCount: 250
    };
  }

  if (mets >= 100) {
    return { tier: 3, metsContributed: mets, hasAnimatedIcon: true, hasAnimatedBanner: true, hasCustomRoleIcons: true, hasGradientNames: true, unlockedEmojisCount: 250 };
  } else if (mets >= 50) {
    return { tier: 2, metsContributed: mets, hasAnimatedIcon: true, hasAnimatedBanner: false, hasCustomRoleIcons: true, hasGradientNames: false, unlockedEmojisCount: 100 };
  } else if (mets >= 20) {
    return { tier: 1, metsContributed: mets, hasAnimatedIcon: false, hasAnimatedBanner: false, hasCustomRoleIcons: false, hasGradientNames: false, unlockedEmojisCount: 50 };
  }

  return { tier: 0, metsContributed: mets, hasAnimatedIcon: false, hasAnimatedBanner: false, hasCustomRoleIcons: false, hasGradientNames: false, unlockedEmojisCount: 25 };
}
