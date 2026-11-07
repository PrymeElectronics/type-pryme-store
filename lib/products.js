// ─── STORE SETTINGS ─── Edit these, then push to GitHub. Only keep promises that are true.
export const STORE = {
  name: "Pryme Electronics",
  deliveryArea: "Gauteng",
  deliveryFee: 80,          // Rand
  freeDeliveryOver: 1000,   // Rand. Set to 0 to never give free delivery
  deliveryTime: "1 to 3 working days",
  trust: [
    { icon: "box", title: "Brand-new stock", text: "Sealed in the box, straight to you." },
    { icon: "shield", title: "Safe card payment", text: "You pay through Whop's secure checkout." },
    { icon: "truck", title: "Door delivery", text: "Delivered across Gauteng." },
    { icon: "chat", title: "Real person on WhatsApp", text: "Ask anything before you buy." },
  ],
};

// ─── STARTING PRODUCTS ─── Used the first time the store runs.
// After that, change prices, stock and photos in /admin.
export const SEED_PRODUCTS = [
  {
    id: "samsung-galaxy-a07",
    name: "Samsung Galaxy A07",
    category: "Phones",
    badge: "Just landed",
    hook: "Big screen. Big battery. Small price.",
    bullets: [
      "6.7-inch smooth 90Hz screen for TikTok, YouTube and WhatsApp video calls",
      "50MP main camera for clear, sharp photos",
      "5,000mAh battery that keeps up with a full day",
      "Dual SIM, so work and personal numbers live on one phone",
    ],
    price: 2199,
    compareAt: null,
    stock: 5,
    image: "/products/samsung-a07.jpg",
    active: true,
  },
  {
    id: "usb-c-to-iphone-cable",
    name: "USB-C to iPhone fast-charge cable",
    category: "Cables",
    badge: "Best add-on",
    hook: "Charge your iPhone faster from any USB-C plug.",
    bullets: [
      "Fits iPhones with the Lightning port (iPhone 5 up to iPhone 14)",
      "Fast-charges with a 20W or stronger USB-C charger",
      "Also works with USB-C laptops and car chargers",
    ],
    price: 149,
    compareAt: null,
    stock: 20,
    image: "/products/usb-c-iphone-cable.jpg",
    active: true,
  },
  {
    id: "vizco-led-floodlight",
    name: "VIZCO Multifunction LED Floodlight",
    category: "Lights",
    badge: "Night hero",
    hook: "Light up the whole yard.",
    bullets: [
      "Bright, wide LED beam for the yard, driveway, gate or stoep",
      "Multiple light modes for security, work or a braai after dark",
      "See who is at the gate before you walk outside",
    ],
    price: 399,
    compareAt: null,
    stock: 10,
    image: "/products/vizco-floodlight.jpg",
    active: true,
  },
];
