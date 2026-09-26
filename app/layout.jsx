import { Nanum_Myeongjo, Noto_Sans_KR } from "next/font/google";
import "./globals.css";

const myeongjo = Nanum_Myeongjo({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--loaded-myeongjo",
  display: "swap",
});

const notoSans = Noto_Sans_KR({
  subsets: ["latin"],
  variable: "--loaded-noto-sans",
  display: "swap",
});

const siteUrl = "https://icecokel.github.io/fe-mouigosa/";
const imageUrl = `${siteUrl}og-image.png?v=2`;
const examTitle = "2026학년도 프론트엔드 개발자 모의평가";
const description = "수능 문제지처럼 펼쳐지는 20분·100점 프론트엔드 모의고사";
const imageAlt = "제 1교시 프론트엔드 영역 제목과 2단 문제가 인쇄된 모의고사 시험지";

export const metadata = {
  title: "fe-mouigosa | 프론트엔드 개발자 모의평가",
  description,
  metadataBase: new URL(siteUrl),
  alternates: { canonical: siteUrl },
  openGraph: {
    title: examTitle,
    description,
    url: siteUrl,
    siteName: "fe-mouigosa",
    locale: "ko_KR",
    type: "website",
    images: [{ url: imageUrl, width: 1200, height: 630, alt: imageAlt, type: "image/png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: examTitle,
    description,
    images: [{ url: imageUrl, alt: imageAlt }],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko" className={`${myeongjo.variable} ${notoSans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
