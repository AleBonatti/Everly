import { Routes, Route } from 'react-router';
import { GuestRoute } from './components/GuestRoute';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { VerifyEmailPage } from './pages/VerifyEmailPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { ItemsPage } from './pages/ItemsPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { UserSettingsPage } from './pages/UserSettingsPage';
import { AuthLayout } from './components/AuthLayout';
import { Layout } from './components/Layout';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';

export function App() {
    return (
        <Routes>
            <Route element={<GuestRoute />}>
                <Route element={<AuthLayout />}>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/verify-email" element={<VerifyEmailPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />
                </Route>
            </Route>

            <Route element={<ProtectedRoute />}>
                <Route element={<Layout />}>
                    <Route path="/" element={<ItemsPage />} />
                    <Route path="/categories" element={<CategoriesPage />} />
                    <Route path="/settings" element={<UserSettingsPage />} />
                </Route>
            </Route>

            <Route path="/privacy" element={<PrivacyPolicyPage />} />
        </Routes>
    );
}
