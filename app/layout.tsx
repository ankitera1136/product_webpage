import "./globals.css";
import Link from "next/link";
import { CookieNotice } from "../components/CookieNotice";

export const metadata = {
  title: "Product Picks",
  description: "Curated product suggestions with search and filters."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="site">
          <div className="inner">
            <Link href="/"><strong>Product Picks</strong></Link>
            <nav>
              <Link href="/">Home</Link>
              <Link href="/privacy">Privacy</Link>
              <Link href="/admin">Admin</Link>
            </nav>
          </div>
        </header>
        <main className="container">{children}</main>
        <div className="container">
          <CookieNotice />
          <div className="footer">Affiliate disclosure: Some links may earn us a commission.</div>
        </div>
      </body>
    </html>
  );
}
