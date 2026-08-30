import {
  Bell,
  BookOpen,
  CalendarDays,
  Compass,
  Fish,
  HeartHandshake,
  Home,
  PenLine,
  Search,
  ShieldCheck,
  UserRound,
  Waves
} from "lucide-react";

export type PageKey =
  | "home"
  | "scripture"
  | "workspace"
  | "mate"
  | "archive"
  | "journey"
  | "notifications"
  | "profile"
  | "admin";

export const navItems = [
  { key: "home", label: "홈", icon: Home },
  { key: "scripture", label: "오늘의 말씀", icon: BookOpen },
  { key: "workspace", label: "QT 작성", icon: PenLine },
  { key: "mate", label: "친구 QT", icon: HeartHandshake },
  { key: "archive", label: "기록", icon: CalendarDays }
] satisfies Array<{ key: PageKey; label: string; icon: typeof Home }>;

export const secondaryNavItems = [
  { key: "journey", label: "나의 바다", icon: Fish },
  { key: "notifications", label: "알림", icon: Bell },
  { key: "profile", label: "마이페이지", icon: UserRound },
  { key: "admin", label: "Admin", icon: ShieldCheck }
] satisfies Array<{ key: PageKey; label: string; icon: typeof Home }>;

export const mobileNav = navItems;

export const scripture = {
  date: "2026.08.30",
  reference: "미가 6:6-8",
  title: "주님께서 구하시는 것",
  highlight: "오직 정의를 행하며 인자를 사랑하며 겸손하게 네 하나님과 함께 행하는 것이 아니냐",
  text:
    "내가 무엇을 가지고 여호와 앞에 나아가며 높으신 하나님께 경배할까. 번제물로 일 년 된 송아지를 가지고 그 앞에 나아갈까. 여호와께서 네게 구하시는 것은 오직 정의를 행하며 인자를 사랑하며 겸손하게 네 하나님과 함께 행하는 것이 아니냐."
};

export const qtQuestions = [
  "오늘 말씀에서 가장 마음에 남는 구절은 무엇인가요?",
  "하나님이 오늘 나에게 무엇을 말씀하시는 것 같나요?",
  "오늘 내가 실천할 한 가지는 무엇인가요?",
  "오늘의 기도"
];

export const statusCards = [
  { label: "오늘 QT", value: "작성 중", tone: "bg-ocean-100 text-ocean-800" },
  { label: "친구 QT", value: "잠금", tone: "bg-lavender/20 text-ocean-900" },
  { label: "최근 기록", value: "5개", tone: "bg-white text-ocean-800" }
];

export const history = [
  { date: "2026.08.30", reference: "미가 6:6-8", status: "오늘 QT", complete: true },
  { date: "2026.08.29", reference: "시편 23:1-6", status: "친구 QT", complete: true },
  { date: "2026.08.28", reference: "로마서 8:28", status: "저장됨", complete: true },
  { date: "2026.08.27", reference: "요한일서 4:19", status: "묵상", complete: false },
  { date: "2026.08.26", reference: "고린도전서 13:4", status: "저장됨", complete: true }
];

export const notifications = [
  "지수님이 오늘 QT를 완료했어요.",
  "지수님이 나의 QT에 공감했어요.",
  "오늘은 함께 QT 하는 날이에요."
];

export const quickActions = [
  { label: "QT 작성하기", icon: PenLine, page: "workspace" as PageKey },
  { label: "친구 QT", icon: HeartHandshake, page: "mate" as PageKey },
  { label: "기록 보기", icon: Search, page: "archive" as PageKey }
];

export const weekDays = ["월", "화", "수", "목", "금", "토", "일"];

export const growthMilestones = [
  ["1일", "물방울"],
  ["3일", "작은 물고기"],
  ["7일", "해초"],
  ["14일", "새로운 물고기"],
  ["30일", "산호"],
  ["50일", "새 지형"],
  ["100일", "Ocean Theme"]
];

export const WavesIcon = Waves;
