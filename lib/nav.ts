import { BookOpen, CalendarDays, HeartHandshake, Home, PenLine } from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: typeof Home;
  /** 현재 경로가 이 항목에 속하는지 판별 */
  match: (pathname: string) => boolean;
};

export const navItems: NavItem[] = [
  { href: "/", label: "홈", icon: Home, match: (p) => p === "/" },
  { href: "/scripture", label: "오늘의 말씀", icon: BookOpen, match: (p) => p.startsWith("/scripture") },
  { href: "/write", label: "QT 작성", icon: PenLine, match: (p) => p.startsWith("/write") },
  { href: "/mate", label: "친구 QT", icon: HeartHandshake, match: (p) => p.startsWith("/mate") },
  { href: "/archive", label: "기록", icon: CalendarDays, match: (p) => p.startsWith("/archive") }
];
