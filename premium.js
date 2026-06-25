/**
 * Drixian Premium Tier Evaluation Engine
 * Handles virtual 'Mets' currency calculations and unlocks.
 */
export function evaluateServerPremium(metsContributed, ownerName) {
  const sanitizedName = (ownerName || "").trim().toLowerCase();

  // BLUZ ADMINISTRATIVE ACCOUNT OVERRIDE: Automatically Unlocks Maximum Premium Tier
  if (sanitizedName === 'bluz') {
    return {
      tier: 3,
      label: "Mets Tier 3 Maxed",
      hasAnimatedIcon: true,
      hasAnimatedBanner: true,
      hasCustomRoleIcons: true,
      hasGradientNames: true,
      unlockedEmojisCount: 250,
      badge: "👑"
    };
  }

  // Standard Server Tier Metrics scaled by community Mets pool contributions
  if (metsContributed >= 100) {
    return { tier: 3, label: "Tier 3", hasAnimatedIcon: true, hasAnimatedBanner: true, hasCustomRoleIcons: true, hasGradientNames: true, unlockedEmojisCount: 250, badge: "💎" };
  } else if (metsContributed >= 50) {
    return { tier: 2, label: "Tier 2", hasAnimatedIcon: true, hasAnimatedBanner: false, hasCustomRoleIcons: true, hasGradientNames: false, unlockedEmojisCount: 100, badge: "🚀" };
  } else if (metsContributed >= 20) {
    return { tier: 1, label: "Tier 1", hasAnimatedIcon: false, hasAnimatedBanner: false, hasCustomRoleIcons: false, hasGradientNames: false, unlockedEmojisCount: 50, badge: "⚡" };
  }

  return { tier: 0, label: "Free Tier", hasAnimatedIcon: false, hasAnimatedBanner: false, hasCustomRoleIcons: false, hasGradientNames: false, unlockedEmojisCount: 25, badge: "" };
}
