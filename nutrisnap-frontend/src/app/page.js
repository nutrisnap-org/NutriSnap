import Header from "./components/Header/Header";
import Hero from "./components/Hero/Hero";
import Footer from "./components/Footer/Footer";
export default function Home() {
  return (
    <main className="flex flex-col items-center justify-between px-4">
      <Header />
      <Hero />
      <Footer />
    </main>
  );
}
