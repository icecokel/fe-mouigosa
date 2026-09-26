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

export const metadata = {
  title: "fe-mouigosa | 프론트엔드 개발자 모의평가",
  description: "한국식 모의고사 시험지로 만나는 프론트엔드 영역",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko" className={`${myeongjo.variable} ${notoSans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
