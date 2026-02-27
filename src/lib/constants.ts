export const WARDS = [
  "Santhi Nagar", "Koodal Nagar", "Anaiyur", "Sambandhar Alankulam", "B.B.Kulam",
  "Meenambalpuram", "Kailaasapuram", "Vilangudi", "Thathaneri", "Aarappalayam",
  "Ponnaharam", "Krishnaapalayam", "Azhagaradi", "Viswasapuri", "Melapponnaharam",
  "Railway Colony", "Ellis Nagar", "S.S.Colony", "Ponmeni", "Arasaradi Othakkadai",
  "Bethaniyapuram", "Kochadai", "Visalakshi Nagar", "Thiruppaalai", "Kannanendhal",
  "Parasuraamanpatti", "Karpaga Nagar", "Uthangudi", "Masthaanpatti", "Melamadai",
  "Tahsildhar Nagar", "Vandiyur", "Saathamangalam", "Arignar Anna Nagar", "Madhichiyam",
  "Aazhwarpuram", "Sellur", "Pandhalkudi", "Goripalayam", "Ahimsapuram",
  "Narimedu", "Chokkikulam", "Tallakulam", "K.K.Nagar", "Pudur",
  "Lourdhu Nagar", "Reserve Line", "Aathikulam", "Naahanakulam", "Swami Sannidhi",
  "Ismailpuram", "Sourashtra Hr. Sec. School", "Pangajam Colony", "Mariamman Theppakulam", "Iraavadhanallur",
  "Sinna Anuppanadi", "Anuppanadi", "Chinthamani", "Meenakshi Nagar", "Avaniyaapuram",
  "Villapuram Pudhu Nagar", "Kathirvel Nagar", "Villaapuram", "Keeraithurai", "Sappani Kovil",
  "South Krishnan Kovil", "Manjanakara Street", "Dhrowpathi Amman Kovil", "St.Marys", "Kaamarajapuram",
  "Balaranganathapuram", "Navarathinapuram", "Lakshmipuram", "Thirumalai Naicker Mahal", "Maadakkulam",
  "Pazhangaanatham", "Sundarajapuram", "Madurai Baskaradass Nagar", "Perumal Theppakulam", "Krishnarayar Theppakulam",
  "Tamilsangam", "Sokkanadhar Kovil", "North Krishnan Kovil", "Meenakshi Kovil", "Jadamuni Kovil",
  "Kaajimar Street", "Subramaniapuram", "Solai Azhagupuram", "Jaihindpuram", "Veerakali Amman Kovil",
  "Thennaharam", "Kovalan Nagar", "T.V.S.Nagar", "Paamban Swami Nagar", "Mannar College",
  "Thirupparamkundram", "Haarvipatti", "Thirunahar", "Balaji Nagar", "Muthuramalingapuram"
].map((name, index) => ({ id: index + 1, name }));

export const CATEGORIES = [
  'Solid Waste', 'Roads & Potholes', 'Streetlights', 'Water Supply', 'Drainage',
  'Public Toilets', 'Encroachments', 'Construction Debris', 'Stray Animals',
  'Traffic Signals', 'Public Safety', 'Environmental Violations', 'Other'
];

export const USER_ROLES = [
  'Citizen', 'Sanitation Worker', 'Ward Officer', 'Zonal Officer', 
  'Municipal Commissioner', 'District Collector', 'Police Authority', 
  'Tahsildar', 'System Admin'
] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const SLA_DEADLINES: Record<string, number> = {
  'Solid Waste': 24, // hours
  'Roads & Potholes': 72,
  'Streetlights': 48,
  'Water Supply': 24,
  'Drainage': 48,
  'Public Toilets': 24,
  'Encroachments': 168,
  'Construction Debris': 48,
  'Stray Animals': 48,
  'Traffic Signals': 12,
  'Public Safety': 6,
  'Environmental Violations': 48,
  'Other': 72,
};

export const ESCALATION_PATH = [
  'Ward Officer',
  'Zonal Officer',
  'Municipal Commissioner',
  'District Collector'
];