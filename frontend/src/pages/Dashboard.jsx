import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../services/api";

function Dashboard() {
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getUser = async () => {
            const token = localStorage.getItem("authToken");

            if (!token) {
                navigate("/login", { replace: true });
                return;
            }

            const { ok, data } = await apiRequest("/me", {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!ok) {
                localStorage.removeItem("authToken");
                localStorage.removeItem("user");

                navigate("/login", { replace: true });
                return;
            }

            setUser(data.user || data.data || data);
            setLoading(false);
        };

        getUser();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");

        navigate("/login", { replace: true });
    };

    if (loading) {
        return (
            <main className="auth-page">
                <section className="auth-container">
                    <div className="auth-heading">
                        <p>Loading your dashboard...</p>
                    </div>
                </section>
            </main>
        );
    }

    return (
        <main className="auth-page">
            <section className="auth-container">

                <div className="success-icon">
                    ✓
                </div>

                <div className="auth-heading">
                    <span className="eyebrow">
                        Welcome
                    </span>

                    <h1>
                        Successfully logged in
                    </h1>

                    <p>
                        You have successfully signed in to your
                        account.
                    </p>
                </div>

                {user && (
                    <div className="user-info">
                        <p>
                            <strong>Name:</strong>{" "}
                            {user.name}
                        </p>

                        <p>
                            <strong>Email:</strong>{" "}
                            {user.email}
                        </p>

                        {user.phone && (
                            <p>
                                <strong>Phone:</strong>{" "}
                                {user.phone}
                            </p>
                        )}
                    </div>
                )}

                <button
                    type="button"
                    className="primary-button"
                    onClick={handleLogout}
                >
                    Sign out
                </button>

            </section>
        </main>
    );
}

export default Dashboard;