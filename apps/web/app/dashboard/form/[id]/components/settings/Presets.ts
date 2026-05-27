'use client';

export const WELCOME_PRESETS = [
  {
    id: "premium-onboarding-card",
    name: "Premium Onboarding Card",
    description: "Elegant card layout with clip-art clipboard icon, 3 Highlights Grid (Quick & Easy, Secure & Private, Important Info), and Cancel link.",
    label: "Welcome!",
    validation: {
      buttonText: "Start Form",
      buttonBgColor: "#4f46e5",
      buttonTextColor: "#ffffff",
      cardBgColor: "#ffffff",
      bgGradient: "linear-gradient(135deg, #f5f3ff 0%, #e0e7ff 100%)",
      labelColor: "#1e1b4b",
      labelFontFamily: "Outfit, sans-serif",
      labelFontSize: "32px",
      descriptionColor: "#4338ca",
      descriptionFontFamily: "Inter, sans-serif",
      descriptionFontSize: "14px",
      description: "You're about to start a form. It will only take a few minutes to complete.",
      showHighlightsGrid: true,
      showStatsBadge: false,
    }
  },
  {
    id: "modern-split-hero",
    name: "Modern Split-Media Hero",
    description: "High-converting layout with left-aligned split graphic, stats estimation badge, features list, and clean text colors.",
    label: "Share Your Feedback",
    validation: {
      buttonText: "Let's Begin",
      buttonBgColor: "#0ea5e9",
      buttonTextColor: "#ffffff",
      imageLayout: "split-left",
      imageUrl: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=1000&auto=format&fit=crop",
      imageAlt: "Feedback Team",
      showStatsBadge: true,
      statsTime: "2 mins",
      features: [
        "100% Anonymous & Secure",
        "Takes less than 2 minutes",
        "Get a 15% discount code at the end"
      ],
      cardBgColor: "rgba(255, 255, 255, 0.7)",
      bgGradient: "linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)",
      labelColor: "#0f172a",
      labelFontFamily: "Outfit, sans-serif",
      labelFontSize: "28px",
      descriptionColor: "#334155",
      descriptionFontFamily: "Inter, sans-serif",
      description: "Join 10,000+ others in shaping the future of our product. Your voice matters.",
    }
  },
  {
    id: "sleek-dark-glassmorphism",
    name: "Sleek Dark Glassmorphism",
    description: "Deep obsidian backdrop with translucent neon card, custom geometric headings, fuchsia buttons, and expert quote card.",
    label: "Unlock Your Potential",
    validation: {
      buttonText: "Start Assessment",
      buttonBgColor: "#d946ef",
      buttonTextColor: "#ffffff",
      bgGradient: "linear-gradient(135deg, #090514 0%, #12092b 50%, #22053d 100%)",
      bgImageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop",
      cardBgColor: "rgba(15, 10, 35, 0.8)",
      labelColor: "#ffffff",
      labelFontFamily: "Outfit, sans-serif",
      labelFontSize: "32px",
      descriptionColor: "#e2e8f0",
      descriptionFontFamily: "Inter, sans-serif",
      description: "Complete this quick assessment to get a personalized career trajectory map instantly.",
      showStatsBadge: true,
      statsTime: "3 mins",
      creatorProfile: {
        name: "Dr. Sarah Jenkins",
        role: "Head of Career Strategy",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80",
        quote: "This assessment represents our latest research in organizational psychology."
      }
    }
  }
];

export const THANK_YOU_PRESETS = [
  {
    id: "premium-reward-share",
    name: "Premium Reward & Social Share",
    description: "Emerald green styling, custom Gift promo resource card, and direct X & LinkedIn social share buttons.",
    label: "Awesome! You're All Done",
    validation: {
      buttonText: "Claim Reward",
      buttonBgColor: "#10b981",
      buttonTextColor: "#ffffff",
      cardBgColor: "#ffffff",
      bgGradient: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
      labelColor: "#064e3b",
      labelFontFamily: "Outfit, sans-serif",
      labelFontSize: "28px",
      descriptionColor: "#065f46",
      descriptionFontFamily: "Inter, sans-serif",
      description: "Thank you for sharing your feedback. Your submission has been recorded. As a thank you, here is a special reward for you!",
      socialShare: true,
      promoCard: {
        title: "Claim Your 15% Discount Code",
        description: "Use coupon code FEEDBACK15 at checkout to enjoy a 15% discount on all our plans.",
        linkUrl: "https://example.com/claim",
        linkText: "Go to Checkout →"
      }
    }
  },
  {
    id: "split-visual-thank-you",
    name: "Visual Split Thank You",
    description: "Elegant split layout with digital abstract graphic, beautiful pastel indigo colors, and direct link copy function.",
    label: "Thank You!",
    validation: {
      buttonText: "Create Your Own Form",
      buttonBgColor: "#6366f1",
      buttonTextColor: "#ffffff",
      imageLayout: "split-right",
      imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1000&auto=format&fit=crop",
      imageAlt: "Digital Abstract",
      cardBgColor: "#ffffff",
      bgGradient: "linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)",
      labelColor: "#1e1b4b",
      labelFontFamily: "Outfit, sans-serif",
      labelFontSize: "32px",
      descriptionColor: "#312e81",
      descriptionFontFamily: "Inter, sans-serif",
      description: "Your answers have been successfully submitted. We appreciate your time and support.",
      socialShare: true,
    }
  },
  {
    id: "minimalist-executive-outro",
    name: "Minimalist Executive Outro",
    description: "Vogue luxury layout with clean paper-white gradients, Playfair Display serif typography, and clean action button.",
    label: "Submission Received",
    validation: {
      buttonText: "Return to Homepage",
      buttonBgColor: "#18181b",
      buttonTextColor: "#ffffff",
      cardBgColor: "#ffffff",
      bgGradient: "linear-gradient(135deg, #fafafa 0%, #eaeaea 100%)",
      labelColor: "#09090b",
      labelFontFamily: '"Playfair Display", serif',
      labelFontSize: "32px",
      descriptionColor: "#27272a",
      descriptionFontFamily: "Inter, sans-serif",
      description: "Thank you for completing this form. Your response has been securely archived and will be reviewed shortly by our executive team.",
      socialShare: false,
    }
  }
];
