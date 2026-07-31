import { type ReactNode, useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { AdminDashboard } from "./admin/AdminDashboard";
import { AdminEvents } from "./admin/AdminEvents";
import { AdminFundraisers } from "./admin/AdminFundraisers";
import { AdminGallery } from "./admin/AdminGallery";
import { AdminLayout } from "./admin/AdminLayout";
import { AdminLogin } from "./admin/AdminLogin";
import { AdminMembers } from "./admin/AdminMembers";
import { AdminTickets } from "./admin/AdminTickets";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { AdminAuthProvider } from "./lib/adminAuth";
import { fetchEvents, fetchFundraisers, fetchGalleryAlbums } from "./lib/api";
import { getCached, setCached } from "./lib/dataCache";
import { AboutPage } from "./pages/AboutPage";
import { ContactPage } from "./pages/ContactPage";
import { EventsPage } from "./pages/EventsPage";
import { GalleryPage } from "./pages/GalleryPage";
import { GivePage } from "./pages/GivePage";
import { HomePage } from "./pages/HomePage";
import { MembersPage } from "./pages/MembersPage";
import "./App.css";

function PublicShell({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Warm cache so first paint of Home / Events / Give / Gallery is smoother
    const warm = async () => {
      if (!getCached("events")) {
        try {
          setCached("events", await fetchEvents());
        } catch {
          /* ignore */
        }
      }
      if (!getCached("fundraisers")) {
        try {
          setCached("fundraisers", await fetchFundraisers());
        } catch {
          /* ignore */
        }
      }
      if (!getCached("gallery-albums")) {
        try {
          setCached("gallery-albums", await fetchGalleryAlbums());
        } catch {
          /* ignore */
        }
      }
    };
    void warm();
  }, []);

  return (
    <div className="site-shell">
      <Header />
      <main className="site-main">{children}</main>
      <Footer />
    </div>
  );
}

export default function App() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");

  if (isAdmin) {
    return (
      <AdminAuthProvider>
        <Routes>
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="events" element={<AdminEvents />} />
            <Route path="members" element={<AdminMembers />} />
            <Route path="gallery" element={<AdminGallery />} />
            <Route path="fundraisers" element={<AdminFundraisers />} />
            <Route path="tickets" element={<AdminTickets />} />
          </Route>
        </Routes>
      </AdminAuthProvider>
    );
  }

  return (
    <PublicShell>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/members" element={<MembersPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/events/:eventId" element={<EventsPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/give" element={<GivePage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Routes>
    </PublicShell>
  );
}
