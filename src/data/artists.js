// Aesthetic Unsplash portraits representing diverse K-Pop/J-Pop style photobooth poses
const femalePoseIds = [
  "photo-1534528741775-53994a69daeb", // Pose 1: Classic cute look
  "photo-1517841905240-472988babdf9", // Pose 2: Cheerful smile
  "photo-1544005313-94ddf0286df2", // Pose 3: Pensive head tilt
  "photo-1524504388940-b1c1722653e1", // Pose 4: Aesthetic model pose
  "photo-1494790108377-be9c29b29330", // Pose 5: Big warm laugh
  "photo-1529626455594-4ff0802cfb7e"  // Pose 6: Playful wink/expression
];

const malePoseIds = [
  "photo-1506794778202-cad84cf45f1d", // Pose 1: Cool aesthetic look
  "photo-1500648767791-00dcc994a43e", // Pose 2: Handsome bright smile
  "photo-1539571696357-5a69c17a67c6", // Pose 3: Caring warm look
  "photo-1507003211169-0a1dd7228f2d", // Pose 4: Playful cheeky smile
  "photo-1492562080023-ab3db95bfbce", // Pose 5: Fun active pose
  "photo-1519085360753-af0119f7cbe7"  // Pose 6: Stylish modern look
];

const getPoseUrls = (isMale) => {
  const ids = isMale ? malePoseIds : femalePoseIds;
  return ids.map(id => `https://images.unsplash.com/${id}?auto=format&fit=crop&q=80&w=600`);
};

export const agencies = [
  { id: "starship", name: "Starship Ent." },
  { id: "hybe", name: "HYBE" },
  { id: "sm", name: "SM Entertainment" },
  { id: "yg", name: "YG Entertainment" },
  { id: "jyp", name: "JYP Entertainment" }
];

export const groupsByAgency = {
  starship: [
    { id: "ive", name: "IVE", logo: "✨", isMale: false }
  ],
  hybe: [
    { id: "newjeans", name: "NewJeans", logo: "🐰", isMale: false },
    { id: "bts", name: "BTS", logo: "💜", isMale: true }
  ],
  sm: [
    { id: "aespa", name: "aespa", logo: "🦋", isMale: false },
    { id: "nct127", name: "NCT 127", logo: "💚", isMale: true }
  ],
  yg: [
    { id: "blackpink", name: "BLACKPINK", logo: "💗", isMale: false },
    { id: "babymonster", name: "BABYMONSTER", logo: "🦁", isMale: false }
  ],
  jyp: [
    { id: "twice", name: "TWICE", logo: "🍭", isMale: false },
    { id: "straykids", name: "Stray Kids", logo: "👑", isMale: true }
  ]
};

// Auto-inject poses based on gender to make the asset management pristine and flawless
const createMembers = () => {
  const data = {
    ive: [
      { id: "wonyoung", name: "Wonyoung", role: "Vocalist / Center", color: "#ff8fc6" },
      { id: "yujin", name: "Yujin", role: "Leader / Vocalist", color: "#4d96ff" },
      { id: "rei", name: "Rei", role: "Rapper / Vocalist", color: "#6bcbf5" },
      { id: "gaeul", name: "Gaeul", role: "Main Dancer / Rapper", color: "#b983ff" }
    ],
    newjeans: [
      { id: "hanni", name: "Hanni", role: "Main Vocalist / Dancer", color: "#ff92a9" },
      { id: "minji", name: "Minji", role: "Vocalist / Dancer", color: "#ffd23f" },
      { id: "danielle", name: "Danielle", role: "Vocalist", color: "#4cd137" },
      { id: "haerin", name: "Haerin", role: "Dancer / Vocalist", color: "#00a8ff" }
    ],
    bts: [
      { id: "jungkook", name: "Jungkook", role: "Main Vocalist / Center", color: "#9c27b0" },
      { id: "v", name: "V", role: "Vocalist / Visual", color: "#2196f3" },
      { id: "jimin", name: "Jimin", role: "Lead Vocalist / Main Dancer", color: "#ff4081" }
    ],
    aespa: [
      { id: "karina", name: "Karina", role: "Leader / Main Dancer", color: "#3f51b5" },
      { id: "winter", name: "Winter", role: "Lead Vocalist / Visual", color: "#00bcd4" },
      { id: "giselle", name: "Giselle", role: "Main Rapper", color: "#4caf50" },
      { id: "ningning", name: "Ningning", role: "Main Vocalist", color: "#ff9800" }
    ],
    nct127: [
      { id: "taeyong", name: "Taeyong", role: "Leader / Main Rapper", color: "#8bc34a" },
      { id: "mark", name: "Mark", role: "Main Rapper / Dancer", color: "#cddc39" },
      { id: "jaehyun", name: "Jaehyun", role: "Lead Vocalist / Visual", color: "#ffeb3b" }
    ],
    blackpink: [
      { id: "jennie", name: "Jennie", role: "Main Rapper / Vocalist", color: "#e91e63" },
      { id: "jisoo", name: "Jisoo", role: "Lead Vocalist / Visual", color: "#9c27b0" },
      { id: "rose", name: "Rosé", role: "Main Vocalist / Lead Dancer", color: "#ff5722" },
      { id: "lisa", name: "Lisa", role: "Main Dancer / Lead Rapper", color: "#795548" }
    ],
    babymonster: [
      { id: "ahyeon", name: "Ahyeon", role: "All-Rounder", color: "#ff5722" },
      { id: "rami", name: "Rami", role: "Main Vocalist", color: "#607d8b" },
      { id: "asa", name: "Asa", role: "Main Rapper", color: "#e91e63" }
    ],
    twice: [
      { id: "nayeon", name: "Nayeon", role: "Lead Vocalist / Lead Dancer", color: "#ff4081" },
      { id: "sana", name: "Sana", role: "Sub Vocalist", color: "#ffeb3b" },
      { id: "momo", name: "Momo", role: "Main Dancer / Sub Vocalist", color: "#ff9800" }
    ],
    straykids: [
      { id: "bangchan", name: "Bang Chan", role: "Leader / Producer / Vocalist", color: "#2196f3" },
      { id: "felix", name: "Felix", role: "Lead Dancer / Lead Rapper", color: "#ffeb3b" },
      { id: "hyunjin", name: "Hyunjin", role: "Main Dancer / Lead Rapper", color: "#ff4081" }
    ]
  };

  const membersByGroupProcessed = {};

  Object.entries(data).forEach(([groupId, members]) => {
    // Find isMale from groupsByAgency lists
    let isMale = false;
    Object.values(groupsByAgency).forEach(groupList => {
      const g = groupList.find(x => x.id === groupId);
      if (g) isMale = g.isMale;
    });

    const poses = getPoseUrls(isMale);

    membersByGroupProcessed[groupId] = members.map((member, index) => {
      if (member.id === "wonyoung") {
        const wonyoungPoses = [
          "/img/poses/Wonyoung1.png",
          "/img/poses/Wonyoung2.png",
          "/img/poses/Wonyoung3.png",
          "/img/poses/Wonyoung4.png"
        ];
        return {
          ...member,
          avatar: "/img/poses/Wonyoung1.png",
          poses: wonyoungPoses
        };
      }

      // Offset starting pose slightly per member to give visual variety
      const memberPoses = [
        poses[(index + 0) % 6],
        poses[(index + 1) % 6],
        poses[(index + 2) % 6],
        poses[(index + 3) % 6],
        poses[(index + 4) % 6],
        poses[(index + 5) % 6]
      ];

      return {
        ...member,
        avatar: memberPoses[0], // Main avatar is their first pose
        poses: memberPoses
      };
    });
  });

  return membersByGroupProcessed;
};

export const membersByGroup = createMembers();
