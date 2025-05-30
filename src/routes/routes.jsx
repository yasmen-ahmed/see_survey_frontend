import { Routes, Route, Navigate } from 'react-router-dom';
import PageContainer from '../pages/Page-container.jsx';
import LandingPage from '../pages/LandingPage.jsx';
import LoginForm from '../Components/Auth/SignupForm.jsx';
import MainLayout from '../pages/Mainlayout.jsx';
import RequireAuth from '../Components/Auth/RequireAuth.jsx';

const RoutesComponent = () => {
  return (
    <Routes>
      {/* Public route: login */}
      <Route path="/" element={<LoginForm />} />

      {/* Protected routes */}
      <Route element={<RequireAuth />}>
        <Route path="/landingpage" element={<LandingPage />} />
        <Route path="/sites" element={<MainLayout />}
        >
          <Route path=":sessionId/:siteId/:pageName/:tabKey" element={<PageContainer />} />
        </Route>
      </Route>

      {/* Fallback: redirect unknown paths to login */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default RoutesComponent;
