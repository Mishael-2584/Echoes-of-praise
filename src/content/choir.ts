/** Public-facing choir content (from ministry SOP — non-confidential excerpts only). */

export const choirProfile = {
  name: "Echoes of Praise",
  tagline: "Spreading the Gospel through music",
  homeBase: "Nakuru, Kenya",
  email: "hello@echoesofpraize.com",
  website: "https://echoesofpraize.com",
  instagramHandle: "echoesofpraize",
  instagramUrl: "https://www.instagram.com/echoesofpraize/",
  instagramQr: "/images/instagram-qr.webp",
  affiliation:
    "An independent Christian choir ministry based in Nakuru, Kenya—spreading the Gospel through sacred music.",
  nature:
    "Echoes of Praise is a Christian music ministry dedicated to spreading the Gospel through music. The organisation exists to glorify God through sacred music, nurture spiritual growth among its members, and minister to communities through musical evangelism.",
  purpose: [
    "Minister through music and use musical talents to glorify God.",
    "Spread the Gospel through concerts, church services, outreach programs, and evangelistic missions.",
    "Encourage spiritual growth and fellowship among members.",
    "Develop musical excellence while maintaining a Christ-centred approach to ministry.",
    "Support the mission of the Seventh-day Adventist Church through music ministry.",
  ],
  rehearsal:
    "Primary rehearsals are held on Saturday evenings from 4:00pm to 6:00pm, with additional sessions as needed for concerts and special ministry events.",
  membershipNote:
    "Membership is open to believers who confess faith in Jesus Christ and support the spiritual mission of the ministry—children, youth, and adults—centred in Nakuru and welcoming participants from beyond.",
  faithSummary:
    "Founded on biblical principles and guided by Scripture—affirming the Trinity, salvation by grace through faith in Jesus Christ, the authority of the Bible, Christ-centred living, the seventh-day Sabbath, and music as a ministry tool for hope and encouragement.",
  beliefs: [
    "One God: Father, Son, and Holy Spirit.",
    "Jesus Christ is the Son of God and Saviour of the world.",
    "The Holy Bible is the inspired Word of God.",
    "Salvation is by grace through faith in Jesus Christ.",
    "A Christ-centred life of prayer, worship, and obedience.",
    "Observance of the seventh-day Sabbath as taught in the Bible.",
    "Music as a ministry tool to spread hope, salvation, and encouragement.",
  ],
};

/** Highlight recording — credits from the published arrangement title page. */
export const highlightSong = {
  title: "I Sing Because I'm Happy",
  youtubeId: "LJCDpvkBIWA",
  youtubeUrl: "https://www.youtube.com/watch?v=LJCDpvkBIWA",
  voicing: "SATB and Piano",
  duration: "ca. 3:30",
  wordsBy: "Civilla D. Martin (1866–1948)",
  musicBy: "Charles H. Gabriel (1856–1932)",
  arrangedBy: "Kenneth Paden",
  adaptedBy: "Rollo Dilworth",
  dedication: "To the Temple University Chorale",
  tempo: "With a rhythmic bounce (♩ = ca. 112)",
  blurb:
    "Our highlight recording—Echoes of Praise lifting a classic of joy and testimony. All credit for the words, music, and this arrangement belongs to the creators named here.",
};

export type Testimonial = {
  id: string;
  quote: string;
  name: string;
  role: string;
  source?: string;
};

export const testimonials: Testimonial[] = [
  {
    id: "eldoville-2026",
    quote:
      "Your ministry through music was a great blessing to our congregation. Through your songs, you uplifted our hearts, strengthened our faith, and inspired us to draw closer to God. We also wish to express our heartfelt appreciation for being such gracious and easy guests to host—your humility, cooperation, and warm spirit made everything run smoothly.",
    name: "Zipporah Metto",
    role: "Music Director, Eldoville Seventh-day Adventist Church",
    source: "Appreciation letter · 25 July 2026",
  },
];

/** Featured anniversary concert (also seeded in events). */
export const oneConcert = {
  slug: "one-concert-2026",
  title: "Echoes of Praise at ONE Concert",
  theme: "Praise Amplified",
  anniversary: "1-year anniversary celebration",
  dateLabel: "29 November 2026",
  timeLabel: "2:00 PM",
  venue: "Crater SDA Church, Nakuru",
  portrait: "/images/choir-main.jpg",
  guests: [
    {
      name: "The Cenacle Ministry",
      place: "Uganda",
      image: "/images/events/one-concert-cenacle.png",
    },
    {
      name: "Abide",
      place: "Nairobi, Kenya",
      image: "/images/events/one-concert-abide.jpg",
    },
  ],
  ticketsNote: "Free admission",
  fundraiserSlug: "one-concert-2026",
};

export type LeadershipRole = {
  id: string;
  title: string;
  summary: string;
  name: string | null;
  photoUrl?: string | null;
  /** CSS object-position for portrait crop */
  photoPosition?: string;
  /** Zoom factor for full-body shots that need a tighter crop */
  photoScale?: number;
};

export const leadershipRoles: LeadershipRole[] = [
  {
    id: "chair",
    title: "Chairperson / Ministry Leader",
    summary: "Provides overall vision, leadership, and direction of the ministry.",
    name: "Collince Musumba",
    photoUrl: "/images/leadership/collince-musumba-v3.png",
    photoPosition: "center 20%",
  },
  {
    id: "vice",
    title: "Vice Chairperson",
    summary: "Supports the Chairperson and oversees implementation of ministry plans.",
    name: "Hulda Tirimba",
    photoUrl: "/images/leadership/huldah-tirimba.png",
    photoPosition: "center 18%",
  },
  {
    id: "music",
    title: "Music Director",
    summary: "Provides musical leadership, repertoire, rehearsals, and performance readiness.",
    name: "Job Sagini",
    photoUrl: "/images/leadership/job-sagini-v2.png",
    photoPosition: "center 18%",
  },
  {
    id: "spiritual",
    title: "Spiritual Coordinator",
    summary: "Oversees devotionals, prayer, and the spiritual life of the ministry.",
    name: "Anne Atonga",
    photoUrl: "/images/leadership/anne-atonga.png",
    photoPosition: "center 18%",
  },
  {
    id: "liaison",
    title: "Church Liaison / Spiritual Advisor",
    summary: "Spiritual counsel and partnership support for the ministry’s church and community engagements.",
    name: "James Wanyanga",
    photoUrl: "/images/leadership/james-wanyanga.png",
    photoPosition: "68% 18%",
  },
  {
    id: "secretary",
    title: "Secretary",
    summary: "Records, correspondence, and organisational documentation.",
    name: "Agnes Mongare",
    photoUrl: "/images/leadership/agnes-mongare.png",
    photoPosition: "center 12%",
    photoScale: 1.35,
  },
  {
    id: "treasurer",
    title: "Treasurer",
    summary: "Stewards ministry finances with accountability and transparency.",
    name: "David Okuthe",
    photoUrl: "/images/leadership/david-okuthe.png",
    photoPosition: "center 22%",
  },
  {
    id: "events",
    title: "Events and Logistics Coordinator",
    summary: "Coordinates events, hospitality, transport, and logistical readiness for ministry engagements.",
    name: "Gift Motari",
    photoUrl: "/images/leadership/gift-motari.png",
    photoPosition: "center 18%",
  },
  {
    id: "media",
    title: "Media and Communications Coordinator",
    summary: "Stewards media, messaging, and communications for the ministry.",
    name: "Sandra Metto",
    photoUrl: "/images/leadership/sandra-metto-v4.png",
    photoPosition: "center 30%",
  },
  {
    id: "guidance",
    title: "Guidance and Restoration Coordinator",
    summary: "Supports guidance, care, and restoration among members of the ministry.",
    name: "Mercy Bore",
    photoUrl: "/images/leadership/mercy-bore.png",
    photoPosition: "center 12%",
    photoScale: 1.45,
  },
];

export type Conductor = {
  id: string;
  name: string | null;
  title: string;
  note?: string;
};

export const conductors: Conductor[] = [
  {
    id: "c-shiphrah",
    name: "Shiphrah Musumba",
    title: "Conductor",
  },
  {
    id: "c-job-sagini",
    name: "Job Sagini",
    title: "Conductor",
    note: "Also saxophone & clarinet",
  },
  {
    id: "c-rispah-momanyi",
    name: "Rispah Momanyi",
    title: "Conductor",
  },
];

export type Instrumentalist = {
  id: string;
  name: string | null;
  instrument: string;
};

export const instrumentalists: Instrumentalist[] = [
  { id: "i-mishael", name: "Mishael Gebre", instrument: "Saxophone" },
  { id: "i-edgar", name: "Edgar Zeke", instrument: "Trumpet / Piano" },
  { id: "i-mikneah", name: "Mikneah Mulungi", instrument: "Piano" },
  { id: "i-isaiah", name: "Isaiah Gidayi", instrument: "Organ / Piano" },
  { id: "i-job-bass", name: "Job Ngugi", instrument: "Bass" },
  {
    id: "i-job-sagini",
    name: "Job Sagini",
    instrument: "Saxophone / Clarinet",
  },
  { id: "i-janice", name: "Janice Ayiemba", instrument: "Violin" },
  { id: "i-michal", name: "Michal Juma", instrument: "Violin" },
  { id: "i-dennis", name: "Dennis", instrument: "Drums" },
  { id: "i-darius", name: "Darius Mong'are", instrument: "Trumpet" },
  { id: "i-brian", name: "Brian Musembi", instrument: "Violin" },
  { id: "i-kirk", name: "Kirk", instrument: "Violin" },
  { id: "i-angel", name: "Angel", instrument: "Violin" },
  { id: "i-gianna", name: "Gianna", instrument: "Violin" },
  { id: "i-kareem", name: "Kareem Kelly", instrument: "Violin" },
  { id: "i-travis", name: "Travis Obunaka", instrument: "Clarinet" },
  { id: "i-elaine", name: "Elaine Imbamba", instrument: "Clarinet" },
  { id: "i-phoebe", name: "Phoebe Waithaka", instrument: "Tenor Saxophone" },
  { id: "i-amani", name: "Amani Nyawalo", instrument: "Flute" },
  { id: "i-elisha", name: "Elisha Wasaga", instrument: "Guitar" },
];

export type ChoirMember = {
  id: string;
  name: string;
  section?: string;
};

/** Distinct roster from ministry lists (contribution + travel), A–Z by given name. */
const MEMBER_NAMES = [
  "Aaron Misati",
  "Abigael Jepkoech",
  "Agnes Benita Mong'are",
  "Alicia Makori",
  "Alvan Nyambichu",
  "Amani Nyawalo",
  "Andrew Oroko Nyakina",
  "Angel",
  "Anne Atonga",
  "Balozi Mungwana",
  "Baraka Naomi",
  "Barkley Chugi",
  "Beth Mwangi",
  "Betty Wakesho",
  "Boaz",
  "Brian Musembi",
  "Caprice Tuvako",
  "Carlson Bichanga",
  "Caroline Laurah Gathundia",
  "Chantelle Ogenga",
  "Cindy Florie Nyambichu",
  "Darius Mong'are",
  "David Okuthe",
  "Deborah Onwong'a",
  "Denis Bichanga",
  "Denis Chibu",
  "Dennis",
  "Dennis Mariko Ndubi",
  "Derrick Bichanga",
  "Diana Kerubo",
  "Dylan Bichanga",
  "Dylan Mbeche Tuvako",
  "Eddy Fidel Sum",
  "Edgar Zeke",
  "Elaine Imbamba",
  "Elaine Oigo",
  "Eld. James Wanyanga",
  "Eld. Stanley Gichaba",
  "Eleanor Kerubo Oigo",
  "Elisha Wasaga",
  "Elvis Omondi Odhiambo",
  "Emmanuel Kiprotich",
  "Emmanuel Rono",
  "Erick Ogweno Gaya",
  "Eunice Kelly",
  "Favour Njeri",
  "Gianna",
  "Gift Motari",
  "Grace Kibaara",
  "Harriet Safari",
  "Hellen Makori",
  "Hellen Momanyi",
  "Hulda Tirimba",
  "Huldah Chepkoech Rotich",
  "Ian Kipruto",
  "Isaiah Gidayi",
  "Ivy Bosibori Ondieki",
  "Janet Agasa",
  "Janice Ayiemba",
  "Jefferson Bichanga",
  "Job Ngugi",
  "Job Sagini",
  "Jonathan Suvira",
  "Judith Chepchirchir Kitur",
  "Kahama Nderitu Kibaara",
  "Kareem Kelly",
  "Kathleen Berly",
  "Keila Owano",
  "Kirk",
  "Kyle Ogola",
  "Marlin King",
  "Marsha Mokeira",
  "Martha Mong'ina",
  "Mary Kipyegon",
  "Mary Loriko Loyelei",
  "Mercy Bore",
  "Michael Steve",
  "Michal Juma",
  "Mikneah Mulungi",
  "Mila Tirimba",
  "Miller William",
  "Mishael Gebre",
  "Mrs. David Okuthe",
  "Mrs. Stanley Gichaba",
  "Musumba Collince",
  "Naomi Zablon",
  "Natalie Achieng",
  "Nicole Bowen",
  "Nina Kagendo Kibaara",
  "Noel Bobby",
  "Peris Njeri",
  "Phoebe Waithaka",
  "Polycarp Mwamba",
  "Precious Machuki",
  "Priyanka Rose",
  "Reuel Musumba",
  "Rick Oigo",
  "Rispah Bichanga",
  "Rispah Momanyi",
  "Risper Nyabero",
  "Ronny Joram Monari",
  "Roseann Ngunyi",
  "Ruby Gweth Akinyi Ogola",
  "Ryan Makori",
  "Ryn Chelimo",
  "Samwel Tumaini",
  "Sandra Chepkoech Metto",
  "Seth Tirimba",
  "Shiphrah Musumba",
  "Skylar Tirimba",
  "Sophia Thomas",
  "Steeve Monari",
  "Steve Nyaundi",
  "Timothy Gebre",
  "Travis Obunaka",
  "Wycliffe Tirimba",
] as const;

const MEMBER_SECTIONS: Record<string, string> = {
  "Shiphrah Musumba": "Conductor",
  "Job Sagini": "Conductor · Saxophone / Clarinet",
  "Rispah Momanyi": "Conductor",
  "Job Ngugi": "Bass",
  "Isaiah Gidayi": "Organ / Piano",
  "Janice Ayiemba": "Violin",
  "Michal Juma": "Violin",
  "Mishael Gebre": "Saxophone",
  "Edgar Zeke": "Trumpet / Piano",
  "Mikneah Mulungi": "Piano",
  "Dennis": "Drums",
  "Darius Mong'are": "Trumpet",
  "Brian Musembi": "Violin",
  "Kirk": "Violin",
  "Angel": "Violin",
  "Gianna": "Violin",
  "Kareem Kelly": "Violin",
  "Travis Obunaka": "Clarinet",
  "Elaine Imbamba": "Clarinet",
  "Phoebe Waithaka": "Tenor Saxophone",
  "Amani Nyawalo": "Flute",
  "Elisha Wasaga": "Guitar",
};

export const choirMembers: ChoirMember[] = MEMBER_NAMES.map((name, i) => ({
  id: `m-${String(i + 1).padStart(3, "0")}`,
  name,
  section: MEMBER_SECTIONS[name],
}));

export type PromoReel = {
  id: string;
  title: string;
  caption: string;
  src: string;
  poster: string;
  orientation: "landscape" | "portrait";
};

/** Promotional clips for ONE Concert · Praise Amplified (29 Nov 2026). */
export const promoReels: PromoReel[] = [
  {
    id: "are-you-ready",
    title: "Nakuru, are you ready?",
    caption: "The choir sends the invitation.",
    src: "/media/promo/are-you-ready.mp4",
    poster: "/media/promo/are-you-ready.jpg",
    orientation: "landscape",
  },
  {
    id: "see-you-there",
    title: "See you there",
    caption: "Friends of the ministry on why they're coming.",
    src: "/media/promo/see-you-there.mp4",
    poster: "/media/promo/see-you-there.jpg",
    orientation: "landscape",
  },
  {
    id: "cenacle",
    title: "The Cenacle Ministry",
    caption: "Our guests from Uganda join Praise Amplified.",
    src: "/media/promo/cenacle-praise-amplified.mp4",
    poster: "/media/promo/cenacle-praise-amplified.jpg",
    orientation: "portrait",
  },
  {
    id: "dont-be-like-okudhe",
    title: "Don't be like Okudhe",
    caption: "A little warning from the choir family.",
    src: "/media/promo/dont-be-like-okudhe.mp4",
    poster: "/media/promo/dont-be-like-okudhe.jpg",
    orientation: "landscape",
  },
  {
    id: "nov-29",
    title: "29 November 2026",
    caption: "Save the date: Crater SDA Church, 2 PM.",
    src: "/media/promo/nov-29-teaser.mp4",
    poster: "/media/promo/nov-29-teaser.jpg",
    orientation: "landscape",
  },
];

/** Hero slideshow frames (home page). */
export const heroSlides = [
  { src: "/images/choir-main.jpg", position: "center 35%", caption: "Echoes of Praise · Nakuru" },
  { src: "/images/gallery/eop-02.jpg", position: "center 45%", caption: "In concert" },
  { src: "/images/gallery/eop-08.jpg", position: "center 55%", caption: "Lifting the sound" },
];
