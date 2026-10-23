import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Shell } from "./components/Shell";
import { AuthProvider } from "./context/AuthContext";
import { A11yLab } from "./pages/A11yLab";
import { BrowserFrameContent } from "./pages/BrowserFrameContent";
import { BrowserLab } from "./pages/BrowserLab";
import { BrowserNestedContent } from "./pages/BrowserNestedContent";
import { BrowserPopupContent } from "./pages/BrowserPopupContent";
import { CourseDetail } from "./pages/CourseDetail";
import { Courses } from "./pages/Courses";
import { Enrollments } from "./pages/Enrollments";
import { FlakyLab } from "./pages/FlakyLab";
import { Forms } from "./pages/Forms";
import { Locators } from "./pages/Locators";
import { Login } from "./pages/Login";
import { NetworkLab } from "./pages/NetworkLab";
import { NotFound } from "./pages/NotFound";
import { Overview } from "./pages/Overview";
import { PerfLab } from "./pages/PerfLab";
import { Profile } from "./pages/Profile";
import { Users } from "./pages/Users";
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
              <Route path="/lab/perf" element={<PerfLab />} />
              <Route path="/lab/browser" element={<BrowserLab />} />
              <Route path="/lab/browser/popup-content" element={<BrowserPopupContent />} />
              <Route path="/lab/browser/frame-content" element={<BrowserFrameContent />} />
              <Route path="/lab/browser/nested-frame" element={<BrowserNestedContent />} />
              <Route path="/app/courses" element={<Courses />} />
              <Route path="/app/courses/:id" element={<CourseDetail />} />
              <Route path="/app/enrollments" element={<Enrollments />} />
              <Route path="/app/users" element={<Users />} />
              <Route path="/app/profile" element={<Profile />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Shell>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
