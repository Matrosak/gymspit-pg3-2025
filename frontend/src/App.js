import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Directory from "./pages/Directory";
import PubDetail from "./pages/PubDetail";
import Nearest from "./pages/Nearest";
import Crawl from "./pages/Crawl";
import Favorites from "./pages/Favorites";
import Stats from "./pages/Stats";

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/hospody" element={<Directory />} />
          <Route path="/hospody/:id" element={<PubDetail />} />
          <Route path="/blizko" element={<Nearest />} />
          <Route path="/tah" element={<Crawl />} />
          <Route path="/oblibene" element={<Favorites />} />
          <Route path="/statistiky" element={<Stats />} />
        </Routes>
      </Layout>
      <Toaster position="top-center" richColors />
    </BrowserRouter>
  );
}

export default App;
