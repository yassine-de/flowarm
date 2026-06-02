import Navbar from "./Navbar";
import Footer from "./Footer";

export default function Layout({ children, t, lang, setLang, go, user, onLogin, onLogout }) {
  return (
    <div id="top" className="min-h-screen bg-ink text-white">
      <Navbar t={t} lang={lang} setLang={setLang} go={go} user={user} onLogin={onLogin} onLogout={onLogout} />
      {children}
      <Footer go={go} />
    </div>
  );
}
