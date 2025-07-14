/**
 * Better Auth UI Configuration
 * Provides theme and feature settings for Better Auth UI components
 */

export const authUIConfig = {
  theme: {
    colorScheme: "auto" as const, // auto | light | dark
    primaryColor: "blue",
    radius: "md",
  },
  localization: {
    defaultLocale: "en",
    supportedLocales: ["en", "es", "fr", "de", "ja", "zh"],
  },
  features: {
    socialProviders: ["google", "github"],
    emailAndPassword: true,
    twoFactor: true,
    passkeys: true,
    organizations: true,
    apiKeys: true,
  },
  ui: {
    // Custom styling overrides
    card: {
      className: "shadow-lg",
    },
    button: {
      className: "font-medium",
    },
    input: {
      className: "focus:ring-2 focus:ring-primary-500",
    },
  },
  // Toast configuration for Sonner
  toast: {
    position: "top-right" as const,
    duration: 5000,
  },
};