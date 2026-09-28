import "./styles.css";
export const metadata = {
  title: "KLK OLEO Agrochemicals",
  description: "Agrochemical CMS preview",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
