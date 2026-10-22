import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Shell } from "./components/Shell";
import { AuthProvider } from "./context/AuthContext";
import { A11yLab } from "./pages/A11yLab";
import { Courses } from "./pages/Courses";
import { Enrollments } from "./pages/Enrollments";
import { FlakyLab } from "./pages/FlakyLab";
import { Forms } from "./pages/Forms";
import { Locators } from "./pages/Locators";
import { Login } from "./pages/Login";
import { NetworkLab } from "./pages/NetworkLab";
import { NotFound } from "./pages/NotFound";
import { Overview } from "./pages/Overview";
import { VisualLab } from "./pages/VisualLab";
import { Widgets } from "./pages/Widgets";
import { ThemeProvider } from "./theme/ThemeProvider";

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Shell>
            <Routes>
              <Route path="/" element={<Overview />} />
              <Route path="/login" element={<Login />} />
              <Route path="/lab/locators" element={<Locators />} />
              <Route path="/lab/forms" element={<Forms />} />
              <Route path="/lab/widgets" element={<Widgets />} />
              <Route path="/lab/network" element={<NetworkLab />} />
              <Route path="/lab/flaky" element={<FlakyLab />} />
              <Route path="/lab/visual" element={<VisualLab />} />
              <Route path="/lab/a11y" element={<A11yLab />} />
              <Route path="/app/courses" element={<Courses />} />
              <Route path="/app/enrollments" element={<Enrollments />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Shell>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
