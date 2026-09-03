import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { apiRequest } from "../services/api";

function Signup() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [view, setView] = useState("signup");

    const [form, setForm] = useState({
        name: "",
        email: searchParams.get("email") || "",
        password: "",
        confirmPassword: "",
        phone: "",
    });

    const [otp, setOtp] = useState("");
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [passwordStrength, setPasswordStrength] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));

        if (name === "password") {
            checkPasswordStrength(value);
        }
    };

    const checkPasswordStrength = (password) => {
        if (!password) {
            setPasswordStrength("");
            return;
        }

        let strength = 0;

        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;

        if (strength <= 2) {
            setPasswordStrength("weak");
        } else if (strength <= 4) {
            setPasswordStrength("medium");
        } else {
            setPasswordStrength("strong");
        }
    };

    const handleSignup = async (e) => {
        e.preventDefault();

        setMessage("");

        if (form.password !== form.confirmPassword) {
            setMessage("Passwords do not match.");
            setMessageType("error");
            return;
        }

        if (form.password.length < 8) {
            setMessage("Password must contain at least 8 characters.");
            setMessageType("error");
            return;
        }

        setLoading(true);

        const { ok, data } = await apiRequest("/signup", {
            method: "POST",
            body: JSON.stringify({
                name: form.name,
                email: form.email,
                password: form.password,
                phone: form.phone,
            }),
        });

        setLoading(false);

        if (!ok) {
            setMessage(data.message || "Signup failed.");
            setMessageType("error");
            return;
        }

        localStorage.setItem("pendingEmail", form.email);

        setMessage(
            data.message || "Signup successful. Please verify your email."
        );
        setMessageType("success");

        setView("verify");
    };

    const handleVerifyEmail = async (e) => {
        e.preventDefault();

        if (!otp || otp.length !== 6) {
            setMessage("Please enter a valid 6-digit OTP.");
            setMessageType("error");
            return;
        }

        setLoading(true);

        const { ok, data } = await apiRequest("/verifyemail", {
            method: "POST",
            body: JSON.stringify({
                email: form.email,
                otp,
            }),
        });

        setLoading(false);

        if (!ok) {
            setMessage(data.message || "Invalid OTP.");
            setMessageType("error");
            return;
        }

        localStorage.removeItem("pendingEmail");

        setMessage(
            data.message || "Email verified successfully."
        );
        setMessageType("success");

        setTimeout(() => {
            navigate("/login");
        }, 1200);
    };

    const handleResendOtp = async () => {
        setMessage("");
        setResending(true);

        const { ok, data } = await apiRequest("/resendotp", {
            method: "POST",
            body: JSON.stringify({
                email: form.email,
            }),
        });

        setResending(false);

        if (!ok) {
            setMessage(data.message || "Unable to resend OTP.");
            setMessageType("error");
            return;
        }

        setMessage(
            data.message || "A new OTP has been sent to your email."
        );
        setMessageType("success");
    };

    const goToLogin = () => {
        navigate("/login");
    };

    return (
        <main className="auth-page">
            <section className="auth-container">

                {view === "signup" && (
                    <>
                        <div className="auth-brand">
                            <div className="brand-logo">L</div>
                            <span>Ledger & Co.</span>
                        </div>

                        <div className="auth-heading">
                            <span className="eyebrow">Create account</span>

                            <h1>Join us today</h1>

                            <p>
                                Create your account to get started.
                            </p>
                        </div>

                        {message && (
                            <div className={`message ${messageType}`}>
                                {message}
                            </div>
                        )}

                        <form onSubmit={handleSignup}>

                            <div className="form-group">
                                <label htmlFor="name">
                                    Full name
                                </label>

                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="Enter your name"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="email">
                                    Email address
                                </label>

                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    placeholder="you@example.com"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="phone">
                                    Phone number
                                </label>

                                <input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    value={form.phone}
                                    onChange={handleChange}
                                    placeholder="Enter your phone number"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="password">
                                    Password
                                </label>

                                <div className="password-wrapper">
                                    <input
                                        id="password"
                                        name="password"
                                        type={
                                            showPassword
                                                ? "text"
                                                : "password"
                                        }
                                        value={form.password}
                                        onChange={handleChange}
                                        placeholder="Create a password"
                                        required
                                    />

                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() =>
                                            setShowPassword(
                                                !showPassword
                                            )
                                        }
                                    >
                                        {showPassword
                                            ? "Hide"
                                            : "Show"}
                                    </button>
                                </div>

                                {passwordStrength && (
                                    <div
                                        className={`password-strength ${passwordStrength}`}
                                    >
                                        Password strength:{" "}
                                        {passwordStrength}
                                    </div>
                                )}
                            </div>

                            <div className="form-group">
                                <label htmlFor="confirmPassword">
                                    Confirm password
                                </label>

                                <div className="password-wrapper">
                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type={
                                            showConfirmPassword
                                                ? "text"
                                                : "password"
                                        }
                                        value={form.confirmPassword}
                                        onChange={handleChange}
                                        placeholder="Confirm your password"
                                        required
                                    />

                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() =>
                                            setShowConfirmPassword(
                                                !showConfirmPassword
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
                                disabled={loading}
                            >
                                {loading
                                    ? "Creating account..."
                                    : "Create account"}
                            </button>
                        </form>

                        <div className="auth-footer">
                            <span>Already have an account?</span>

                            <button
                                type="button"
                                className="link-button"
                                onClick={goToLogin}
                            >
                                Sign in
                            </button>
                        </div>
                    </>
                )}

                {view === "verify" && (
                    <>
                        <button
                            type="button"
                            className="back-button"
                            onClick={() => setView("signup")}
                        >
                            ← Back
                        </button>

                        <div className="auth-heading">
                            <span className="eyebrow">
                                Verify email
                            </span>

                            <h1>Check your email</h1>

                            <p>
                                We sent a 6-digit verification code to{" "}
                                <strong>{form.email}</strong>.
                            </p>
                        </div>

                        {message && (
                            <div className={`message ${messageType}`}>
                                {message}
                            </div>
                        )}

                        <form onSubmit={handleVerifyEmail}>
                            <div className="form-group">
                                <label htmlFor="otp">
                                    Verification code
                                </label>

                                <input
                                    id="otp"
                                    type="text"
                                    className="otp-input"
                                    value={otp}
                                    onChange={(e) =>
                                        setOtp(
                                            e.target.value
                                                .replace(/\D/g, "")
                                                .slice(0, 6)
                                        )
                                    }
                                    placeholder="000000"
                                    maxLength="6"
                                    inputMode="numeric"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="primary-button"
                                disabled={loading}
                            >
                                {loading
                                    ? "Verifying..."
                                    : "Verify email"}
                            </button>
                        </form>

                        <div className="resend-area">
                            <span>Didn't receive the code?</span>

                            <button
                                type="button"
                                className="link-button"
                                onClick={handleResendOtp}
                                disabled={resending}
                            >
                                {resending
                                    ? "Sending..."
                                    : "Resend OTP"}
                            </button>
                        </div>
                    </>
                )}

            </section>
        </main>
    );
}

export default Signup;