import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const COGNITIVE_CATEGORIES = [
  { id: 'clarity', labelEN: 'Conceptual Clarity', labelBN: 'ধারণাগত স্পষ্টতা' },
  { id: 'spatial', labelEN: 'Spatial Reasoning', labelBN: 'স্থানিক যুক্তি' },
  { id: 'causeEffect', labelEN: 'Cause & Effect', labelBN: 'কার্যকারণ সম্পর্ক' },
  { id: 'formulas', labelEN: 'Formula Application', labelBN: 'সূত্র প্রয়োগ' }
];

const DOMAINS = [
  { id: 'physics', labelEN: 'Physics', labelBN: 'পদার্থবিজ্ঞান' },
  { id: 'chemistry', labelEN: 'Chemistry', labelBN: 'রসায়ন' },
  { id: 'eee', labelEN: 'Electrical Eng (EEE)', labelBN: 'তড়িৎ প্রকৌশল (EEE)' },
  { id: 'oceanography', labelEN: 'Oceanography', labelBN: 'মহাসাগরবিজ্ঞান' }
];

const CELL_DETAILS = {
  'physics-clarity': {
    score: 52,
    conceptEN: "Decoupling mass and weight in zero-gravity environments.",
    conceptBN: "শূন্য মহাকর্ষে ভর ও ওজনের পার্থক্যকরণ।",
    descEN: "Students consistently assume that when gravity goes to zero, the object's mass also becomes zero, meaning they expect zero inertial resistance during collisions.",
    descBN: "শিক্ষার্থীরা ধরে নেয় যে মহাকর্ষ শূন্য হলে বস্তুর ভরও শূন্য হয়ে যায়, যার অর্থ তারা সংঘর্ষের সময় শূন্য জড়তা প্রতিরোধ আশা করে।",
    students: ["student-3a1b", "student-9f8d", "student-2c4e", "student-6k7a", "student-1s2t"],
    remedialEN: "Prompts student to trigger a collision between a massive probe and light debris in zero-gravity, demonstrating inertia is independent of gravity.",
    remedialBN: "শিক্ষার্থীকে শূন্য-মহাকর্ষে ভারী প্রোব ও হালকা ধ্বংসাবশেষের মধ্যে সংঘর্ষ ঘটাতে উদ্বুদ্ধ করা হয়, যা দেখায় যে জড়তা মহাকর্ষের ওপর নির্ভরশীল নয়।"
  },
  'physics-spatial': {
    score: 78,
    conceptEN: "Orbits and planetary trajectory visualization.",
    conceptBN: "কক্ষপথ এবং গ্রহের গতিপথের দৃশ্যমানকরণ।",
    descEN: "Students show strong spatial awareness of stable orbital velocities and distance relations, but occasionally underestimate acceleration changes.",
    descBN: "শিক্ষার্থীরা স্থিতিশীল কক্ষপথের বেগ এবং দূরত্বের সম্পর্কের শক্তিশালী স্থানিক ধারণা প্রদর্শন করে, তবে মাঝে মাঝে ত্বরণের পরিবর্তনগুলো বুঝতে ভুল করে।",
    students: ["student-5y2u", "student-7w8x"],
    remedialEN: "Interactive velocity vector overlay enabled inside the 3D Keplerian simulator.",
    remedialBN: "৩ডি কেপলারিয়ান সিমুলেটরের মধ্যে ইন্টারেক্টিভ বেগ ভেক্টর ওভারলে সক্রিয় করা হয়েছে।"
  },
  'physics-causeEffect': {
    score: 45,
    conceptEN: "Kinetic velocity reactions under negative time dilation.",
    conceptBN: "ঋণাত্মক সময় বিস্তারণে গতিশীল বেগের প্রতিক্রিয়া।",
    descEN: "Students fail to connect time scaling factors to force vector magnitudes, confusing instant deceleration with reverse momentum.",
    descBN: "শিক্ষার্থীরা টাইম স্কেলিং ফ্যাক্টরকে বল ভেক্টরের মানের সাথে মেলাতে পারছে না, তাৎক্ষণিক মন্থরতাকে বিপরীত ভরবেগের সাথে গুলিয়ে ফেলছে।",
    students: ["student-1k4m", "student-8u9t", "student-3r5c", "student-2p9z"],
    remedialEN: "Auto-trigger Socratic prompt: 'If time runs at 0.1x speed, does the total energy transferred during impact change?'",
    remedialBN: "স্বয়ংক্রিয় সক্রেটিক প্রম্পট: 'সময় যদি ০.১ গুণ গতিতে চলে, তবে সংঘর্ষের সময় স্থানান্তরিত মোট শক্তির কোনো পরিবর্তন হবে কি?'"
  },
  'physics-formulas': {
    score: 60,
    conceptEN: "Newtonian inverse-square gravity calculation.",
    conceptBN: "নিউটনের বিপরীত-বর্গ মহাকর্ষীয় হিসাবনিকাশ।",
    descEN: "General understanding is moderate; students struggle with quadratic decay profiles when scaling distance to orbit centers.",
    descBN: "সাধারণ ধারণা মাঝারি; কক্ষপথের কেন্দ্র থেকে দূরত্বের দ্বিগুণ হ্রাসের সম্পর্ক মেলাতে শিক্ষার্থীরা হিমশিম খাচ্ছে।",
    students: ["student-6h7j", "student-1k3b", "student-9u4m"],
    remedialEN: "Enable live numerical graph comparing Distance vs Force ($F_g \\propto 1/r^2$) dynamically.",
    remedialBN: "দূরত্ব বনাম বল ($F_g \\propto 1/r^2$) তুলনা করে একটি লাইভ সংখ্যাসূচক গ্রাফ সক্রিয় করা হয়েছে।"
  },
  'chemistry-clarity': {
    score: 82,
    conceptEN: "Covalent bonds and electron sharing mechanics.",
    conceptBN: "সমযোজী বন্ধন এবং ইলেকট্রন ভাগাভাগির মেকানিক্স।",
    descEN: "Strong conceptual understanding across all student groups. Electronegativity visual representations show clear learning outcomes.",
    descBN: "সব শিক্ষার্থীর মধ্যে শক্তিশালী ধারণাগত স্পষ্টতা রয়েছে। তড়িৎ-ঋণাত্মকতার দৃশ্যমান উপস্থাপনা স্পষ্ট শিক্ষণ ফলপ্রসূ করছে।",
    students: ["student-2c8m"],
    remedialEN: "No intervention needed. Concept mastered.",
    remedialBN: "কোনো সংশোধনী ব্যবস্থার প্রয়োজন নেই। ধারণাটি আয়ত্ত হয়েছে।"
  },
  'chemistry-spatial': {
    score: 71,
    conceptEN: "3D molecular geometry and bonding angles.",
    conceptBN: "৩ডি আণবিক জ্যামিতি এবং বন্ধন কোণ।",
    descEN: "Good overall. A few students confuse tetrahedral spacing when molecules are viewed under manual rotation.",
    descBN: "সামগ্রিকভাবে ভালো। কিছু শিক্ষার্থী ম্যানুয়াল ঘূর্ণনের সময় চতুস্তলকীয় স্থানবিন্যাস বুঝতে ভুল করে।",
    students: ["student-4r5e", "student-9b2u"],
    remedialEN: "Highlight valence shell electron pair repulsion (VSEPR) geometry vectors in the 3D viewer.",
    remedialBN: "৩ডি ভিউয়ারে ভ্যালেন্স শেল ইলেকট্রন জোড় বিকর্ষণ (VSEPR) জ্যামিতিক ভেক্টরগুলো চিহ্নিত করা হয়েছে।"
  },
  'chemistry-causeEffect': {
    score: 88,
    conceptEN: "Activation energy barriers vs catalyst additions.",
    conceptBN: "সক্রিয়করণ শক্তি বাধা বনাম অনুঘটক সংযোজন।",
    descEN: "Excellent grasp of reaction rates and energy transformations. The live reaction curve effectively resolves confusion.",
    descBN: "বিক্রিয়ার হার এবং শক্তির রূপান্তরের চমৎকার ধারণা। লাইভ বিক্রিয়া রেখা সফলভাবে বিভ্রান্তি দূর করছে।",
    students: [],
    remedialEN: "No intervention needed. Concept mastered.",
    remedialBN: "কোনো সংশোধনী ব্যবস্থার প্রয়োজন নেই। ধারণাটি আয়ত্ত হয়েছে।"
  },
  'chemistry-formulas': {
    score: 75,
    conceptEN: "Balancing stoichiometry equations in real-time.",
    conceptBN: "রিয়েল-টাইমে স্টোইকিওমেট্রি সমীকরণ সমতাকরণ।",
    descEN: "Satisfactory performance. A minority of students struggle with double displacement equilibrium coefficients.",
    descBN: "সন্তোষজনক পারফরম্যান্স। কিছু শিক্ষার্থী দ্বিপাক্ষিক প্রতিস্থাপন বিক্রিয়ার সাম্যাবস্থার সহগ মেলাতে সমস্যায় পড়ছে।",
    students: ["student-5a7s"],
    remedialEN: "Provide visual balancing block scale representing molar mass ratios.",
    remedialBN: "মোলার ভরের অনুপাত নির্দেশকারী একটি দৃশ্যমান সমতা নির্ণয় ব্লক স্কেল সরবরাহ করা হয়েছে।"
  },
  'eee-clarity': {
    score: 65,
    conceptEN: "Ohm's law and current loop conservation.",
    conceptBN: "ওহমের সূত্র এবং তড়িৎ বর্তনী সংরক্ষণ।",
    descEN: "Some students still assume voltage exists independent of circuit completion, treating open switches as active potential reservoirs.",
    descBN: "কিছু শিক্ষার্থী এখনও মনে করে যে বর্তনী পূর্ণ হওয়া ছাড়াও ভোল্টেজ বিদ্যমান থাকে, খোলা সুইচকে সক্রিয় বিভব আধার হিসেবে বিবেচনা করে।",
    students: ["student-1a4s", "student-9w8k", "student-3d4f"],
    remedialEN: "Socratic AI prompt: 'If the switch is open, does charge continue to accumulate at the contact points? Let's trace the field.'",
    remedialBN: "সক্রেটিক এআই প্রম্পট: 'সুইচ খোলা থাকলে কি সংযোগস্থলে আধান জমা হতে থাকে? আসুন তড়িৎক্ষেত্রটি চিহ্নিত করি।'"
  },
  'eee-spatial': {
    score: 80,
    conceptEN: "Alternating current sine wave generation.",
    conceptBN: "পরিবর্তী প্রবাহ (AC) সাইন তরঙ্গ তৈরি।",
    descEN: "Strong performance. Visual 3D wave interference patterns help students grasp phase shifting concepts instantly.",
    descBN: "চমৎকার পারফরম্যান্স। ৩ডি তরঙ্গ ব্যতিচার প্যাটার্ন শিক্ষার্থীদের দশা পরিবর্তনের ধারণা তাৎক্ষণিকভাবে বুঝতে সাহায্য করে।",
    students: [],
    remedialEN: "No intervention needed. Concept mastered.",
    remedialBN: "কোনো সংশোধনী ব্যবস্থার প্রয়োজন নেই। ধারণাটি আয়ত্ত হয়েছে।"
  },
  'eee-causeEffect': {
    score: 62,
    conceptEN: "Inductance back-EMF spikes under transient switches.",
    conceptBN: "ক্ষণস্থায়ী সুইচে আবিষ্ট তড়িৎচালক বলের (back-EMF) স্পাইক।",
    descEN: "Moderate gaps. Students overlook magnetic field collapse dynamics, expecting current to decay smoothly rather than spike.",
    descBN: "মাঝারি ঘাটতি। শিক্ষার্থীরা চৌম্বক ক্ষেত্রের আকস্মিক বিলুপ্তি ভুলে যায়, ফলে কারেন্ট স্পাইকের বদলে মসৃণভাবে হ্রাস পাবে বলে আশা করে।",
    students: ["student-6q7w", "student-4v8b"],
    remedialEN: "Enable inductive spark visualizer and voltage spike indicator warning.",
    remedialBN: "আবেশীয় স্পার্ক ভিজ্যুয়ালাইজার এবং ভোল্টেজ স্পাইক সূচক সতর্কবার্তা সক্রিয় করা হয়েছে।"
  },
  'eee-formulas': {
    score: 55,
    conceptEN: "Impedance vector summation in RLC circuits.",
    conceptBN: "RLC বর্তনীতে প্রতিবন্ধকতা (impedance) ভেক্টর সমষ্টি।",
    descEN: "High error rates. Students add resistance and reactance algebraically ($R + X_L + X_C$) instead of vectorially (using phasor Pythagoras).",
    descBN: "উচ্চ ভুলের হার। শিক্ষার্থীরা ভেক্টরের বদলে বীজগাণিতিকভাবে প্রতিবন্ধকতা যোগ করছে ($R + X_L + X_C$)।",
    students: ["student-1x8z", "student-2y9x", "student-7a4m", "student-3d2k"],
    remedialEN: "Interactive phasor triangle geometry overlay turned on for RLC configurations.",
    remedialBN: "RLC বর্তনীর জন্য ইন্টারেক্টিভ ফেজর ত্রিভুজ জ্যামিতিক ওভারলে সক্রিয় করা হয়েছে।"
  },
  'oceanography-clarity': {
    score: 48,
    conceptEN: "Archimedes buoyancy and water density dynamics.",
    conceptBN: "আর্কিমিডিসের প্লবতা এবং পানির ঘনত্বের গতিশীলতা।",
    descEN: "Critical understanding gaps. Students conflate salinity with viscosity, expecting salty water to slow down sinking rate rather than increase buoyancy.",
    descBN: "গুরুতর ঘাটতি। শিক্ষার্থীরা লবণাক্ততাকে সান্দ্রতার সাথে গুলিয়ে ফেলছে, লবণাক্ত পানি প্লবতা বাড়ানোর পরিবর্তে ডুবন্ত গতি ধীর করবে বলে আশা করে।",
    students: ["student-9a2f", "student-8c3v", "student-1k4l", "student-6y2u", "student-3p5q"],
    remedialEN: "Diving simulation auto-intervention: force vectors $F_b$ and $F_g$ dynamically scale in real-time, highlighting density calculations.",
    remedialBN: "ডাইভিং সিমুলেশন হস্তক্ষেপ: বল ভেক্টর $F_b$ এবং $F_g$ রিয়েল-টাইমে পরিবর্তিত হয়ে ঘনত্ব গণনা প্রদর্শন করে।"
  },
  'oceanography-spatial': {
    score: 69,
    conceptEN: "Ocean temperature thermocline depth layers.",
    conceptBN: "মহাসাগরের তাপমাত্রা থার্মোক্লাইন গভীরতা স্তর।",
    descEN: "Acceptable performance. Most students identify boundaries between Sunlight and Twilight zones but confuse thermal transmission rates.",
    descBN: "সন্তোষজনক পারফরম্যান্স। অধিকাংশ শিক্ষার্থী সানলাইট ও টোয়াইলাইট জোনের সীমানা বুঝলেও তাপ সঞ্চালনের হার গুলিয়ে ফেলে।",
    students: ["student-4h8u", "student-1j3n"],
    remedialEN: "Depth-dependent color saturation filters and interactive gradient scale.",
    remedialBN: "গভীরতা-নির্ভর রঙের স্যাচুরেশন ফিল্টার এবং ইন্টারেক্টিভ গ্রেডিয়েন্ট স্কেল।"
  },
  'oceanography-causeEffect': {
    score: 50,
    conceptEN: "Hydrostatic pressure impact on buoyancy volumes.",
    conceptBN: "প্লবতা আয়তনে তরল পদার্থের চাপের প্রভাব।",
    descEN: "Low understanding. Students assume rigid capsule volume remains invariant, failing to see how pressure compresses air chambers.",
    descBN: "কম ধারণা। শিক্ষার্থীরা ধরে নেয় ক্যাপসুলের আয়তন অপরিবর্তিত থাকে, ফলে চাপ কীভাবে বায়ু প্রকোष्ठকে সংকুচিত করে তা লক্ষ্য করতে ব্যর্থ হয়।",
    students: ["student-7x9u", "student-2b5d", "student-3m1k", "student-6w2p"],
    remedialEN: "Enable capsule compression animation showing volumetric change at deeper bathypelagic layers.",
    remedialBN: "গভীর বাথিপেলাজিক স্তরে ক্যাপসুলের আয়তন সংকোচন প্রদর্শনকারী অ্যানিমেশন চালু করা হয়েছে।"
  },
  'oceanography-formulas': {
    score: 63,
    conceptEN: "Buoyancy net-force equation calculations.",
    conceptBN: "নিট প্লবতা বলের সমীকরণ গণনা।",
    descEN: "Students handle calculation inputs well but struggle when applying dynamic mass changes under changing temperature profiles.",
    descBN: "শিক্ষার্থীরা হিসাবনিকাশ ভালো করলেও পরিবর্তনশীল তাপমাত্রায় গতিশীল ভরের পরিবর্তন প্রয়োগ করতে গিয়ে সমস্যায় পড়ে।",
    students: ["student-2c3f", "student-9o8i"],
    remedialEN: "Display live equation overlay: $F_{net} = (\\rho_{water} \\cdot V - m) \\cdot g$ during diving.",
    remedialBN: "ডাইভিংয়ের সময় সমীকরণের লাইভ ওভারলে প্রদর্শন: $F_{net} = (\\rho_{water} \\cdot V - m) \\cdot g$।"
  }
};

export default function FacultyScreen({ onBack, lang }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCell, setSelectedCell] = useState('physics-clarity');
  const [colorblindMode, setColorblindMode] = useState(false);
  const [isAlertInspected, setIsAlertInspected] = useState(false);

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/faculty/summary`)
      .then(r => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then(data => {
        setSummary(data);
        setLoading(false);
      })
      .catch(() => {
        setSummary(MOCK_FACULTY_DATA);
        setLoading(false);
      });
  }, []);

  const data = summary?.topMisconceptions || MOCK_FACULTY_DATA.topMisconceptions;
  const total = summary?.totalSessions || MOCK_FACULTY_DATA.totalSessions;
  const recentSessions = summary?.recentSessions || MOCK_FACULTY_DATA.recentSessions;

  const texts = {
    EN: {
      back: "← Back",
      title: "Faculty Analytics Portal",
      sessionsCard: "Total Class Sessions",
      activeCard: "Active Students",
      scoreCard: "Avg Concept Clarity",
      chartTitle: "Misconception Frequencies",
      loading: "Loading Analytics...",
      colorblindBtn: "Colorblind Mode",
      heatmapTitle: "Classwide Concept Mastery Heat Map",
      heatmapSub: "Cross-referencing scientific domains with cognitive dimensions. Click a cell to inspect details.",
      alertHeader: "LIVE CLUSTER DETECTED",
      alertTitle: "Systemic Misconception Alert: Mass vs. Weight Conflation",
      alertMsg: "82% of students in recent Gravity Lab sessions demonstrated a critical confusion regarding mass remaining constant when gravity acceleration changes.",
      alertAction: "✨ Socratic AI has auto-generated and assigned an enhanced remedial pathway to affected profiles.",
      btnInspect: "Inspect Remedial Pathway",
      btnCloseInspect: "Close Pathway Details",
      detailsPlaceholder: "Select any cell in the matrix above to drill down into active misconception traces, student identifiers, and automated Socratic interventions.",
      cellConcept: "Target Concept",
      cellDesc: "Observed Behavior & Gap",
      cellRemedial: "AI Remedial Intervention",
      cellStudents: "Flagged Student Session IDs",
      recentTitle: "Verifiable Blockchain Session Ledger Logs",
      recentSubtitle: "Anonymized learning sessions registered to local ledger state."
    },
    BN: {
      back: "← ফেরত যান",
      title: "ফ্যাকাল্টি অ্যানালিটিক্স পোর্টাল",
      sessionsCard: "মোট সেশন সংখ্যা",
      activeCard: "সক্রিয় শিক্ষার্থী",
      scoreCard: "গড় ধারণা স্পষ্টতা",
      chartTitle: "ভুল ধারণার ফ্রিকোয়েন্সি",
      loading: "অ্যানালিটিক্স লোড হচ্ছে...",
      colorblindBtn: "কালারব্লাইন্ড মোড",
      heatmapTitle: "শ্রেণীভিত্তিক ধারণা দক্ষতা হিটম্যাপ",
      heatmapSub: "বিজ্ঞান ডোমেন এবং জ্ঞানীয় মাত্রার মধ্যে তুলনা। বিস্তারিত দেখতে যেকোনো ঘরে ক্লিক করুন।",
      alertHeader: "সরাসরি ক্লাস্টার অ্যালার্ট",
      alertTitle: "পদ্ধতিগত ভুল ধারণা অ্যালার্ট: ভর বনাম ওজনের বিভ্রান্তি",
      alertMsg: "৮২% শিক্ষার্থী সাম্প্রতিক মহাকর্ষ ল্যাব সেশনে মহাকর্ষের পরিবর্তনে ভরের অপরিবর্তিত থাকার বিষয়টি নিয়ে জটিল বিভ্রান্তি দেখিয়েছে।",
      alertAction: "✨ সক্রেটিক এআই স্বয়ংক্রিয়ভাবে একটি সংশোধনী শিক্ষণ পদ্ধতি তৈরি করে শিক্ষার্থীদের প্রোফাইলে যুক্ত করেছে।",
      btnInspect: "সংশোধনী পদ্ধতি পরীক্ষা করুন",
      btnCloseInspect: "বিস্তারিত বন্ধ করুন",
      detailsPlaceholder: "সক্রিয় ভুল ধারণার উৎস, শিক্ষার্থীদের আইডি এবং স্বয়ংক্রিয় সক্রেটিক হস্তক্ষেপের বিবরণ দেখতে উপরের ম্যাট্রিক্সের যেকোনো ঘর নির্বাচন করুন।",
      cellConcept: "নির্দিষ্ট ধারণা",
      cellDesc: "পর্যবেক্ষিত আচরণ ও দুর্বলতা",
      cellRemedial: "এআই সংশোধনী হস্তক্ষেপ",
      cellStudents: "চিহ্নিত শিক্ষার্থী সেশন আইডি সমূহ",
      recentTitle: "যাচাইযোগ্য ব্লকচেন সেশন লেজার লগ",
      recentSubtitle: "স্থানীয় লেজার স্টেটে নিবন্ধিত বেনামী শিক্ষণ সেশন।"
    }
  };

  const t = texts[lang] || texts.EN;

  const getCellColor = (score) => {
    if (colorblindMode) {
      if (score >= 75) return 'rgba(59, 130, 246, 0.8)'; // High: Vibrant Blue
      if (score >= 60) return 'rgba(245, 158, 11, 0.8)'; // Mid: Amber
      return 'rgba(236, 72, 153, 0.8)'; // Low: Pink/Magenta
    } else {
      if (score >= 75) return 'rgba(16, 185, 129, 0.85)'; // High: Emerald
      if (score >= 60) return 'rgba(217, 119, 6, 0.85)'; // Mid: Dark Amber
      return 'rgba(239, 68, 68, 0.85)'; // Low: Red
    }
  };

  const getCellIcon = (score) => {
    if (score >= 75) return '✓';
    if (score >= 60) return '⚠';
    return '✗';
  };

  const selectedDetails = selectedCell ? CELL_DETAILS[selectedCell] : null;
  const [rowId, colId] = selectedCell ? selectedCell.split('-') : [];
  const selectedRow = selectedCell ? DOMAINS.find(d => d.id === rowId) : null;
  const selectedCol = selectedCell ? COGNITIVE_CATEGORIES.find(c => c.id === colId) : null;

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#030308', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa' }}>
        {t.loading}
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'radial-gradient(circle at center, #09091e 0%, #030308 100%)', 
      padding: '32px 24px', 
      fontFamily: 'sans-serif',
      color: '#e2e8f0',
      boxSizing: 'border-box'
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: '32px',
        borderBottom: '1px solid rgba(59, 130, 246, 0.1)',
        paddingBottom: '16px',
        maxWidth: '1200px',
        margin: '0 auto 32px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            onClick={onBack} 
            style={{ 
              background: 'rgba(30, 41, 59, 0.5)', 
              border: '1px solid rgba(59, 130, 246, 0.2)', 
              color: '#94a3b8', 
              padding: '8px 16px', 
              borderRadius: '10px', 
              cursor: 'pointer', 
              fontSize: '13px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(30, 41, 59, 0.5)'}
          >
            {t.back}
          </button>
          <h1 style={{ color: 'white', margin: 0, fontSize: '22px', fontWeight: 600 }}>
            {t.title}
          </h1>
        </div>

        {/* Header Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => setColorblindMode(!colorblindMode)}
            style={{
              background: colorblindMode ? 'rgba(59, 130, 246, 0.25)' : 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '20px',
              color: colorblindMode ? '#93c5fd' : '#94a3b8',
              padding: '6px 14px',
              fontSize: '11px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            🎨 {colorblindMode ? 'High-Contrast ON' : t.colorblindBtn}
          </button>
          <div style={{ fontSize: '12px', color: '#64748b' }}>
            {lang === 'EN' ? 'Accredited Portal: Daffodil' : 'স্বীকৃত পোর্টাল: ড্যাফোডিল'}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
        
        {/* Systemic Misconception Alert Banner */}
        <div style={{
          background: 'rgba(239, 68, 68, 0.04)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 4px 20px rgba(239, 68, 68, 0.08)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Animated Glowing Beacon */}
          <div style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: '#ef4444',
            boxShadow: '0 0 10px #ef4444'
          }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{
              background: 'rgba(239, 68, 68, 0.15)',
              color: '#f87171',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              padding: '3px 8px',
              borderRadius: '12px',
              fontSize: '10px',
              fontWeight: 'bold',
              letterSpacing: '0.05em',
              width: 'fit-content'
            }}>
              ⚠️ {t.alertHeader}
            </span>
            <h3 style={{ margin: '4px 0 0', color: '#fca5a5', fontSize: '16px', fontWeight: 600 }}>
              {t.alertTitle}
            </h3>
            <p style={{ margin: '4px 0', fontSize: '13px', color: '#cbd5e1', lineHeight: 1.5 }}>
              {t.alertMsg}
            </p>
            <p style={{ margin: '2px 0 10px', fontSize: '13px', color: '#34d399', fontWeight: 500 }}>
              {t.alertAction}
            </p>

            <div>
              <button
                onClick={() => setIsAlertInspected(!isAlertInspected)}
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '8px',
                  color: '#fca5a5',
                  padding: '6px 14px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
              >
                {isAlertInspected ? t.btnCloseInspect : t.btnInspect}
              </button>
            </div>
          </div>

          {/* Socratic Dialogue Pathway Preview Drawer */}
          {isAlertInspected && (
            <div style={{
              marginTop: '16px',
              paddingTop: '16px',
              borderTop: '1px dashed rgba(239, 68, 68, 0.2)',
              fontSize: '13px',
              color: '#d1d5db'
            }}>
              <strong style={{ display: 'block', color: 'white', marginBottom: '8px' }}>
                {lang === 'EN' ? '✨ Dynamic Socratic Remedial Dialogue Pathway:' : '✨ গতিশীল সক্রেটিক সংশোধনী সংলাপ পথ:'}
              </strong>
              <div style={{
                background: '#09050d',
                borderRadius: '10px',
                padding: '14px',
                border: '1px solid rgba(239, 68, 68, 0.15)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div>
                  <span style={{ color: '#f87171', fontWeight: 600 }}>[AI Prompt]</span>:{" "}
                  <em>"{lang === 'EN' ? 'If you doubled the mass of this ball, what do you think would happen to how fast it falls?' : 'যদি আপনি এই বলের ভর দ্বিগুণ করেন, তবে এটি কত দ্রুত পড়বে বলে আপনি মনে করেন?'}"</em>
                </div>
                <div>
                  <span style={{ color: '#94a3b8', fontWeight: 600 }}>[Student Misconception Trigger]</span>:{" "}
                  <em>"{lang === 'EN' ? 'It will fall twice as fast because double gravity pulls it harder.' : 'এটি দ্বিগুণ দ্রুত পড়বে কারণ দ্বিগুণ মহাকর্ষ একে বেশি জোরে আকর্ষণ করবে।'}"</em>
                </div>
                <div>
                  <span style={{ color: '#10b981', fontWeight: 600 }}>[AI Socratic Intersect]</span>:{" "}
                  <em>"{lang === 'EN' ? 'Let\'s put it to the test. Switch to Earth gravity, configure the mass to 10kg, and trigger a drop. Now reduce the mass to 1kg and trigger a drop. Check the falling times in the telemetry. What do you observe?' : 'আসুন এটি পরীক্ষা করি। পৃথিবীর মাধ্যাকর্ষণ নির্বাচন করুন, ভর ১০ কেজি দিয়ে ড্রপ করুন। এবার ভর কমিয়ে ১ কেজি করে আবার ড্রপ করুন। টেলিম্যাট্রিতে পতনের সময়কাল লক্ষ্য করুন। আপনি কী দেখতে পেলেন?'}"</em>
                </div>
                <div>
                  <span style={{ color: '#10b981', fontWeight: 600 }}>[AI Consolidation]</span>:{" "}
                  <em>"{lang === 'EN' ? 'Excellent! If both objects fall in exactly the same amount of time, how does mass affect falling velocity in a vacuum?' : 'চমৎকার! দুটি বস্তুই যদি হুবহু একই সময়ে পতিত হয়, তবে শূন্যস্থানে পতনের বেগের ওপর ভর কীভাবে প্রভাব ফেলছে?'}"</em>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* KPI Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {[
            { label: t.sessionsCard, value: total, color: '#3b82f6' },
            { label: t.activeCard, value: Math.ceil(total * 0.75), color: '#10b981' },
            { label: t.scoreCard, value: '62 / 100', color: '#8b5cf6' }
          ].map(card => (
            <div 
              key={card.label} 
              style={{ 
                background: 'rgba(15, 23, 42, 0.65)', 
                borderRadius: '16px', 
                padding: '24px', 
                border: '1px solid rgba(59, 130, 246, 0.15)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
              }}
            >
              <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 8px', fontWeight: 500, letterSpacing: '0.05em' }}>
                {card.label}
              </p>
              <p style={{ color: card.color, fontSize: '32px', fontWeight: 700, margin: 0 }}>
                {card.value}
              </p>
            </div>
          ))}
        </div>

        {/* Main Section Grid: Left Heatmap & Right Chart */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px', lgGridTemplateColumns: '1.2fr 0.8fr' }}>
          
          {/* Left Column: Heat Map Card */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(16px)',
            borderRadius: '20px',
            padding: '24px',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
          }}>
            <h3 style={{ margin: '0 0 6px', color: 'white', fontSize: '17px', fontWeight: 600 }}>
              {t.heatmapTitle}
            </h3>
            <p style={{ margin: '0 0 20px', fontSize: '13px', color: '#94a3b8' }}>
              {t.heatmapSub}
            </p>

            {/* 4x4 Grid Heatmap Component */}
            <div style={{ overflowX: 'auto', marginBottom: '24px' }}>
              <div style={{ minWidth: '600px' }}>
                {/* Column Headers */}
                <div style={{ display: 'grid', gridTemplateColumns: '130px repeat(4, 1fr)', gap: '10px', marginBottom: '10px' }}>
                  <div /> {/* Top-left empty spacer */}
                  {COGNITIVE_CATEGORIES.map(col => (
                    <div 
                      key={col.id} 
                      style={{ 
                        textAlign: 'center', 
                        fontSize: '11px', 
                        fontWeight: 600, 
                        color: '#94a3b8', 
                        padding: '4px',
                        lineHeight: 1.3
                      }}
                    >
                      {lang === 'EN' ? col.labelEN : col.labelBN}
                    </div>
                  ))}
                </div>

                {/* Rows Grid */}
                {DOMAINS.map(row => (
                  <div 
                    key={row.id} 
                    style={{ 
                      display: 'grid', 
                      gridTemplateColumns: '130px repeat(4, 1fr)', 
                      gap: '10px', 
                      alignItems: 'center',
                      marginBottom: '10px'
                    }}
                  >
                    {/* Row Header */}
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#f1f5f9' }}>
                      {lang === 'EN' ? row.labelEN : row.labelBN}
                    </div>

                    {/* Cells */}
                    {COGNITIVE_CATEGORIES.map(col => {
                      const cellId = `${row.id}-${col.id}`;
                      const detail = CELL_DETAILS[cellId];
                      const isSelected = selectedCell === cellId;
                      const cellColor = getCellColor(detail.score);
                      const icon = getCellIcon(detail.score);

                      return (
                        <div
                          key={col.id}
                          onClick={() => setSelectedCell(cellId)}
                          style={{
                            background: cellColor,
                            borderRadius: '10px',
                            padding: '16px 8px',
                            cursor: 'pointer',
                            textAlign: 'center',
                            transition: 'all 0.2s ease',
                            border: isSelected ? '2px solid white' : '2px solid transparent',
                            boxShadow: isSelected 
                              ? `0 0 15px ${cellColor}` 
                              : '0 4px 6px rgba(0,0,0,0.1)',
                            transform: isSelected ? 'scale(1.03)' : 'none'
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.filter = 'brightness(1.15)';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.filter = 'none';
                          }}
                        >
                          <div style={{ color: 'white', fontSize: '18px', fontWeight: 700 }}>
                            {detail.score}%
                          </div>
                          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)', marginTop: '4px', fontWeight: 'bold' }}>
                            {icon} {detail.score >= 75 ? 'Mastery' : detail.score >= 60 ? 'Review' : 'Critical'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Selected Cell Pedagogical Inspector Panel */}
            <div style={{
              background: 'rgba(10, 15, 30, 0.6)',
              borderRadius: '12px',
              border: '1px solid rgba(59, 130, 246, 0.25)',
              padding: '20px',
              minHeight: '120px'
            }}>
              {selectedCell && selectedDetails ? (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                    <h4 style={{ margin: 0, fontSize: '15px', color: 'white', fontWeight: 600 }}>
                      {lang === 'EN' ? selectedRow.labelEN : selectedRow.labelBN} &middot; {lang === 'EN' ? selectedCol.labelEN : selectedCol.labelBN}
                    </h4>
                    <span style={{
                      background: getCellColor(selectedDetails.score),
                      color: 'white',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: 'bold'
                    }}>
                      {selectedDetails.score}% {lang === 'EN' ? 'Mastery' : 'দক্ষতা'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                      <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '3px' }}>
                        {t.cellConcept}
                      </span>
                      <span style={{ fontSize: '13px', color: '#cbd5e1' }}>
                        {lang === 'EN' ? selectedDetails.conceptEN : selectedDetails.conceptBN}
                      </span>
                    </div>

                    <div>
                      <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '3px' }}>
                        {t.cellDesc}
                      </span>
                      <span style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: 1.5, display: 'block' }}>
                        {lang === 'EN' ? selectedDetails.descEN : selectedDetails.descBN}
                      </span>
                    </div>

                    <div>
                      <span style={{ fontSize: '11px', color: '#34d399', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '3px' }}>
                        {t.cellRemedial}
                      </span>
                      <span style={{ fontSize: '13px', color: '#a7f3d0', fontStyle: 'italic', display: 'block', lineHeight: 1.4 }}>
                        {lang === 'EN' ? selectedDetails.remedialEN : selectedDetails.remedialBN}
                      </span>
                    </div>

                    {selectedDetails.students.length > 0 && (
                      <div>
                        <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                          {t.cellStudents}
                        </span>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {selectedDetails.students.map(id => (
                            <span 
                              key={id}
                              style={{
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                borderRadius: '4px',
                                padding: '3px 8px',
                                fontSize: '11px',
                                color: '#94a3b8',
                                fontFamily: 'monospace'
                              }}
                            >
                              {id}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '24px 0', color: '#64748b', fontSize: '13px' }}>
                  {t.detailsPlaceholder}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Chart & Blockchain Logs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Chart Card */}
            <div style={{ 
              background: 'rgba(15, 23, 42, 0.65)', 
              backdropFilter: 'blur(16px)',
              borderRadius: '20px', 
              padding: '24px', 
              border: '1px solid rgba(59, 130, 246, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
            }}>
              <h3 style={{ margin: '0 0 20px', color: '#cbd5e1', fontSize: '15px', fontWeight: 600, letterSpacing: '0.05em' }}>
                {t.chartTitle}
              </h3>
              
              <div style={{ width: '100%', height: '240px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data} layout="vertical" margin={{ left: 5, right: 10, top: 0, bottom: 0 }}>
                    <XAxis type="number" stroke="#475569" tick={{ fill: '#64748b', fontSize: 10 }} />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      stroke="#475569"
                      tick={{ fill: '#94a3b8', fontSize: 10 }} 
                      width={120} 
                    />
                    <Tooltip
                      contentStyle={{ 
                        background: '#09091e', 
                        border: '1px solid rgba(59, 130, 246, 0.3)', 
                        borderRadius: '10px', 
                        color: 'white', 
                        fontSize: '11px' 
                      }}
                      cursor={{ fill: 'rgba(59, 130, 246, 0.03)' }}
                    />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                      {data.map((_, i) => (
                        <Cell key={i} fill={['#3b82f6','#6366f1','#8b5cf6','#a855f7','#d946ef'][i % 5]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Blockchain Session Logs Card */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.65)', 
              backdropFilter: 'blur(16px)',
              borderRadius: '20px', 
              padding: '24px', 
              border: '1px solid rgba(59, 130, 246, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
            }}>
              <h3 style={{ margin: '0 0 4px', color: 'white', fontSize: '15px', fontWeight: 600 }}>
                {t.recentTitle}
              </h3>
              <p style={{ margin: '0 0 16px', fontSize: '11px', color: '#64748b' }}>
                {t.recentSubtitle}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '230px', overflowY: 'auto', paddingRight: '4px' }}>
                {recentSessions.map((session, idx) => (
                  <div key={idx} style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    fontSize: '12px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ color: '#60a5fa', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '10px' }}>
                        {session.domain}
                      </span>
                      <span style={{ color: '#64748b', fontSize: '10px' }}>
                        {new Date(session.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <div style={{ color: '#e2e8f0', fontWeight: 500, fontSize: '11px', marginBottom: '4px' }}>
                      {session.misconceptionType}
                    </div>
                    <div style={{ fontFamily: 'monospace', fontSize: '9px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span>✓ BLOCK REGISTERED</span>
                      <span style={{ color: '#64748b' }}>
                        (ID: {Math.random().toString(36).substring(2, 8).toUpperCase()})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

const MOCK_FACULTY_DATA = {
  totalSessions: 47,
  topMisconceptions: [
    { name: 'Mass vs weight confusion', count: 18 },
    { name: 'Inertia misunderstood', count: 12 },
    { name: 'Force causes motion', count: 9 },
    { name: 'Ohm\'s law confusion', count: 5 },
    { name: 'Buoyancy misconception', count: 3 }
  ],
  recentSessions: [
    { domain: 'physics', misconceptionType: 'Mass vs weight confusion', createdAt: new Date(Date.now() - 1800000) },
    { domain: 'oceanography', misconceptionType: 'Buoyancy misconception', createdAt: new Date(Date.now() - 3600000) },
    { domain: 'eee', misconceptionType: 'Ohm\'s law confusion', createdAt: new Date(Date.now() - 7200000) }
  ]
};
