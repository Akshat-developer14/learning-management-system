import { Poppins, Josefin_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./utils/Theme-Provider";
import { Toaster } from 'react-hot-toast';

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

const josefinSans = Josefin_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-josefin",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} ${josefinSans.variable} !bg-white bg-no-repeat bg-gradient-to-r from-sky-200 to-slate-300 dark:bg-gradient-to-b dark:from-gray-900 dark:to-black duration-300`}
      >
        <ThemeProvider defaultTheme="dark">{children}
          <Toaster position="top-center" reverseOrder={false}/>
        </ThemeProvider>
      </body>
    </html>
  );
}
