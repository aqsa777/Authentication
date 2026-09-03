import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../services/api";

function Login() {
    const navigate = useNavigate();




    const [view, setView] = useState("login");




    const [loginData, setLoginData] = useState({
        email: "",
        password: "",
    });

    const [loginMessage, setLoginMessage] = useState({
        text: "",
        type: "",
    });

    const [loginLoading, setLoginLoading] = useState(false);

    const [showLoginPassword, setShowLoginPassword] = useState(false);




    const [forgotEmail, setForgotEmail] = useState("");

    const [forgotMessage, setForgotMessage] = useState({
        text: "",
        type: "",
    });

    const [forgotLoading, setForgotLoading] = useState(false);




    const [resetData, setResetData] = useState({
        otp: "",
        password: "",
        confirmPassword: "",
    });

    const [resetMessage, setResetMessage] = useState({
        text: "",
        type: "",
    });

    const [resetLoading, setResetLoading] = useState(false);

    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);



    const [pendingResetEmail, setPendingResetEmail] = useState("");


    const showMessage = (setter, text, type = "error") => {
        setter({
            text,
            type,
        });
    };

    const clearMessages = () => {
        setLoginMessage({
            text: "",
            type: "",
        });

        setForgotMessage({
            text: "",
            type: "",
        });

        setResetMessage({
            text: "",
            type: "",
        });
    };

    const changeView = (newView) => {
        clearMessages();
        setView(newView);
    };



    const handleLoginChange = (event) => {
        const { name, value } = event.target;

        setLoginData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleLogin = async (event) => {
        event.preventDefault();

        setLoginMessage({
            text: "",
            type: "",
        });

        const email = loginData.email.trim().toLowerCase();
        const password = loginData.password;

        // Validation
        if (!email) {
            showMessage(
                setLoginMessage,
                "Email is required."
            );
            return;
        }

        if (!password) {
            showMessage(
                setLoginMessage,
                "Password is required."
            );
            return;
        }

        setLoginLoading(true);

        const { ok, status, data } = await apiRequest("/login", {
            method: "POST",
            body: JSON.stringify({
                email,
                password,
            }),
        });

        setLoginLoading(false);

        if (!ok) {
            showMessage(
                setLoginMessage,
                data.message || "Login failed."
            );


            if (status === 403) {
                setTimeout(() => {
                    navigate(`/signup?email=${encodeURIComponent(email)}`);
                }, 1000);
            }

            return;
        }

        const token =
            data.token ||
            data.data?.token ||
            data.accessToken;

        if (!token) {
            showMessage(
                setLoginMessage,
                "Login succeeded but no authentication token was returned."
            );

            return;
        }

        localStorage.setItem("authToken", token);

        const user =
            data.user ||
            data.data?.user ||
            {};

        localStorage.setItem(
            "user",
            JSON.stringify(user)
        );

        showMessage(
            setLoginMessage,
            "Login successful. Redirecting...",
            "success"
        );

        setTimeout(() => {
            navigate("/dashboard");
        }, 700);
    };

    const handleForgot = async (event) => {
        event.preventDefault();

        setForgotMessage({
            text: "",
            type: "",
        });

        const email = forgotEmail.trim().toLowerCase();

        if (!email) {
            showMessage(
                setForgotMessage,
                "Please enter your email address."
            );

            return;
        }

        setPendingResetEmail(email);

        setForgotLoading(true);

        const { ok, data } = await apiRequest(
            "/forgotpassword",
            {
                method: "POST",
                body: JSON.stringify({
                    email,
                }),
            }
        );

        setForgotLoading(false);

        if (!ok) {
            showMessage(
                setForgotMessage,
                data.message ||
                "Unable to send reset code."
            );

            return;
        }

        showMessage(
            setForgotMessage,
            data.message ||
            "Verification code sent to your email.",
            "success"
        );

        setTimeout(() => {
            changeView("reset");
        }, 700);
    };


    const handleResetChange = (event) => {
        const { name, value } = event.target;

        setResetData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleResetPassword = async (event) => {
        event.preventDefault();

        setResetMessage({
            text: "",
            type: "",
        });

        const otp = resetData.otp.trim();
        const password = resetData.password;
        const confirmPassword =
            resetData.confirmPassword;

        // OTP validation
        if (!/^\d{6}$/.test(otp)) {
            showMessage(
                setResetMessage,
                "Please enter a valid 6-digit verification code."
            );

            return;
        }

        // Password validation
        if (password.length < 8) {
            showMessage(
                setResetMessage,
                "Password must contain at least 8 characters."
            );

            return;
        }

        if (password !== confirmPassword) {
            showMessage(
                setResetMessage,
                "Passwords do not match."
            );

            return;
        }

        if (!pendingResetEmail) {
            showMessage(
                setResetMessage,
                "Email address is missing."
            );

            return;
        }

        setResetLoading(true);

        const { ok, data } = await apiRequest(
            "/resetpassword",
            {
                method: "POST",
                body: JSON.stringify({
                    email: pendingResetEmail,
                    otp,
                    password,
                    newPassword: password,
                }),
            }
        );

        setResetLoading(false);

        if (!ok) {
            showMessage(
                setResetMessage,
                data.message ||
                "Unable to reset password."
            );

            return;
        }

        setView("success");
    };

    const openForgotPassword = () => {
        if (loginData.email.trim()) {
            setForgotEmail(
                loginData.email.trim()
            );
        }

        changeView("forgot");
    };


    const backToLogin = () => {
        changeView("login");
    };


    const backToForgot = () => {
        changeView("forgot");
    };


    const continueToLogin = () => {
        setResetData({
            otp: "",
            password: "",
            confirmPassword: "",
        });

        setPendingResetEmail("");

        setLoginData((previous) => ({
            ...previous,
            password: "",
        }));

        changeView("login");
    };


    return (
        <main className="auth-page">
            <section className="auth-container">

                <div className="auth-brand">
                    <div className="brand-logo">
                        A
                    </div>

                    <span>
                        Authentication
                    </span>
                </div>


                {view === "login" && (
                    <div className="auth-view">

                        <div className="auth-heading">

                            <span className="eyebrow">
                                Welcome back
                            </span>

                            <h1>
                                Sign in to your account
                            </h1>

                            <p>
                                Enter your email and password
                                to continue.
                            </p>

                        </div>

                        {loginMessage.text && (
                            <div
                                className={`message ${loginMessage.type}`}
                                role="alert"
                            >
                                {loginMessage.text}
                            </div>
                        )}

                        <form
                            onSubmit={handleLogin}
                            noValidate
                        >


                            <div className="form-group">

                                <label htmlFor="loginEmail">
                                    Email address
                                </label>

                                <input
                                    type="email"
                                    id="loginEmail"
                                    name="email"
                                    value={loginData.email}
                                    onChange={handleLoginChange}
                                    placeholder="you@example.com"
                                    autoComplete="email"
                                />

                            </div>


                            <div className="form-group">

                                <div className="label-row">

                                    <label htmlFor="loginPassword">
                                        Password
                                    </label>

                                    <button
                                        type="button"
                                        className="text-button"
                                        onClick={
                                            openForgotPassword
                                        }
                                    >
                                        Forgot password?
                                    </button>

                                </div>

                                <div className="password-wrapper">

                                    <input
                                        type={
                                            showLoginPassword
                                                ? "text"
                                                : "password"
                                        }
                                        id="loginPassword"
                                        name="password"
                                        value={
                                            loginData.password
                                        }
                                        onChange={
                                            handleLoginChange
                                        }
                                        placeholder="Enter your password"
                                        autoComplete="current-password"
                                    />

                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() =>
                                            setShowLoginPassword(
                                                (previous) =>
                                                    !previous
                                            )
                                        }
                                    >
                                        {showLoginPassword
                                            ? "Hide"
                                            : "Show"}
                                    </button>

                                </div>

                            </div>

                            {/* SUBMIT */}

                            <button
                                type="submit"
                                className="primary-button"
                                disabled={loginLoading}
                            >
                                {loginLoading
                                    ? "Signing in..."
                                    : "Sign in"}
                            </button>

                        </form>

                        <div className="auth-footer">

                            <span>
                                Don't have an account?
                            </span>

                            <button
                                type="button"
                                className="link-button"
                                onClick={() =>
                                    navigate("/signup")
                                }
                            >
                                Create account
                            </button>

                        </div>

                    </div>
                )}

                {/* ================================= */}
                {/* FORGOT PASSWORD */}
                {/* ================================= */}

                {view === "forgot" && (
                    <div className="auth-view">

                        <button
                            type="button"
                            className="back-button"
                            onClick={backToLogin}
                        >
                            ← Back to sign in
                        </button>

                        <div className="auth-heading">

                            <span className="eyebrow">
                                Password recovery
                            </span>

                            <h1>
                                Forgot your password?
                            </h1>

                            <p>
                                Enter your email and we'll
                                send you a verification code.
                            </p>

                        </div>

                        {forgotMessage.text && (
                            <div
                                className={`message ${forgotMessage.type}`}
                                role="alert"
                            >
                                {forgotMessage.text}
                            </div>
                        )}

                        <form
                            onSubmit={handleForgot}
                        >

                            <div className="form-group">

                                <label htmlFor="forgotEmail">
                                    Email address
                                </label>

                                <input
                                    type="email"
                                    id="forgotEmail"
                                    value={forgotEmail}
                                    onChange={(event) =>
                                        setForgotEmail(
                                            event.target.value
                                        )
                                    }
                                    placeholder="you@example.com"
                                    autoComplete="email"
                                />

                            </div>

                            <button
                                type="submit"
                                className="primary-button"
                                disabled={forgotLoading}
                            >
                                {forgotLoading
                                    ? "Sending..."
                                    : "Send verification code"}
                            </button>

                        </form>

                    </div>
                )}

                {/* ================================= */}
                {/* RESET PASSWORD */}
                {/* ================================= */}

                {view === "reset" && (
                    <div className="auth-view">

                        <button
                            type="button"
                            className="back-button"
                            onClick={backToForgot}
                        >
                            ← Back
                        </button>

                        <div className="auth-heading">

                            <span className="eyebrow">
                                Create new password
                            </span>

                            <h1>
                                Reset your password
                            </h1>

                            <p>
                                Enter the verification code
                                and your new password.
                            </p>

                        </div>

                        {resetMessage.text && (
                            <div
                                className={`message ${resetMessage.type}`}
                                role="alert"
                            >
                                {resetMessage.text}
                            </div>
                        )}

                        <form
                            onSubmit={
                                handleResetPassword
                            }
                        >

                            <div className="form-group">

                                <label htmlFor="resetOtp">
                                    Verification code
                                </label>

                                <input
                                    type="text"
                                    id="resetOtp"
                                    name="otp"
                                    value={resetData.otp}
                                    onChange={
                                        handleResetChange
                                    }
                                    maxLength="6"
                                    inputMode="numeric"
                                    autoComplete="one-time-code"
                                    placeholder="6-digit code"
                                />

                            </div>

                            {/* NEW PASSWORD */}

                            <div className="form-group">

                                <label htmlFor="newPassword">
                                    New password
                                </label>

                                <div className="password-wrapper">

                                    <input
                                        type={
                                            showNewPassword
                                                ? "text"
                                                : "password"
                                        }
                                        id="newPassword"
                                        name="password"
                                        value={
                                            resetData.password
                                        }
                                        onChange={
                                            handleResetChange
                                        }
                                        placeholder="At least 8 characters"
                                        autoComplete="new-password"
                                    />

                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() =>
                                            setShowNewPassword(
                                                (previous) =>
                                                    !previous
                                            )
                                        }
                                    >
                                        {showNewPassword
                                            ? "Hide"
                                            : "Show"}
                                    </button>

                                </div>

                            </div>

                            {/* CONFIRM PASSWORD */}

                            <div className="form-group">

                                <label htmlFor="confirmPassword">
                                    Confirm password
                                </label>

                                <div className="password-wrapper">

                                    <input
                                        type={
                                            showConfirmPassword
                                                ? "text"
                                                : "password"
                                        }
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        value={
                                            resetData.confirmPassword
                                        }
                                        onChange={
                                            handleResetChange
                                        }
                                        placeholder="Repeat your password"
                                        autoComplete="new-password"
                                    />

                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() =>
                                            setShowConfirmPassword(
                                                (previous) =>
                                                    !previous
                                            )
                                        }
                                    >
                                        {showConfirmPassword
                                            ? "Hide"
                                            : "Show"}
                                    </button>

                                </div>

                            </div>

                            <button
                                type="submit"
                                className="primary-button"
                                disabled={resetLoading}
                            >
                                {resetLoading
                                    ? "Resetting..."
                                    : "Reset password"}
                            </button>

                        </form>

                    </div>
                )}


                {view === "success" && (
                    <div className="auth-view">

                        <div className="success-icon">
                            ✓
                        </div>

                        <div className="auth-heading">

                            <span className="eyebrow">
                                Password updated
                            </span>

                            <h1>
                                You're all set
                            </h1>

                            <p>
                                Your password has been changed
                                successfully. You can now sign
                                in with your new password.
                            </p>

                        </div>

                        <button
                            type="button"
                            className="primary-button"
                            onClick={continueToLogin}
                        >
                            Continue to sign in
                        </button>

                    </div>
                )}

            </section>
        </main>
    );
}

export default Login;