export type PackSize = {
  id: string;
  label: string;
  price: number;
  mrp: number;
};

export const PRODUCT = {
  id: "veerja-a2-ghee",
  name: "Veerja Eats Premium A2 Cow Ghee",
  shortName: "A2 Cow Ghee",
  description:
    "Rich, aromatic and traditionally crafted A2 Cow Ghee made for everyday nourishment and authentic Indian cooking.",
  rating: 4.9,
  reviewCount: 1284,
  sizes: [
    { id: "250ml", label: "250 ml", price: 649, mrp: 799 },
    { id: "500ml", label: "500 ml", price: 1199, mrp: 1449 },
    { id: "1l", label: "1 Litre", price: 2199, mrp: 2699 },
  ] as PackSize[],
};

export const DELIVERY_FEE = 0;

export const BENEFITS = [
  { emoji: "🐄", title: "A2 Cow Milk" },
  { emoji: "🌿", title: "Natural Ingredients" },
  { emoji: "🧈", title: "Traditional Preparation" },
  { emoji: "✨", title: "Premium Quality" },
  { emoji: "🇮🇳", title: "Made in India" },
];

export const FEATURES = [
  {
    title: "Premium A2 Cow Ghee",
    body: "Churned from the milk of indigenous desi cows, grazed freely on open pastures.",
  },
  {
    title: "Traditional Indian Wisdom",
    body: "Made by the age-old bilona method our grandmothers trusted — slow, patient, honest.",
  },
  {
    title: "Carefully Selected Ingredients",
    body: "Nothing added, nothing hidden. Just cultured curd, time and gentle heat.",
  },
  {
    title: "Rich Aroma & Taste",
    body: "A nutty, golden fragrance that fills the kitchen the moment the jar opens.",
  },
  {
    title: "Quality You Can Trust",
    body: "Every small batch is lab tested for purity before it reaches your home.",
  },
  {
    title: "Made With Care",
    body: "Hand-packed in glass jars to protect aroma, texture and goodness.",
  },
];

export const PROCESS = [
  { step: "Healthy Cows", body: "Free-grazing desi cows raised with love." },
  { step: "Pure Milk", body: "Collected fresh, every single morning." },
  { step: "Traditional Preparation", body: "Cultured overnight, hand-churned to butter." },
  { step: "Carefully Crafted Ghee", body: "Slow-simmered on a gentle wood flame." },
  { step: "Packed With Care", body: "Sealed in glass to lock in the aroma." },
  { step: "Delivered To Your Home", body: "Shipped across India within days." },
];

export const TESTIMONIALS = [
  {
    name: "Ananya Sharma",
    city: "Pune",
    rating: 5,
    review:
      "The aroma took me straight back to my grandmother's kitchen. You can taste the difference in the very first spoon.",
  },
  {
    name: "Rohit Malhotra",
    city: "Delhi",
    rating: 5,
    review:
      "Grainy texture, deep golden colour and zero heaviness. This is the real thing — we've switched completely.",
  },
  {
    name: "Meera Iyer",
    city: "Chennai",
    rating: 5,
    review:
      "I use it for everything from pongal to dosa. Packaging is premium and delivery was quick and careful.",
  },
  {
    name: "Kabir Deshmukh",
    city: "Nagpur",
    rading: 5,
    review:
      "Ordered the 1 litre jar for the family. Honest quality at a fair price — we finished it in three weeks!",
    rating: 5,
  },
  {
    name: "Sneha Patel",
    city: "Ahmedabad",
    rating: 5,
    review:
      "My children love the taste and I love knowing exactly how it is made. Veerja Eats has earned our trust.",
  },
];

export const FAQS = [
  {
    q: "What is A2 Cow Ghee?",
    a: "A2 ghee is made from the milk of indigenous cow breeds that produce only the A2 beta-casein protein. It is traditionally considered lighter, easier to digest and more nourishing than regular ghee.",
  },
  {
    q: "How is Veerja Eats Ghee prepared?",
    a: "We follow the traditional bilona method — the milk is cultured into curd overnight, hand-churned into butter, and slow-simmered on a gentle flame until golden ghee separates.",
  },
  {
    q: "What pack sizes are available?",
    a: "Veerja Eats A2 Cow Ghee is available in 250 ml, 500 ml and 1 Litre glass jars.",
  },
  {
    q: "How should I store the ghee?",
    a: "Store the jar in a cool, dry place away from direct sunlight. Refrigeration is not required. Always use a clean, dry spoon.",
  },
  {
    q: "How long does delivery take?",
    a: "Orders are dispatched within 24 hours and typically delivered in 3–6 working days anywhere in India.",
  },
  {
    q: "Is the product suitable for everyday cooking?",
    a: "Absolutely. With a high smoke point, it is ideal for daily tempering, sautéing, roti, rice, sweets and deep cooking.",
  },
];

export const inr = (value: number) =>
  `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
