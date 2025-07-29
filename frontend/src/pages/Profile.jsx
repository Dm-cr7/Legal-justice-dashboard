import React, { useEffect, useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";

export default function Profile() {
  const [profile, setProfile] = useState({ name: "", email: "" });
  const [loading, setLoading] = useState(true);
  const [profileMessage, setProfileMessage] = useState(null);
  const [passMessage, setPassMessage] = useState(null);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get("/api/auth/me", { withCredentials: true });
        setProfile(res.data);
      } catch {
        setProfileMessage({ text: "Failed to load profile", type: "error" });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setProfileMessage(null);
    try {
      const res = await axios.put("/api/users/profile", profile, { withCredentials: true });
      setProfile(res.data);
      setProfileMessage({ text: "Profile updated successfully", type: "success" });
    } catch {
      setProfileMessage({ text: "Failed to update profile", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const onPasswordSubmit = async (data) => {
    setPassMessage(null);
    try {
      await axios.put("/api/users/password", data, { withCredentials: true });
      setPassMessage({ text: "Password updated successfully", type: "success" });
      reset({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch {
      setPassMessage({ text: "Failed to update password", type: "error" });
    }
  };

  return (
    <div className="container">
      <h1>My Profile</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <div className="card">
            <form onSubmit={handleProfileSubmit}>
              <h2>Personal Info</h2>
              <label>Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                required
              />
              <label>Email</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                required
              />
              <button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
              {profileMessage && (
                <p className={profileMessage.type === "error" ? "error" : "success"}>
                  {profileMessage.text}
                </p>
              )}
            </form>
          </div>

          <div className="card">
            <form onSubmit={handleSubmit(onPasswordSubmit)}>
              <h2>Change Password</h2>
              <label>Current Password</label>
              <input
                type="password"
                {...register("currentPassword", { required: "Required" })}
              />
              {errors.currentPassword && <p className="error">{errors.currentPassword.message}</p>}

              <label>New Password</label>
              <input
                type="password"
                {...register("newPassword", {
                  required: "Required",
                  minLength: { value: 6, message: "Minimum 6 characters" },
                })}
              />
              {errors.newPassword && <p className="error">{errors.newPassword.message}</p>}

              <label>Confirm New Password</label>
              <input
                type="password"
                {...register("confirmPassword", {
                  required: "Required",
                  validate: (value) =>
                    value === watch("newPassword") || "Passwords do not match",
                })}
              />
              {errors.confirmPassword && <p className="error">{errors.confirmPassword.message}</p>}

              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update Password"}
              </button>
              {passMessage && (
                <p className={passMessage.type === "error" ? "error" : "success"}>
                  {passMessage.text}
                </p>
              )}
            </form>
          </div>
        </>
      )}

      <style jsx>{`
        .container {
          max-width: 600px;
          margin: 40px auto;
          padding: 20px;
          font-family: 'Segoe UI', sans-serif;
          color: #222;
        }

        h1 {
          font-size: 2rem;
          font-weight: bold;
          margin-bottom: 30px;
          text-align: center;
        }

        h2 {
          font-size: 1.25rem;
          margin-bottom: 10px;
        }

        .card {
          background: #fff;
          border: 1px solid #ddd;
          padding: 20px;
          margin-bottom: 30px;
          border-radius: 8px;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
        }

        label {
          display: block;
          margin-top: 15px;
          margin-bottom: 5px;
          font-weight: 500;
        }

        input {
          width: 100%;
          padding: 10px;
          border: 1px solid #ccc;
          border-radius: 6px;
          font-size: 0.95rem;
        }

        button {
          margin-top: 20px;
          background-color: #0056b3;
          color: white;
          border: none;
          padding: 10px 20px;
          font-size: 1rem;
          border-radius: 6px;
          cursor: pointer;
          transition: background 0.2s ease-in-out;
        }

        button:hover {
          background-color: #004599;
        }

        .error {
          color: #c0392b;
          margin-top: 5px;
        }

        .success {
          color: #27ae60;
          margin-top: 5px;
        }
      `}</style>
    </div>
  );
}
