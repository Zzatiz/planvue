"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import {
  IconLayoutGrid,
  IconChartBar,
  IconSettings,
  IconArrowLeft,
  IconMessageCircle,
} from "@tabler/icons-react";
import { motion } from "motion/react";

/* ================================================================
   TYPES
   ================================================================ */

type Tier = "Platinum" | "VIP" | "Gold" | "Silver" | "Bronze";
type OnlineStatus = "online" | "away" | "offline";
type RightPanel = "profile" | "notes" | "ppv" | "ai-reply" | "ai-ppv" | "ai-ideas" | "visualizer";
type TopView = "models" | "dashboard";

interface ModelAccount {
  id: string;
  name: string;
  handle: string;
  platform: string;
  avatar: string;
  gradient: string;
  status: "active" | "paused" | "onboarding";
  revenue: number;
  revenueChange: number;
  subscribers: number;
  activeChatters: string[];
  unreadCount: number;
  lastActivity: string;
  tier: string;
  fans: Fan[];
}

interface Fan {
  id: number;
  name: string;
  handle: string;
  tier: Tier;
  totalSpend: number;
  tips: number;
  subMonths: number;
  status: OnlineStatus;
  tags: string[];
  unread: number;
  chatter: string;
  lastMessage: string;
  score: number;
  renewalDate: string;
  fanvueId: string;
  atRisk: boolean;
  gradient: string;
}

interface Message {
  id: number;
  from: "fan" | "creator";
  text: string;
  time: string;
  hasGenButton?: boolean;
}

interface ReplyOption {
  label: string;
  text: string;
  intent: string;
}

interface PPVIdea {
  title: string;
  price: number;
  hook: string;
  reasoning: string;
}

interface ContentIdea {
  name: string;
  urgency: "high" | "medium";
  format: string;
  description: string;
  monetization: string;
}

/* ================================================================
   DATA
   ================================================================ */

const TIER_COLORS: Record<Tier, string> = {
  Platinum: "#e0c8ff",
  VIP: "#ffcf86",
  Gold: "#ffd700",
  Silver: "#c0c0d0",
  Bronze: "#cd7f5a",
};

const TIER_BG: Record<Tier, string> = {
  Platinum: "rgba(224,200,255,0.1)",
  VIP: "rgba(255,207,134,0.1)",
  Gold: "rgba(255,215,0,0.1)",
  Silver: "rgba(192,192,208,0.1)",
  Bronze: "rgba(205,127,90,0.1)",
};

const GRADIENTS = [
  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
];

const fansForSophia: Fan[] = [
  { id: 1, name: "Jessica M.", handle: "@jessm", tier: "VIP", totalSpend: 4820, tips: 34, subMonths: 8, status: "online", tags: ["big-tipper", "custom-content", "ppv-buyer"], unread: 3, chatter: "Alex", lastMessage: "please yes!! add dramatic lighting, moody shadows", score: 82, renewalDate: "Mar 14", fanvueId: "fv_jess_8821", atRisk: false, gradient: GRADIENTS[0] },
  { id: 2, name: "Tyler B.", handle: "@tylerb99", tier: "Gold", totalSpend: 2340, tips: 18, subMonths: 5, status: "online", tags: ["ppv-buyer", "engaged"], unread: 1, chatter: "Sofia", lastMessage: "when's the next drop? also champagne in the shot?", score: 68, renewalDate: "Apr 02", fanvueId: "fv_tyler_3302", atRisk: false, gradient: GRADIENTS[1] },
  { id: 3, name: "Marcus L.", handle: "@mlux", tier: "Platinum", totalSpend: 9100, tips: 67, subMonths: 14, status: "away", tags: ["whale", "big-tipper", "loyal", "custom-content"], unread: 0, chatter: "Alex", lastMessage: "infinity pool, golden hour, white swimsuit, sunglasses...", score: 96, renewalDate: "Feb 28", fanvueId: "fv_marcus_0014", atRisk: false, gradient: GRADIENTS[2] },
  { id: 4, name: "Daniel K.", handle: "@dkay", tier: "Silver", totalSpend: 890, tips: 7, subMonths: 2, status: "away", tags: ["lurker", "at-risk"], unread: 0, chatter: "Sofia", lastMessage: "hey", score: 24, renewalDate: "Feb 22", fanvueId: "fv_daniel_7745", atRisk: true, gradient: GRADIENTS[3] },
  { id: 5, name: "Ryan P.", handle: "@rp_fan", tier: "Gold", totalSpend: 3210, tips: 22, subMonths: 6, status: "offline", tags: ["ppv-buyer", "custom-content"], unread: 0, chatter: "Alex", lastMessage: "tropical forest vibe? waterfall, lush green, flowy sundress", score: 74, renewalDate: "Mar 20", fanvueId: "fv_ryan_5590", atRisk: false, gradient: GRADIENTS[4] },
  { id: 6, name: "Aiden S.", handle: "@aidens", tier: "Bronze", totalSpend: 420, tips: 3, subMonths: 1, status: "offline", tags: ["new", "low-engagement"], unread: 0, chatter: "Sofia", lastMessage: "welcome msg sent", score: 15, renewalDate: "Mar 10", fanvueId: "fv_aiden_1123", atRisk: false, gradient: GRADIENTS[5] },
];

const fansForAriel: Fan[] = [
  { id: 101, name: "Brandon T.", handle: "@brant", tier: "Platinum", totalSpend: 6800, tips: 52, subMonths: 11, status: "online", tags: ["whale", "loyal", "custom-content"], unread: 2, chatter: "Alex", lastMessage: "that cinematic reel was incredible, need more", score: 91, renewalDate: "Mar 05", fanvueId: "fv_bran_4410", atRisk: false, gradient: GRADIENTS[3] },
  { id: 102, name: "Megan R.", handle: "@megr_", tier: "VIP", totalSpend: 3100, tips: 28, subMonths: 7, status: "online", tags: ["ppv-buyer", "engaged"], unread: 1, chatter: "Sofia", lastMessage: "when is the next exclusive set dropping?", score: 76, renewalDate: "Apr 10", fanvueId: "fv_meg_2209", atRisk: false, gradient: GRADIENTS[0] },
  { id: 103, name: "Ethan W.", handle: "@ethw", tier: "Gold", totalSpend: 1450, tips: 11, subMonths: 3, status: "away", tags: ["ppv-buyer"], unread: 0, chatter: "Alex", lastMessage: "any behind the scenes content coming?", score: 55, renewalDate: "Mar 22", fanvueId: "fv_eth_8831", atRisk: false, gradient: GRADIENTS[4] },
];

const fansForLuna: Fan[] = [
  { id: 201, name: "Chris D.", handle: "@chrisd", tier: "VIP", totalSpend: 2200, tips: 19, subMonths: 4, status: "online", tags: ["engaged", "custom-content"], unread: 1, chatter: "Alex", lastMessage: "love the aesthetic of your latest set", score: 72, renewalDate: "Mar 18", fanvueId: "fv_chris_5501", atRisk: false, gradient: GRADIENTS[1] },
  { id: 202, name: "Sam K.", handle: "@samk_", tier: "Silver", totalSpend: 560, tips: 5, subMonths: 2, status: "offline", tags: ["at-risk"], unread: 0, chatter: "Sofia", lastMessage: "been busy lately", score: 31, renewalDate: "Feb 25", fanvueId: "fv_sam_9923", atRisk: true, gradient: GRADIENTS[5] },
];

const modelAccounts: ModelAccount[] = [
  {
    id: "sophia",
    name: "Sophia Valentine",
    handle: "@sophiaval",
    platform: "Fanvue",
    avatar: "SV",
    gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    status: "active",
    revenue: 20780,
    revenueChange: 18,
    subscribers: 847,
    activeChatters: ["Alex", "Sofia"],
    unreadCount: 4,
    lastActivity: "2m ago",
    tier: "Enterprise",
    fans: fansForSophia,
  },
  {
    id: "ariel",
    name: "Ariel Monroe",
    handle: "@arielm",
    platform: "Fanvue",
    avatar: "AM",
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    status: "active",
    revenue: 14320,
    revenueChange: 12,
    subscribers: 623,
    activeChatters: ["Alex", "Sofia"],
    unreadCount: 3,
    lastActivity: "5m ago",
    tier: "Enterprise",
    fans: fansForAriel,
  },
  {
    id: "luna",
    name: "Luna Ray",
    handle: "@lunaray",
    platform: "OnlyFans",
    avatar: "LR",
    gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    status: "active",
    revenue: 8940,
    revenueChange: -3,
    subscribers: 412,
    activeChatters: ["Alex"],
    unreadCount: 1,
    lastActivity: "12m ago",
    tier: "Pro",
    fans: fansForLuna,
  },
  {
    id: "maya",
    name: "Maya Chen",
    handle: "@mayac",
    platform: "Fanvue",
    avatar: "MC",
    gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    status: "paused",
    revenue: 3210,
    revenueChange: 0,
    subscribers: 189,
    activeChatters: ["Sofia"],
    unreadCount: 0,
    lastActivity: "2d ago",
    tier: "Pro",
    fans: [],
  },
  {
    id: "nova",
    name: "Nova Kim",
    handle: "@novak",
    platform: "OnlyFans",
    avatar: "NK",
    gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    status: "onboarding",
    revenue: 0,
    revenueChange: 0,
    subscribers: 0,
    activeChatters: [],
    unreadCount: 0,
    lastActivity: "New",
    tier: "Starter",
    fans: [],
  },
  {
    id: "jade",
    name: "Jade Torres",
    handle: "@jadet",
    platform: "Fanvue",
    avatar: "JT",
    gradient: "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
    status: "active",
    revenue: 6580,
    revenueChange: 8,
    subscribers: 334,
    activeChatters: ["Alex", "Sofia"],
    unreadCount: 2,
    lastActivity: "8m ago",
    tier: "Pro",
    fans: [],
  },
];

const conversations: Record<number, Message[]> = {
  1: [
    { id: 1, from: "creator", text: "hey babe! loved your comment on the last set -- you always know how to make me smile", time: "2:14 PM" },
    { id: 2, from: "fan", text: "of course!! your content is literally unreal. have you ever thought about doing a rooftop shoot?", time: "2:16 PM", hasGenButton: true },
    { id: 3, from: "creator", text: "you read my mind... I've actually been scouting locations. what vibe are you thinking?", time: "2:18 PM" },
    { id: 4, from: "fan", text: "like cinematic, city skyline at dusk, maybe silk dress flowing in the wind? very editorial", time: "2:21 PM", hasGenButton: true },
    { id: 5, from: "fan", text: "please yes!! add dramatic lighting, moody shadows", time: "2:23 PM", hasGenButton: true },
  ],
  2: [
    { id: 1, from: "fan", text: "hey! loved the last set, the lighting was insane", time: "11:30 AM" },
    { id: 2, from: "creator", text: "thank you babe!! that one took forever to get right but I'm obsessed with how it turned out", time: "11:45 AM" },
    { id: 3, from: "fan", text: "have you thought about doing a boudoir concept? like champagne, silk sheets, very luxe", time: "12:02 PM", hasGenButton: true },
    { id: 4, from: "fan", text: "when's the next drop? also champagne in the shot?", time: "12:15 PM", hasGenButton: true },
  ],
  3: [
    { id: 1, from: "fan", text: "I've been thinking about commissioning something really premium. infinity pool, golden hour, white swimsuit, sunglasses -- full editorial", time: "9:45 AM", hasGenButton: true },
    { id: 2, from: "creator", text: "Marcus... you always have the best concepts. I actually know the perfect location for this. let me put together some ideas", time: "10:02 AM" },
    { id: 3, from: "fan", text: "infinity pool, golden hour, white swimsuit, sunglasses...", time: "10:15 AM", hasGenButton: true },
  ],
  4: [
    { id: 1, from: "creator", text: "hey Daniel! thanks for subscribing -- let me know if there's anything you'd like to see", time: "3:00 PM" },
    { id: 2, from: "fan", text: "hey", time: "3:45 PM" },
  ],
  5: [
    { id: 1, from: "fan", text: "your outdoor content is incredible. have you thought about shooting in a tropical forest?", time: "4:00 PM", hasGenButton: true },
    { id: 2, from: "creator", text: "actually yes!! I've been dreaming about a waterfall shoot. nature + fashion editorial is so my thing", time: "4:15 PM" },
    { id: 3, from: "fan", text: "tropical forest vibe? waterfall, lush green, flowy sundress", time: "4:30 PM", hasGenButton: true },
  ],
  6: [
    { id: 1, from: "creator", text: "welcome to the page Aiden! so glad to have you here. let me know what kind of content you enjoy most!", time: "1:00 PM" },
    { id: 2, from: "fan", text: "thanks! just checking things out", time: "1:30 PM" },
  ],
  101: [
    { id: 1, from: "fan", text: "that cinematic reel was incredible, need more of that energy", time: "3:20 PM", hasGenButton: true },
    { id: 2, from: "creator", text: "you have no idea how much that means -- I spent 3 days on that one. more coming soon", time: "3:35 PM" },
    { id: 3, from: "fan", text: "take my money honestly. whatever you're planning next, I'm in", time: "3:42 PM" },
  ],
  102: [
    { id: 1, from: "fan", text: "when is the next exclusive set dropping?", time: "1:10 PM" },
    { id: 2, from: "creator", text: "this weekend! I've been working on something really special for VIP members", time: "1:25 PM" },
  ],
  103: [
    { id: 1, from: "fan", text: "any behind the scenes content coming?", time: "10:00 AM" },
    { id: 2, from: "creator", text: "actually yes -- just finished editing a BTS reel from last week's shoot", time: "10:20 AM" },
  ],
  201: [
    { id: 1, from: "fan", text: "love the aesthetic of your latest set", time: "5:00 PM" },
    { id: 2, from: "creator", text: "thank you so much! I was going for that vintage film look", time: "5:15 PM" },
  ],
  202: [
    { id: 1, from: "creator", text: "hey Sam! haven't seen you around lately -- everything good?", time: "11:00 AM" },
    { id: 2, from: "fan", text: "been busy lately", time: "2:30 PM" },
  ],
};

const replyOptions: Record<number, ReplyOption[]> = {
  1: [
    { label: "Tease", text: "omg you literally read my mind... I've been scouting the perfect rooftop all week. might have something very soon", intent: "Build anticipation without committing to timeline" },
    { label: "Convert", text: "I'm actually planning that exact shoot this weekend -- if you want early access before I post it, tip me and I'll send you the private set first", intent: "Direct conversion with exclusivity hook" },
    { label: "Deepen", text: "you have such good taste babe, seriously. tell me -- dramatic editorial or more intimate and moody? want to make sure it's perfect for you", intent: "Deepen engagement through personalization" },
  ],
  2: [
    { label: "Tease", text: "the champagne concept is literally *chef's kiss*... I may have already started planning something", intent: "Create FOMO and anticipation" },
    { label: "Convert", text: "next drop is this Friday! and yes -- champagne is 100% in the concept. want me to send you a sneak peek before it goes live?", intent: "Drive pre-purchase commitment" },
    { label: "Deepen", text: "love that you're thinking about the creative direction with me. boudoir x champagne is such a vibe -- silk or lace? help me decide", intent: "Co-creation engagement" },
  ],
};

const ppvIdeas: Record<number, PPVIdea[]> = {
  3: [
    { title: "Infinity Pool Editorial", price: 85, hook: "I shot something at golden hour today and immediately thought of you... this one's not going on the feed", reasoning: "He offered $200 for this exact concept -- high conversion probability" },
    { title: "Luxury Travel Series Vol.1", price: 120, hook: "first drop of something I've never done before -- very exclusive, very limited", reasoning: "Highest spender, editorial taste, responds to premium framing" },
    { title: "Custom Sunlit Set", price: 65, hook: "white, minimal, morning light -- made this one specifically for you", reasoning: "customContentAffinity high, personal framing converts" },
  ],
};

const contentIdeas: Record<number, ContentIdea[]> = {
  5: [
    { name: "Tropical Forest Escape", urgency: "high", format: "Photo Set", description: "Waterfall location, flowy sundress, natural light, adventurous editorial energy", monetization: "PPV at $45 with behind-scenes bonus" },
    { name: "Adventure Series", urgency: "medium", format: "Video", description: "Outdoor locations, movement-based, cinematic feel matching his aesthetic requests", monetization: "Subscription upsell + teaser clip" },
    { name: "Nature Editorial Vol.1", urgency: "medium", format: "Photo Set", description: "Lush greens, botanical styling, very high-fashion outdoor", monetization: "PPV bundle with Vol.2 pre-sell" },
  ],
};

/* ================================================================
   SMALL COMPONENTS
   ================================================================ */

function StatusDot({ status }: { status: OnlineStatus }) {
  const color = status === "online" ? "#4ade80" : status === "away" ? "#fbbf24" : "#5a5a7a";
  return (
    <span
      className="absolute bottom-0 right-0 w-[10px] h-[10px] rounded-full border-2"
      style={{ backgroundColor: color, borderColor: "#09090f" }}
    />
  );
}

function Avatar({ fan, size = 40 }: { fan: Fan; size?: number }) {
  const initials = fan.name.split(" ").map((n) => n[0]).join("");
  return (
    <span className="relative inline-flex shrink-0">
      <span
        className="flex items-center justify-center rounded-full font-semibold"
        style={{
          width: size,
          height: size,
          background: fan.gradient,
          color: TIER_COLORS[fan.tier],
          fontSize: size * 0.35,
        }}
      >
        {initials}
      </span>
      <StatusDot status={fan.status} />
    </span>
  );
}

function TierBadge({ tier }: { tier: Tier }) {
  return (
    <span
      className="text-[10px] font-semibold px-1.5 py-[1px] rounded"
      style={{ color: TIER_COLORS[tier], backgroundColor: TIER_BG[tier] }}
    >
      {tier}
    </span>
  );
}

function Tag({ label }: { label: string }) {
  const colorMap: Record<string, string> = {
    "big-tipper": "#fbbf24",
    "custom-content": "#c084fc",
    "ppv-buyer": "#e8a87c",
    whale: "#4ade80",
    loyal: "#4ade80",
    engaged: "#4ade80",
    lurker: "#f87171",
    "at-risk": "#f87171",
    new: "#8888aa",
    "low-engagement": "#f87171",
  };
  const c = colorMap[label] || "#8888aa";
  return (
    <span
      className="text-[10px] font-medium px-2 py-[2px] rounded-full"
      style={{ color: c, backgroundColor: `${c}15`, border: `1px solid ${c}30` }}
    >
      {label}
    </span>
  );
}

function ScoreRing({ score }: { score: number }) {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? "#4ade80" : score >= 50 ? "#fbbf24" : "#f87171";

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="110" height="110" viewBox="0 0 110 110">
        <circle cx="55" cy="55" r={radius} fill="none" stroke="#14141f" strokeWidth="6" />
        <circle
          cx="55" cy="55" r={radius} fill="none" stroke={color} strokeWidth="6"
          strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
          className="animate-score-ring"
          style={{ transformOrigin: "center", transform: "rotate(-90deg)" }}
        />
        <text x="55" y="55" textAnchor="middle" dominantBaseline="central" fill={color} fontSize="28" fontFamily="'DM Mono', monospace" fontWeight="500">
          {score}
        </text>
      </svg>
      <span className="text-[11px] text-text-secondary font-medium">Fan Score</span>
    </div>
  );
}

function Spinner() {
  return <span className="inline-block w-5 h-5 border-2 border-text-muted border-t-accent-warm rounded-full animate-spin-slow" />;
}

/* ================================================================
   GRID BACKGROUND
   ================================================================ */

function GridBackground({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex-1 w-full overflow-y-auto" style={{ backgroundColor: "#07070d" }}>
      <div
        className={cn("absolute inset-0")}
        style={{
          backgroundSize: "40px 40px",
          backgroundImage: "linear-gradient(to right, #0f0f1a 1px, transparent 1px), linear-gradient(to bottom, #0f0f1a 1px, transparent 1px)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at center, transparent 20%, #07070d 70%)",
        }}
      />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

/* ================================================================
   MAIN EXPORT
   ================================================================ */

export default function Planvue() {
  const [topView, setTopView] = useState<TopView>("models");
  const [activeModelId, setActiveModelId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activeModel = activeModelId ? modelAccounts.find((m) => m.id === activeModelId) : null;

  const handleSelectModel = useCallback((id: string) => {
    const model = modelAccounts.find((m) => m.id === id);
    if (model && model.fans.length > 0) {
      setActiveModelId(id);
    }
  }, []);

  const handleBackToModels = useCallback(() => {
    setActiveModelId(null);
    setTopView("models");
  }, []);

  const sidebarLinks = [
    {
      label: "Models",
      href: "#",
      icon: <IconLayoutGrid className="h-5 w-5 shrink-0" style={{ color: topView === "models" && !activeModelId ? "#e8a87c" : "#5a5a7a" }} />,
    },
    {
      label: "Dashboard",
      href: "#",
      icon: <IconChartBar className="h-5 w-5 shrink-0" style={{ color: topView === "dashboard" && !activeModelId ? "#e8a87c" : "#5a5a7a" }} />,
    },
    {
      label: "Settings",
      href: "#",
      icon: <IconSettings className="h-5 w-5 shrink-0" style={{ color: "#5a5a7a" }} />,
    },
  ];

  return (
    <div className="h-screen flex overflow-hidden" style={{ backgroundColor: "#07070d" }}>
      {/* Sidebar */}
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen}>
        <SidebarBody
          className="justify-between gap-10 border-r"
          style={{ backgroundColor: "#09090f", borderColor: "#14141f" }}
        >
          <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
            {sidebarOpen ? (
              <a href="#" className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal" onClick={(e) => { e.preventDefault(); handleBackToModels(); }}>
                <div className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm" style={{ background: "#e8a87c" }} />
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="font-semibold whitespace-pre tracking-tight"
                  style={{ fontFamily: "'Playfair Display', serif", color: "#e8a87c" }}
                >
                  planvue
                </motion.span>
              </a>
            ) : (
              <a href="#" className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal" onClick={(e) => { e.preventDefault(); handleBackToModels(); }}>
                <div className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm" style={{ background: "#e8a87c" }} />
              </a>
            )}
            <div className="mt-8 flex flex-col gap-1">
              {sidebarLinks.map((link, idx) => (
                <div
                  key={idx}
                  onClick={(e) => {
                    e.preventDefault();
                    if (link.label === "Models") { setActiveModelId(null); setTopView("models"); }
                    else if (link.label === "Dashboard") { setActiveModelId(null); setTopView("dashboard"); }
                  }}
                  className="cursor-pointer"
                >
                  <SidebarLink
                    link={link}
                    active={(link.label === "Models" && topView === "models" && !activeModelId) || (link.label === "Dashboard" && topView === "dashboard" && !activeModelId)}
                  />
                </div>
              ))}

              {/* Active model sessions */}
              {activeModelId && (
                <div className="mt-4 pt-4" style={{ borderTop: "1px solid #14141f" }}>
                  <div
                    onClick={(e) => { e.preventDefault(); handleBackToModels(); }}
                    className="cursor-pointer"
                  >
                    <SidebarLink
                      link={{
                        label: "Back to Models",
                        href: "#",
                        icon: <IconArrowLeft className="h-5 w-5 shrink-0" style={{ color: "#5a5a7a" }} />,
                      }}
                    />
                  </div>
                  <div className="cursor-pointer mt-1">
                    <SidebarLink
                      link={{
                        label: activeModel?.name || "",
                        href: "#",
                        icon: <IconMessageCircle className="h-5 w-5 shrink-0" style={{ color: "#e8a87c" }} />,
                      }}
                      active={true}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom user */}
          <div>
            <SidebarLink
              link={{
                label: "Rize Management",
                href: "#",
                icon: (
                  <span className="h-7 w-7 shrink-0 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ background: GRADIENTS[0] }}>
                    R
                  </span>
                ),
              }}
            />
          </div>
        </SidebarBody>
      </Sidebar>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {activeModelId && activeModel ? (
          <ModelInboxView model={activeModel} onBack={handleBackToModels} />
        ) : topView === "models" ? (
          <ModelsOverview models={modelAccounts} onSelectModel={handleSelectModel} />
        ) : (
          <AggregateDashboard models={modelAccounts} />
        )}
      </div>
    </div>
  );
}

/* ================================================================
   MODELS OVERVIEW (GRID)
   ================================================================ */

function ModelsOverview({ models, onSelectModel }: { models: ModelAccount[]; onSelectModel: (id: string) => void }) {
  const totalRevenue = models.reduce((a, m) => a + m.revenue, 0);
  const totalSubs = models.reduce((a, m) => a + m.subscribers, 0);
  const totalUnread = models.reduce((a, m) => a + m.unreadCount, 0);
  const activeCount = models.filter((m) => m.status === "active").length;

  return (
    <GridBackground>
      <div className="p-8 max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-[26px] font-semibold tracking-tight">Model Accounts</h1>
            <p className="text-[13px] text-text-muted mt-1">Manage all creator accounts from one workspace</p>
          </div>
          <div className="flex items-center gap-5">
            <div className="text-right">
              <div className="text-[9px] uppercase tracking-wider text-text-muted">Total Revenue</div>
              <div className="text-[16px] font-medium" style={{ fontFamily: "'DM Mono', monospace", color: "#4ade80" }}>${totalRevenue.toLocaleString()}</div>
            </div>
            <span className="w-px h-8" style={{ backgroundColor: "#1e1e2e" }} />
            <div className="text-right">
              <div className="text-[9px] uppercase tracking-wider text-text-muted">Subscribers</div>
              <div className="text-[16px] font-medium" style={{ fontFamily: "'DM Mono', monospace" }}>{totalSubs.toLocaleString()}</div>
            </div>
            <span className="w-px h-8" style={{ backgroundColor: "#1e1e2e" }} />
            <div className="text-right">
              <div className="text-[9px] uppercase tracking-wider text-text-muted">Unread</div>
              <div className="text-[16px] font-medium" style={{ fontFamily: "'DM Mono', monospace", color: "#e8a87c" }}>{totalUnread}</div>
            </div>
            <span className="w-px h-8" style={{ backgroundColor: "#1e1e2e" }} />
            <div className="text-right">
              <div className="text-[9px] uppercase tracking-wider text-text-muted">Active</div>
              <div className="text-[16px] font-medium" style={{ fontFamily: "'DM Mono', monospace" }}>{activeCount}/{models.length}</div>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-3 gap-4">
          {models.map((model) => (
            <button
              key={model.id}
              onClick={() => onSelectModel(model.id)}
              className="text-left rounded-xl p-5 transition-all group relative overflow-hidden"
              style={{ backgroundColor: "#09090f", border: "1px solid #14141f" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#1e1e2e"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#14141f"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              {/* Status indicator */}
              <div className="absolute top-4 right-4">
                <span
                  className="text-[9px] font-bold uppercase px-2 py-0.5 rounded"
                  style={{
                    backgroundColor: model.status === "active" ? "rgba(78,222,128,0.1)" : model.status === "paused" ? "rgba(251,191,36,0.1)" : "rgba(136,136,170,0.1)",
                    color: model.status === "active" ? "#4ade80" : model.status === "paused" ? "#fbbf24" : "#8888aa",
                  }}
                >
                  {model.status}
                </span>
              </div>

              {/* Avatar + Name */}
              <div className="flex items-center gap-3 mb-4">
                <span
                  className="w-12 h-12 rounded-full flex items-center justify-center text-[14px] font-bold text-white shrink-0"
                  style={{ background: model.gradient }}
                >
                  {model.avatar}
                </span>
                <div>
                  <div className="text-[15px] font-semibold">{model.name}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] text-text-muted">{model.handle}</span>
                    <span className="text-[10px] px-1.5 py-[1px] rounded" style={{ backgroundColor: "#0f0f1a", color: "#8888aa" }}>
                      {model.platform}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <div className="text-[9px] uppercase tracking-wider text-text-muted">Revenue</div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[16px] font-medium" style={{ fontFamily: "'DM Mono', monospace", color: model.revenue > 0 ? "#f0f0f8" : "#5a5a7a" }}>
                      ${model.revenue.toLocaleString()}
                    </span>
                    {model.revenueChange !== 0 && (
                      <span className="text-[10px] font-medium" style={{ color: model.revenueChange > 0 ? "#4ade80" : "#f87171" }}>
                        {model.revenueChange > 0 ? "+" : ""}{model.revenueChange}%
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-[9px] uppercase tracking-wider text-text-muted">Subscribers</div>
                  <span className="text-[16px] font-medium" style={{ fontFamily: "'DM Mono', monospace" }}>
                    {model.subscribers.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Bottom row */}
              <div className="flex items-center justify-between pt-3" style={{ borderTop: "1px solid #14141f" }}>
                <div className="flex items-center gap-2">
                  {model.activeChatters.map((name) => (
                    <span key={name} className="flex items-center gap-1">
                      <span className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white" style={{ background: name === "Alex" ? GRADIENTS[0] : GRADIENTS[1] }}>
                        {name[0]}
                      </span>
                      <span className="text-[10px] text-text-muted">{name}</span>
                    </span>
                  ))}
                  {model.activeChatters.length === 0 && <span className="text-[10px] text-text-muted">No chatters assigned</span>}
                </div>
                <div className="flex items-center gap-2">
                  {model.unreadCount > 0 && (
                    <span className="min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[10px] font-bold" style={{ backgroundColor: "#e8a87c", color: "#07070d" }}>
                      {model.unreadCount}
                    </span>
                  )}
                  <span className="text-[10px] text-text-muted">{model.lastActivity}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </GridBackground>
  );
}

/* ================================================================
   AGGREGATE DASHBOARD
   ================================================================ */

function AggregateDashboard({ models }: { models: ModelAccount[] }) {
  const totalRevenue = models.reduce((a, m) => a + m.revenue, 0);
  const activeModels = models.filter((m) => m.status === "active");

  const heatmapData = [
    { day: "Mon", hours: [0, 0, 1, 2, 3, 2, 1, 0, 0] },
    { day: "Tue", hours: [0, 1, 0, 1, 2, 1, 0, 0, 0] },
    { day: "Wed", hours: [1, 0, 2, 3, 2, 1, 1, 0, 0] },
    { day: "Thu", hours: [0, 0, 1, 1, 2, 3, 2, 1, 0] },
    { day: "Fri", hours: [0, 1, 2, 2, 3, 4, 3, 2, 1] },
    { day: "Sat", hours: [2, 3, 4, 5, 6, 5, 4, 3, 2] },
    { day: "Sun", hours: [1, 2, 3, 4, 5, 4, 3, 2, 1] },
  ];
  const hours = ["9 AM", "10 AM", "11 AM", "12 PM", "1 PM", "2 PM", "3 PM", "4 PM", "5 PM"];

  const efficiencyData = [
    { label: "Less than 1min", pct: 62, color: "#4ade80" },
    { label: "15min - 45min", pct: 22, color: "#fbbf24" },
    { label: "45min - 1hr", pct: 10, color: "#e8a87c" },
    { label: "More than 1hr", pct: 6, color: "#f87171" },
  ];

  const donutRadius = 55;
  const donutCircumference = 2 * Math.PI * donutRadius;
  let donutOffset = 0;

  return (
    <div className="flex-1 overflow-y-auto p-6" style={{ backgroundColor: "#07070d" }}>
      <div className="max-w-[1200px] mx-auto space-y-6">
        {/* Dashboard Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-semibold">Workload Dashboard</h1>
            <span className="text-[12px] text-text-muted">Aggregate view across all models -- data from up to 1 hour ago</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md text-[12px]" style={{ backgroundColor: "#0f0f1a", border: "1px solid #14141f", color: "#8888aa" }}>
              <span>Feb 1 -- Feb 19, 2026</span>
            </div>
            <div className="px-3 py-1.5 rounded-md text-[12px]" style={{ backgroundColor: "#0f0f1a", border: "1px solid #14141f", color: "#8888aa" }}>
              All Views
            </div>
            <div className="px-3 py-1.5 rounded-md text-[12px]" style={{ backgroundColor: "#0f0f1a", border: "1px solid #14141f", color: "#8888aa" }}>
              All teammates
            </div>
          </div>
        </div>

        {/* Aggregate Key Metrics */}
        <div className="grid grid-cols-4 gap-4">
          <div className="rounded-xl p-5" style={{ backgroundColor: "#09090f", border: "1px solid #14141f" }}>
            <div className="text-[11px] text-text-muted uppercase tracking-wider mb-1">Total Revenue</div>
            <div className="flex items-end gap-3">
              <span className="text-[28px] font-semibold leading-none" style={{ fontFamily: "'DM Mono', monospace", color: "#4ade80" }}>${totalRevenue.toLocaleString()}</span>
            </div>
          </div>
          <div className="rounded-xl p-5" style={{ backgroundColor: "#09090f", border: "1px solid #14141f" }}>
            <div className="text-[11px] text-text-muted uppercase tracking-wider mb-1">Active Models</div>
            <div className="flex items-end gap-3">
              <span className="text-[28px] font-semibold leading-none" style={{ fontFamily: "'DM Mono', monospace" }}>{activeModels.length}</span>
              <span className="text-[12px] text-text-muted mb-1">/ {models.length}</span>
            </div>
          </div>
          <div className="rounded-xl p-5" style={{ backgroundColor: "#09090f", border: "1px solid #14141f" }}>
            <div className="text-[11px] text-text-muted uppercase tracking-wider mb-1">Avg Reply Time</div>
            <div className="flex items-end gap-3">
              <span className="text-[28px] font-semibold leading-none" style={{ fontFamily: "'DM Mono', monospace" }}>3m</span>
              <span className="text-[12px] font-medium mb-1" style={{ color: "#4ade80" }}>+8%</span>
            </div>
          </div>
          <div className="rounded-xl p-5" style={{ backgroundColor: "#09090f", border: "1px solid #14141f" }}>
            <div className="text-[11px] text-text-muted uppercase tracking-wider mb-1">Total Subscribers</div>
            <div className="flex items-end gap-3">
              <span className="text-[28px] font-semibold leading-none" style={{ fontFamily: "'DM Mono', monospace" }}>{models.reduce((a, m) => a + m.subscribers, 0).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Per-Model Revenue Breakdown */}
        <div className="rounded-xl p-5" style={{ backgroundColor: "#09090f", border: "1px solid #14141f" }}>
          <div className="text-[12px] font-semibold mb-4">Revenue by Model</div>
          <div className="space-y-3">
            {models.filter((m) => m.revenue > 0).sort((a, b) => b.revenue - a.revenue).map((model) => (
              <div key={model.id} className="flex items-center gap-4">
                <span
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                  style={{ background: model.gradient }}
                >
                  {model.avatar}
                </span>
                <div className="w-28">
                  <div className="text-[12px] font-medium">{model.name}</div>
                  <div className="text-[10px] text-text-muted">{model.platform}</div>
                </div>
                <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ backgroundColor: "#14141f" }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${(model.revenue / totalRevenue) * 100}%`, background: model.gradient }}
                  />
                </div>
                <div className="w-24 text-right">
                  <span className="text-[13px] font-medium" style={{ fontFamily: "'DM Mono', monospace" }}>${model.revenue.toLocaleString()}</span>
                  {model.revenueChange !== 0 && (
                    <span className="text-[10px] ml-1.5" style={{ color: model.revenueChange > 0 ? "#4ade80" : "#f87171" }}>
                      {model.revenueChange > 0 ? "+" : ""}{model.revenueChange}%
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Workload Over Time */}
        <div className="rounded-xl p-5" style={{ backgroundColor: "#09090f", border: "1px solid #14141f" }}>
          <div className="text-[12px] font-semibold mb-4">Workload Over Time</div>
          <div className="h-[160px] flex items-end gap-1">
            {[3, 5, 2, 6, 4, 7, 5, 3, 8, 6, 4, 2, 5, 7, 4, 3, 6, 5, 4].map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-t transition-all"
                  style={{ height: `${(v / 8) * 120}px`, backgroundColor: "rgba(232,168,124,0.3)", borderTop: "2px solid #e8a87c" }}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-[9px] text-text-muted" style={{ fontFamily: "'DM Mono', monospace" }}>
            <span>Feb 1</span><span>Feb 5</span><span>Feb 10</span><span>Feb 15</span><span>Feb 19</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Business Hours Heatmap */}
          <div className="rounded-xl p-5" style={{ backgroundColor: "#09090f", border: "1px solid #14141f" }}>
            <div className="text-[12px] font-semibold mb-4">Busiest Times</div>
            <div className="space-y-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-12" />
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                  <span key={d} className="flex-1 text-center text-[9px] text-text-muted">{d}</span>
                ))}
              </div>
              {hours.map((hour, hi) => (
                <div key={hour} className="flex items-center gap-2">
                  <span className="w-12 text-[10px] text-text-muted text-right" style={{ fontFamily: "'DM Mono', monospace" }}>{hour}</span>
                  {heatmapData.map((day) => {
                    const val = day.hours[hi];
                    const opacity = val === 0 ? 0.05 : val / 6;
                    return (
                      <span
                        key={day.day + hi}
                        className="flex-1 h-6 rounded-sm flex items-center justify-center text-[9px]"
                        style={{
                          backgroundColor: `rgba(192,132,252,${opacity})`,
                          color: val > 0 ? "#c084fc" : "transparent",
                          fontFamily: "'DM Mono', monospace",
                        }}
                      >
                        {val}
                      </span>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Efficiency Donut */}
          <div className="rounded-xl p-5" style={{ backgroundColor: "#09090f", border: "1px solid #14141f" }}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[12px] font-semibold">Efficiency</span>
              <span className="text-[11px] text-text-muted">Reply time</span>
            </div>
            <div className="flex items-center gap-6">
              <div className="relative">
                <svg width="140" height="140" viewBox="0 0 140 140">
                  {efficiencyData.map((seg) => {
                    const segLength = (seg.pct / 100) * donutCircumference;
                    const currentOffset = donutOffset;
                    donutOffset += segLength;
                    return (
                      <circle
                        key={seg.label}
                        cx="70" cy="70" r={donutRadius} fill="none"
                        stroke={seg.color} strokeWidth="12"
                        strokeDasharray={`${segLength} ${donutCircumference - segLength}`}
                        strokeDashoffset={-currentOffset}
                        style={{ transformOrigin: "center", transform: "rotate(-90deg)" }}
                      />
                    );
                  })}
                  <text x="70" y="62" textAnchor="middle" fill="#f0f0f8" fontSize="11" fontFamily="'DM Sans'">Reply time (avg)</text>
                  <text x="70" y="82" textAnchor="middle" fill="#f0f0f8" fontSize="22" fontFamily="'DM Mono'" fontWeight="500">3m</text>
                </svg>
              </div>
              <div className="space-y-2.5">
                {efficiencyData.map((seg) => (
                  <div key={seg.label} className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
                    <span className="text-[11px] text-text-secondary">{seg.label}</span>
                    <span className="text-[11px] font-medium ml-auto" style={{ fontFamily: "'DM Mono', monospace" }}>{seg.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Team Performance */}
        <div className="rounded-xl p-5" style={{ backgroundColor: "#09090f", border: "1px solid #14141f" }}>
          <div className="text-[12px] font-semibold mb-4">Team Performance</div>
          <div className="space-y-3">
            {[
              { name: "Alex", convos: 42, avgReply: "2m", satisfaction: 94 },
              { name: "Sofia", convos: 38, avgReply: "4m", satisfaction: 91 },
            ].map((member) => (
              <div key={member.name} className="flex items-center gap-4 p-3 rounded-lg" style={{ backgroundColor: "#0f0f1a" }}>
                <span
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white"
                  style={{ background: member.name === "Alex" ? GRADIENTS[0] : GRADIENTS[1] }}
                >
                  {member.name[0]}
                </span>
                <span className="text-[13px] font-medium w-16">{member.name}</span>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-text-muted w-20">Conversations</span>
                    <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: "#14141f" }}>
                      <div className="h-full rounded-full" style={{ width: `${(member.convos / 50) * 100}%`, backgroundColor: "#e8a87c" }} />
                    </div>
                    <span className="text-[11px] w-8 text-right" style={{ fontFamily: "'DM Mono', monospace" }}>{member.convos}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-text-muted w-20">Avg Reply</span>
                    <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: "#14141f" }}>
                      <div className="h-full rounded-full" style={{ width: member.name === "Alex" ? "30%" : "50%", backgroundColor: "#4ade80" }} />
                    </div>
                    <span className="text-[11px] w-8 text-right" style={{ fontFamily: "'DM Mono', monospace" }}>{member.avgReply}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-text-muted w-20">Satisfaction</span>
                    <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: "#14141f" }}>
                      <div className="h-full rounded-full" style={{ width: `${member.satisfaction}%`, backgroundColor: "#c084fc" }} />
                    </div>
                    <span className="text-[11px] w-8 text-right" style={{ fontFamily: "'DM Mono', monospace" }}>{member.satisfaction}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   MODEL INBOX VIEW (Three-Panel CRM)
   ================================================================ */

function ModelInboxView({ model, onBack }: { model: ModelAccount; onBack: () => void }) {
  const [selectedFanId, setSelectedFanId] = useState(model.fans[0]?.id ?? 0);
  const [rightPanel, setRightPanel] = useState<RightPanel>("profile");
  const [searchQuery, setSearchQuery] = useState("");
  const [tierFilter, setTierFilter] = useState<Tier | "All">("All");
  const [inputValue, setInputValue] = useState("");
  const [showMassMessage, setShowMassMessage] = useState(false);
  const [massMessageSent, setMassMessageSent] = useState(false);
  const [massMessageTarget, setMassMessageTarget] = useState("All");
  const [massMessageText, setMassMessageText] = useState("");
  const [visualizerState, setVisualizerState] = useState<"loading" | "ready">("loading");
  const [msgs, setMsgs] = useState(conversations);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const fans = model.fans;
  const selectedFan = fans.find((f) => f.id === selectedFanId) || fans[0];
  const currentMessages = msgs[selectedFanId] || [];

  const filteredFans = useMemo(() => {
    return fans.filter((f) => {
      const matchesTier = tierFilter === "All" || f.tier === tierFilter;
      const matchesSearch = !searchQuery || f.name.toLowerCase().includes(searchQuery.toLowerCase()) || f.handle.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTier && matchesSearch;
    });
  }, [fans, tierFilter, searchQuery]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMessages, selectedFanId]);

  useEffect(() => {
    if (rightPanel === "visualizer") {
      setVisualizerState("loading");
      const timer = setTimeout(() => setVisualizerState("ready"), 2000);
      return () => clearTimeout(timer);
    }
  }, [rightPanel]);

  const handleSend = useCallback(() => {
    if (!inputValue.trim()) return;
    const newMsg: Message = {
      id: Date.now(),
      from: "creator",
      text: inputValue,
      time: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
    };
    setMsgs((prev) => ({ ...prev, [selectedFanId]: [...(prev[selectedFanId] || []), newMsg] }));
    setInputValue("");
  }, [inputValue, selectedFanId]);

  const selectFan = useCallback((id: number) => {
    setSelectedFanId(id);
    setRightPanel("profile");
  }, []);

  if (!selectedFan) return null;

  const totalRevenue = fans.reduce((a, f) => a + f.totalSpend, 0);
  const onlineCount = fans.filter((f) => f.status === "online").length;
  const atRiskCount = fans.filter((f) => f.atRisk).length;

  const tiers: (Tier | "All")[] = ["All", "Platinum", "VIP", "Gold", "Silver", "Bronze"];

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Model Header */}
      <header className="h-[52px] flex items-center justify-between px-5 border-b shrink-0" style={{ borderColor: "#14141f", backgroundColor: "#09090f" }}>
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-text-muted hover:text-text-primary transition-colors">
            <IconArrowLeft className="h-4 w-4" />
          </button>
          <span
            className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
            style={{ background: model.gradient }}
          >
            {model.avatar}
          </span>
          <div>
            <span className="text-[14px] font-semibold">{model.name}</span>
            <span className="text-[11px] text-text-muted ml-2">{model.handle}</span>
          </div>
          <span className="text-[10px] px-1.5 py-[1px] rounded ml-1" style={{ backgroundColor: "#0f0f1a", color: "#8888aa" }}>
            {model.platform}
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-medium ml-2" style={{ backgroundColor: "rgba(78,222,128,0.1)", color: "#4ade80", border: "1px solid rgba(78,222,128,0.2)" }}>
            DEMO MODE
          </span>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-5">
            <div className="text-right">
              <div className="text-[9px] uppercase tracking-wider text-text-muted">Revenue</div>
              <div className="text-[14px] font-medium" style={{ fontFamily: "'DM Mono', monospace", color: "#4ade80" }}>${totalRevenue.toLocaleString()}</div>
            </div>
            <div className="text-right">
              <div className="text-[9px] uppercase tracking-wider text-text-muted">Online</div>
              <div className="text-[14px] font-medium" style={{ fontFamily: "'DM Mono', monospace" }}>{onlineCount}</div>
            </div>
            <div className="text-right">
              <div className="text-[9px] uppercase tracking-wider text-text-muted">At Risk</div>
              <div className="text-[14px] font-medium" style={{ fontFamily: "'DM Mono', monospace", color: "#f87171" }}>{atRiskCount}</div>
            </div>
          </div>
          <span className="w-px h-6" style={{ backgroundColor: "#1e1e2e" }} />
          <div className="flex items-center gap-2">
            {model.activeChatters.map((name) => (
              <div key={name} className="flex items-center gap-1.5">
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white" style={{ background: name === "Alex" ? GRADIENTS[0] : GRADIENTS[1] }}>{name[0]}</span>
                <span className="w-[6px] h-[6px] rounded-full" style={{ backgroundColor: "#4ade80" }} />
                <span className="text-[11px] text-text-secondary">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Three-Panel Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT PANEL */}
        <div className="w-[260px] shrink-0 flex flex-col border-r" style={{ borderColor: "#14141f", backgroundColor: "#09090f" }}>
          <div className="p-3 space-y-2">
            <input
              type="text"
              placeholder="Search fans..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-8 rounded-md px-3 text-[12px] outline-none placeholder:text-text-muted"
              style={{ backgroundColor: "#0f0f1a", border: "1px solid #14141f", color: "#f0f0f8" }}
            />
            <div className="flex flex-wrap gap-1">
              {tiers.map((t) => (
                <button
                  key={t}
                  onClick={() => setTierFilter(t)}
                  className="px-2 py-[2px] rounded text-[10px] font-medium transition-colors"
                  style={{
                    backgroundColor: tierFilter === t ? (t === "All" ? "#1e1e2e" : `${TIER_COLORS[t as Tier]}15`) : "transparent",
                    color: tierFilter === t ? (t === "All" ? "#f0f0f8" : TIER_COLORS[t as Tier]) : "#5a5a7a",
                    border: `1px solid ${tierFilter === t ? (t === "All" ? "#1e1e2e" : `${TIER_COLORS[t as Tier]}30`) : "transparent"}`,
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredFans.map((fan) => (
              <button
                key={fan.id}
                onClick={() => selectFan(fan.id)}
                className="w-full text-left px-3 py-2.5 relative transition-colors"
                style={{ backgroundColor: selectedFanId === fan.id ? "#0f0f1a" : "transparent" }}
                onMouseEnter={(e) => { if (selectedFanId !== fan.id) e.currentTarget.style.backgroundColor = "#0c0c14"; }}
                onMouseLeave={(e) => { if (selectedFanId !== fan.id) e.currentTarget.style.backgroundColor = "transparent"; }}
              >
                {fan.atRisk && (
                  <span className="absolute top-2 right-3 w-[7px] h-[7px] rounded-full" style={{ backgroundColor: "#e8a87c" }} />
                )}
                <div className="flex items-start gap-2.5">
                  <Avatar fan={fan} size={36} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-medium text-text-primary truncate">{fan.name}</span>
                      {fan.unread > 0 && (
                        <span className="min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[10px] font-bold" style={{ backgroundColor: "#e8a87c", color: "#07070d" }}>
                          {fan.unread}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-text-muted">{fan.handle}</span>
                    <p className="text-[11px] text-text-secondary mt-0.5 truncate leading-snug">{fan.lastMessage}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <TierBadge tier={fan.tier} />
                      <span className="text-[10px] text-text-muted" style={{ fontFamily: "'DM Mono', monospace" }}>${fan.totalSpend.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="p-3 space-y-2 border-t" style={{ borderColor: "#14141f" }}>
            <button
              onClick={() => { setShowMassMessage(true); setMassMessageSent(false); }}
              className="w-full h-8 rounded-md text-[12px] font-semibold transition-colors"
              style={{ backgroundColor: "#e8a87c", color: "#07070d" }}
            >
              Mass Message
            </button>
            <button
              className="w-full h-8 rounded-md text-[12px] font-medium border transition-colors"
              style={{ borderColor: "#1e1e2e", color: "#8888aa", backgroundColor: "transparent" }}
            >
              Sync Platform
            </button>
          </div>
        </div>

        {/* CENTER PANEL */}
        <div className="flex-1 flex flex-col min-w-0" style={{ backgroundColor: "#07070d" }}>
          {/* Chat Header */}
          <div className="h-[56px] flex items-center justify-between px-4 border-b shrink-0" style={{ borderColor: "#14141f" }}>
            <div className="flex items-center gap-3">
              <Avatar fan={selectedFan} size={34} />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-semibold">{selectedFan.name}</span>
                  <span className="text-[11px] text-text-muted">{selectedFan.handle}</span>
                  <TierBadge tier={selectedFan.tier} />
                </div>
                <div className="flex items-center gap-3 text-[10px] text-text-muted" style={{ fontFamily: "'DM Mono', monospace" }}>
                  <span>{selectedFan.subMonths}mo</span>
                  <span>{selectedFan.tips} tips</span>
                  <span>-- {selectedFan.chatter}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {([
                { key: "ai-reply" as RightPanel, label: "Reply", prefix: "*", color: "#e8a87c" },
                { key: "ai-ppv" as RightPanel, label: "PPV", prefix: "+", color: "#c084fc" },
                { key: "ai-ideas" as RightPanel, label: "Ideas", prefix: "#", color: "#fbbf24" },
                { key: "visualizer" as RightPanel, label: "Visualize", prefix: "*", color: "#e8a87c" },
              ]).map(({ key, label, prefix, color }) => (
                <button
                  key={key}
                  onClick={() => setRightPanel(key)}
                  className="px-2.5 py-1 rounded text-[11px] font-medium transition-colors"
                  style={{
                    backgroundColor: rightPanel === key ? `${color}15` : "#0f0f1a",
                    color: rightPanel === key ? color : "#8888aa",
                    border: "1px solid #1e1e2e",
                  }}
                >
                  {prefix} {label}
                </button>
              ))}

              <span className="w-px h-5 mx-1" style={{ backgroundColor: "#1e1e2e" }} />

              {(["profile", "notes", "ppv"] as RightPanel[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setRightPanel(p)}
                  className="px-2 py-1 rounded text-[11px] font-medium capitalize transition-colors"
                  style={{
                    backgroundColor: rightPanel === p ? "#1e1e2e" : "transparent",
                    color: rightPanel === p ? "#f0f0f8" : "#5a5a7a",
                  }}
                >
                  {p === "ppv" ? "PPV" : p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
            {currentMessages.map((msg, i) => (
              <div
                key={msg.id}
                className={`flex ${msg.from === "creator" ? "justify-end" : "justify-start"} animate-fade-up`}
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <div className="max-w-[420px] relative group">
                  <div
                    className="px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed"
                    style={
                      msg.from === "creator"
                        ? { background: "linear-gradient(135deg, #e8a87c 0%, #d4916a 100%)", color: "#1a1008" }
                        : { backgroundColor: "#0f0f1a", color: "#f0f0f8", border: "1px solid #14141f" }
                    }
                  >
                    {msg.text}
                  </div>
                  <div className={`flex items-center gap-2 mt-1 ${msg.from === "creator" ? "justify-end" : "justify-start"}`}>
                    <span className="text-[10px] text-text-muted">{msg.time}</span>
                    {msg.hasGenButton && (
                      <button
                        onClick={() => setRightPanel("visualizer")}
                        className="text-[10px] font-medium px-1.5 py-[1px] rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ color: "#e8a87c", backgroundColor: "rgba(232,168,124,0.1)", border: "1px solid rgba(232,168,124,0.2)" }}
                      >
                        * gen
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Input Bar */}
          <div className="px-4 py-3 border-t" style={{ borderColor: "#14141f" }}>
            <div className="flex items-end gap-2 rounded-xl p-2" style={{ backgroundColor: "#0f0f1a", border: "1px solid #14141f" }}>
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={`Reply to ${selectedFan.name}...`}
                className="flex-1 bg-transparent outline-none text-[13px] text-text-primary placeholder:text-text-muted resize-none min-h-[36px] max-h-[100px] py-1.5 pl-2"
                rows={1}
              />
              <button
                onClick={handleSend}
                className="px-4 py-1.5 rounded-lg text-[12px] font-semibold shrink-0 transition-colors"
                style={{ backgroundColor: "#e8a87c", color: "#07070d" }}
              >
                Send
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="w-[280px] shrink-0 border-l overflow-hidden flex flex-col" style={{ borderColor: "#14141f", backgroundColor: "#09090f" }}>
          <RightPanelContent
            rightPanel={rightPanel}
            setRightPanel={setRightPanel}
            selectedFan={selectedFan}
            selectedFanId={selectedFanId}
            setInputValue={setInputValue}
            visualizerState={visualizerState}
            setVisualizerState={setVisualizerState}
          />
        </div>
      </div>

      {/* Mass Message Modal */}
      {showMassMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.7)" }}>
          <div className="w-[440px] rounded-xl p-5 space-y-4" style={{ backgroundColor: "#09090f", border: "1px solid #1e1e2e" }}>
            {massMessageSent ? (
              <div className="text-center py-8 space-y-3">
                <div className="text-[40px] text-accent-green font-light">Done</div>
                <div className="text-[14px] font-semibold" style={{ color: "#4ade80" }}>Message Sent Successfully</div>
                <p className="text-[12px] text-text-muted">
                  Broadcast sent to {massMessageTarget === "All" ? "all fans" : `${massMessageTarget} fans`}
                </p>
                <button
                  onClick={() => setShowMassMessage(false)}
                  className="px-4 py-1.5 rounded-md text-[12px] font-medium"
                  style={{ backgroundColor: "#1e1e2e", color: "#f0f0f8" }}
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-[14px] font-semibold">Mass Message</span>
                  <button onClick={() => setShowMassMessage(false)} className="text-text-muted text-[18px]">x</button>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-text-muted mb-2">Recipients</div>
                  <div className="flex flex-wrap gap-1.5">
                    {["All", "At-Risk", "Whales", "Platinum", "VIP", "Gold"].map((t) => (
                      <button
                        key={t}
                        onClick={() => setMassMessageTarget(t)}
                        className="px-2.5 py-1 rounded text-[11px] font-medium transition-colors"
                        style={{
                          backgroundColor: massMessageTarget === t ? "rgba(232,168,124,0.15)" : "#0f0f1a",
                          color: massMessageTarget === t ? "#e8a87c" : "#8888aa",
                          border: `1px solid ${massMessageTarget === t ? "rgba(232,168,124,0.3)" : "#14141f"}`,
                        }}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  value={massMessageText}
                  onChange={(e) => setMassMessageText(e.target.value)}
                  placeholder="Type your message..."
                  className="w-full h-28 rounded-lg p-3 text-[13px] outline-none resize-none placeholder:text-text-muted"
                  style={{ backgroundColor: "#0f0f1a", border: "1px solid #14141f", color: "#f0f0f8" }}
                />
                <button
                  onClick={() => setMassMessageSent(true)}
                  className="w-full py-2 rounded-md text-[13px] font-semibold"
                  style={{ backgroundColor: "#e8a87c", color: "#07070d" }}
                >
                  Send to {massMessageTarget}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ================================================================
   RIGHT PANEL CONTENT
   ================================================================ */

function RightPanelContent({
  rightPanel,
  setRightPanel,
  selectedFan,
  selectedFanId,
  setInputValue,
  visualizerState,
  setVisualizerState,
}: {
  rightPanel: RightPanel;
  setRightPanel: (p: RightPanel) => void;
  selectedFan: Fan;
  selectedFanId: number;
  setInputValue: (v: string) => void;
  visualizerState: "loading" | "ready";
  setVisualizerState: (v: "loading" | "ready") => void;
}) {
  if (rightPanel === "profile") {
    return (
      <div className="p-4 space-y-5 overflow-y-auto h-full">
        <div className="flex justify-center">
          <ScoreRing score={selectedFan.score} />
        </div>

        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Total Spend", value: `$${selectedFan.totalSpend.toLocaleString()}` },
            { label: "Tips", value: selectedFan.tips.toString() },
            { label: "Sub Months", value: selectedFan.subMonths.toString() },
            { label: "Renewal", value: selectedFan.renewalDate },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-lg p-2.5" style={{ backgroundColor: "#0f0f1a", border: "1px solid #14141f" }}>
              <div className="text-[9px] uppercase tracking-wider text-text-muted">{label}</div>
              <div className="text-[15px] font-medium mt-0.5" style={{ fontFamily: "'DM Mono', monospace" }}>{value}</div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 mb-2">
          <TierBadge tier={selectedFan.tier} />
          <span className="text-[11px] text-text-muted">Tier</span>
        </div>

        <div>
          <div className="text-[10px] uppercase tracking-wider text-text-muted mb-2">Behavioral Tags</div>
          <div className="flex flex-wrap gap-1.5">
            {selectedFan.tags.map((tag) => <Tag key={tag} label={tag} />)}
          </div>
        </div>

        <div>
          <div className="text-[10px] uppercase tracking-wider text-text-muted mb-1.5">Fanvue ID</div>
          <div className="text-[12px] text-text-muted" style={{ fontFamily: "'DM Mono', monospace" }}>{selectedFan.fanvueId}</div>
        </div>

        <div>
          <div className="text-[10px] uppercase tracking-wider text-text-muted mb-2">Quick Actions</div>
          <div className="space-y-1.5">
            {["PPV Offer", "Win-Back", "Upsell Custom"].map((action) => (
              <button
                key={action}
                onClick={() => {
                  const name = selectedFan.name.split(" ")[0];
                  const templates: Record<string, string> = {
                    "PPV Offer": `hey ${name}! I just finished something I think you'll love... want me to send you an exclusive preview?`,
                    "Win-Back": `hey ${name}!! I noticed you haven't been around as much and I miss you -- I've been working on some new content I think you'd really love...`,
                    "Upsell Custom": `${name} I've been thinking -- I know your taste so well at this point, want me to create something completely custom just for you?`,
                  };
                  setInputValue(templates[action] || "");
                }}
                className="w-full text-left px-3 py-2 rounded-md text-[11px] font-medium transition-colors"
                style={{ backgroundColor: "#0f0f1a", color: "#8888aa", border: "1px solid #14141f" }}
              >
                {action}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (rightPanel === "notes") {
    return (
      <div className="p-4 space-y-3 overflow-y-auto h-full">
        <div className="text-[12px] font-semibold text-text-primary">Notes</div>
        <div className="rounded-lg p-3 space-y-2" style={{ backgroundColor: "#0f0f1a", border: "1px solid #14141f" }}>
          <div className="text-[11px] text-text-secondary leading-relaxed">
            {selectedFan.name} prefers editorial-style content with dramatic lighting. Responds well to exclusivity framing. High conversion on custom sets.
          </div>
          <div className="text-[9px] text-text-muted">Last updated: Feb 18, 2026</div>
        </div>
        <textarea
          placeholder="Add a note..."
          className="w-full h-20 rounded-lg p-3 text-[12px] outline-none resize-none placeholder:text-text-muted"
          style={{ backgroundColor: "#0f0f1a", border: "1px solid #14141f", color: "#f0f0f8" }}
        />
      </div>
    );
  }

  if (rightPanel === "ppv") {
    return (
      <div className="p-4 space-y-3 overflow-y-auto h-full">
        <div className="text-[12px] font-semibold text-text-primary">PPV History</div>
        {[
          { title: "Rooftop Editorial", price: 55, date: "Feb 12", unlocked: true },
          { title: "Winter Collection", price: 40, date: "Jan 28", unlocked: true },
          { title: "Exclusive BTS", price: 25, date: "Jan 15", unlocked: false },
        ].map((item) => (
          <div key={item.title} className="rounded-lg p-3" style={{ backgroundColor: "#0f0f1a", border: "1px solid #14141f" }}>
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-medium">{item.title}</span>
              <span className="text-[12px] font-medium" style={{ fontFamily: "'DM Mono', monospace", color: "#4ade80" }}>${item.price}</span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-[10px] text-text-muted">{item.date}</span>
              <span className="text-[10px]" style={{ color: item.unlocked ? "#4ade80" : "#5a5a7a" }}>
                {item.unlocked ? "Unlocked" : "Pending"}
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (rightPanel === "ai-reply") {
    const options = replyOptions[selectedFanId] || replyOptions[1];
    return (
      <div className="p-4 space-y-3 overflow-y-auto h-full">
        <div className="text-[12px] font-semibold" style={{ color: "#e8a87c" }}>AI Reply Suggestions</div>
        {options.map((opt) => (
          <div key={opt.label} className="rounded-lg p-3 space-y-2" style={{ backgroundColor: "#0f0f1a", border: "1px solid #14141f" }}>
            <span className="text-[11px] font-semibold" style={{ color: "#e8a87c" }}>{opt.label}</span>
            <p className="text-[12px] text-text-primary leading-relaxed">{opt.text}</p>
            <p className="text-[10px] text-text-muted italic">{opt.intent}</p>
            <button
              onClick={() => setInputValue(opt.text)}
              className="text-[11px] font-semibold px-3 py-1 rounded-md transition-colors"
              style={{ backgroundColor: "rgba(232,168,124,0.1)", color: "#e8a87c", border: "1px solid rgba(232,168,124,0.2)" }}
            >
              Use
            </button>
          </div>
        ))}
        <button className="w-full text-center text-[11px] text-text-muted py-2 rounded-md" style={{ border: "1px solid #14141f" }}>Regenerate</button>
      </div>
    );
  }

  if (rightPanel === "ai-ppv") {
    const ideas = ppvIdeas[selectedFanId] || ppvIdeas[3];
    return (
      <div className="p-4 space-y-3 overflow-y-auto h-full">
        <div className="text-[12px] font-semibold" style={{ color: "#c084fc" }}>PPV Intelligence</div>
        {ideas.map((idea) => (
          <div key={idea.title} className="rounded-lg p-3 space-y-2" style={{ backgroundColor: "#0f0f1a", border: "1px solid #14141f" }}>
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-semibold text-text-primary">{idea.title}</span>
              <span className="text-[12px] font-bold" style={{ fontFamily: "'DM Mono', monospace", color: "#4ade80" }}>${idea.price}</span>
            </div>
            <p className="text-[12px] text-text-secondary leading-relaxed">{idea.hook}</p>
            <p className="text-[10px] text-text-muted italic">{idea.reasoning}</p>
            <button
              onClick={() => setInputValue(idea.hook)}
              className="text-[11px] font-semibold px-3 py-1 rounded-md transition-colors"
              style={{ backgroundColor: "rgba(192,132,252,0.1)", color: "#c084fc", border: "1px solid rgba(192,132,252,0.2)" }}
            >
              Send hook
            </button>
          </div>
        ))}
        <button className="w-full text-center text-[11px] text-text-muted py-2 rounded-md" style={{ border: "1px solid #14141f" }}>Regenerate</button>
      </div>
    );
  }

  if (rightPanel === "ai-ideas") {
    const ideas = contentIdeas[selectedFanId] || contentIdeas[5];
    return (
      <div className="p-4 space-y-3 overflow-y-auto h-full">
        <div className="text-[12px] font-semibold" style={{ color: "#fbbf24" }}>Content Concepts</div>
        {ideas.map((idea) => (
          <div key={idea.name} className="rounded-lg p-3 space-y-2" style={{ backgroundColor: "#0f0f1a", border: "1px solid #14141f" }}>
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-semibold text-text-primary">{idea.name}</span>
              <span
                className="text-[9px] font-bold uppercase px-1.5 py-[1px] rounded"
                style={{
                  backgroundColor: idea.urgency === "high" ? "rgba(248,113,113,0.1)" : "rgba(251,191,36,0.1)",
                  color: idea.urgency === "high" ? "#f87171" : "#fbbf24",
                }}
              >
                {idea.urgency}
              </span>
              <span className="text-[9px] px-1.5 py-[1px] rounded" style={{ backgroundColor: "#1e1e2e", color: "#8888aa" }}>{idea.format}</span>
            </div>
            <p className="text-[12px] text-text-secondary leading-relaxed">{idea.description}</p>
            <p className="text-[10px] text-text-muted">{idea.monetization}</p>
          </div>
        ))}
        <button className="w-full text-center text-[11px] text-text-muted py-2 rounded-md" style={{ border: "1px solid #14141f" }}>Regenerate</button>
      </div>
    );
  }

  if (rightPanel === "visualizer") {
    return (
      <div className="p-4 space-y-3 overflow-y-auto h-full">
        <div className="text-[12px] font-semibold" style={{ color: "#e8a87c" }}>Visual Preview</div>
        {visualizerState === "loading" ? (
          <div className="rounded-xl flex flex-col items-center justify-center py-20" style={{ backgroundColor: "#0f0f1a", border: "1px solid #14141f" }}>
            <Spinner />
            <span className="text-[12px] text-text-muted mt-3">Generating preview...</span>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="relative rounded-xl overflow-hidden" style={{ aspectRatio: "3/4" }}>
              <img
                src="https://picsum.photos/seed/planvue/400/533"
                alt="AI generated preview"
                className="w-full h-full object-cover"
              />
              <span className="absolute top-2 right-2 text-[9px] font-bold px-2 py-0.5 rounded" style={{ backgroundColor: "rgba(232,168,124,0.9)", color: "#07070d" }}>
                AI Preview
              </span>
            </div>
            <p className="text-[11px] text-text-muted italic leading-relaxed">
              "Dramatic rooftop editorial at dusk, city skyline backdrop, silk dress catching wind, moody cinematic lighting with warm highlights"
            </p>
            <div className="flex gap-1.5">
              <button
                onClick={() => { setVisualizerState("loading"); setTimeout(() => setVisualizerState("ready"), 2000); }}
                className="flex-1 text-[11px] font-medium py-1.5 rounded-md"
                style={{ backgroundColor: "#0f0f1a", color: "#8888aa", border: "1px solid #1e1e2e" }}
              >
                Regenerate
              </button>
              <button className="flex-1 text-[11px] font-medium py-1.5 rounded-md" style={{ backgroundColor: "#0f0f1a", color: "#8888aa", border: "1px solid #1e1e2e" }}>
                New variation
              </button>
            </div>
            <button className="w-full text-[11px] font-semibold py-1.5 rounded-md" style={{ backgroundColor: "rgba(232,168,124,0.1)", color: "#e8a87c", border: "1px solid rgba(232,168,124,0.2)" }}>
              Send teaser
            </button>
          </div>
        )}
      </div>
    );
  }

  return null;
}
