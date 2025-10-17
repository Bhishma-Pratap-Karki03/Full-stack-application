import { Route, Routes } from "react-router-dom";
import "./App.css";
import HomePage from "./pages/HomePage";
import AboutUsPage from "./pages/AboutUsPage";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer/Footer";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import React, { createContext, useEffect, useState } from "react";
import axios from "axios";
import CreateQuestionSetPage from "./pages/QuestionSet/CreateQuestionSetPage";
import ListQuestionSetPage from "./pages/QuestionSet/ListQuestionSetPage";
import AttemptQuizPage from "./pages/QuestionSet/AttemptQuizPage";
import AdminViewQuestionSetPage from "./pages/QuestionSet/AdminViewQuestionSetPage";
import ViewQuizResultsPage from "./pages/QuestionSet/ViewQuizResultsPage";
import QuizResultsAllPage from "./pages/QuizResultsAllPage";
import AdminContactManagementPage from "./pages/AdminContactManagementPage";
import { jwtDecode } from "jwt-decode";
import ContactPage from "./pages/ContactPage";
import Profile from "./components/Profile/Profile";
import ViewUserProfile from "./components/Profile/ViewUserProfile"; // Add this import
import ConnectionRequestsPage from "./pages/ConnectionRequestsPage";
import ConnectionsPage from "./pages/ConnectionsPage";
import MessagesPage from "./pages/MessagesPage";
import ChatPage from "./pages/ChatPage";
import OTPVerification from "./components/OTPVerification";
import ResetPasswordOTP from "./components/ResetPasswordOTP";
import ForgotPassword from "./components/ForgotPassword";

export interface IAuthState {
  isAuth: boolean;
  roleState: "admin" | "professional" | "guest";
}

export interface IAuthContext extends IAuthState {
  setAuthState: React.Dispatch<React.SetStateAction<IAuthState>>;
}

export interface JWTDecode {
  role: "admin" | "professional";
  id: string;
}

export const AuthContext = createContext<IAuthContext>({
  isAuth: false,
  roleState: "guest",
  setAuthState: () => {},
});

function App() {
  const [authState, setAuthState] = useState<IAuthState>({
    isAuth: false,
    roleState: "guest",
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      setIsLoading(false);
      return;
    }

    async function fetchData() {
      axios
        .get("http://localhost:3000/users/list", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .then(() => {
          const { role }: JWTDecode = jwtDecode(accessToken as string);
          setAuthState((prev) => ({
            ...prev,
            isAuth: true,
            roleState: role,
          }));
          setIsLoading(false);
        })
        .catch(() => {
          localStorage.clear();
          setIsLoading(false);
        });
    }
    fetchData();
  }, []);

  if (isLoading) return <div>Loading...</div>;

  return (
    <AuthContext.Provider
      value={{
        isAuth: authState.isAuth,
        roleState: authState.roleState,
        setAuthState: setAuthState,
      }}
    >
      <div className="app-container">
        <Navbar />
        <main className="main-content">
          <Routes>
            {/* normal*/}
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutUsPage />} />
            <Route path="/contact" element={<ContactPage />} />

            {/* unAuth routes */}
            {!authState?.isAuth && (
              <>
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/verify-email" element={<OTPVerification />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route
                  path="/reset-password-otp"
                  element={<ResetPasswordOTP />}
                />
              </>
            )}

            {/* auth routes */}
            {authState?.isAuth && (
              <>
                <Route
                  path="/questionset/list"
                  element={<ListQuestionSetPage />}
                />
                <Route
                  path="questionset/:id/attempt"
                  element={<AttemptQuizPage />}
                />
                <Route
                  path="/quiz/result/:questionSetId"
                  element={<ViewQuizResultsPage />}
                />
                <Route
                  path="/quiz/results/all"
                  element={<QuizResultsAllPage />}
                />
                <Route
                  path="/quiz/results/all/:userId"
                  element={<QuizResultsAllPage />}
                />
                <Route path="/profile" element={<Profile />} />
                {/* Add this route for viewing other users' profiles */}
                <Route path="/profile/:id" element={<ViewUserProfile />} />

                {/* Professional networking routes */}
                <Route path="/connections" element={<ConnectionsPage />} />
                <Route
                  path="/connection-requests"
                  element={<ConnectionRequestsPage />}
                />
                <Route path="/messages" element={<MessagesPage />} />
                <Route path="/messages/:userId" element={<ChatPage />} />
              </>
            )}

            {/* admin routes */}
            {authState?.roleState == "admin" && (
              <>
                <Route
                  path="/admin/question/set/create"
                  element={<CreateQuestionSetPage />}
                />
                <Route
                  path="/admin/questionset/:id/view"
                  element={<AdminViewQuestionSetPage />}
                />
                <Route
                  path="/admin/contacts"
                  element={<AdminContactManagementPage />}
                />
              </>
            )}

            <Route path="*" element={<div>404 Not Found</div>} />
          </Routes>
        </main>
        <Footer />
      </div>
    </AuthContext.Provider>
  );
}

export default App;
