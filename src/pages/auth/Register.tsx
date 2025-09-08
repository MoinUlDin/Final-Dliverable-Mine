// src/pages/auth/Register.tsx
import React, { useState } from "react";
import { UserPlus, Camera } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import AuthServices from "../../services/AuthServices";
import toast from "react-hot-toast";

type FormState = {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  password: string;
  confirm_password: string;
  role: string;
  employee_number: string;
  department: string;
  phone?: string;
  picture?: File | null;
};

export default function Register() {
  const [form, setForm] = useState<FormState>({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    password: "",
    confirm_password: "",
    role: "",
    employee_number: "",
    department: "",
    phone: "",
    picture: null,
  });

  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const navigate = useNavigate();

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, files } = e.target as any;

    if (name === "picture") {
      const f: File | null = files?.[0] ?? null;
      setForm((s) => ({ ...s, picture: f }));
      if (f) {
        const url = URL.createObjectURL(f);
        setPreview(url);
      } else {
        setPreview(null);
      }
      return;
    }

    // update value
    setForm((s) => ({ ...s, [name]: value }));

    // live password match validation
    if (name === "password" || name === "confirm_password") {
      const newPassword = name === "password" ? value : form.password; // if changing password, new value; else keep current
      const newConfirm =
        name === "confirm_password" ? value : form.confirm_password;

      if (newConfirm && newPassword !== newConfirm) {
        setPasswordError("Passwords do not match");
      } else {
        setPasswordError(null);
      }
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setPasswordError(null);

    if (form.password !== form.confirm_password) {
      const errMsg = "Passwords do not match";
      setPasswordError(errMsg);
      toast.error(errMsg, { duration: 4000 });
      return;
    }

    if (form.password.length < 8) {
      const errMsg = "Password must be at least 8 characters";
      setPasswordError(errMsg);
      toast.error(errMsg, { duration: 4000 });
      return;
    }

    setLoading(true);
    AuthServices.register(form)
      .then(() => {
        setMessage("Registration submitted. Please wait for admin approval.");
        toast.success(
          "Registration successful — please wait for admin approval",
          { duration: 4000 }
        );
        setTimeout(() => navigate("/"), 2500);
      })
      .catch((err) => {
        console.log("Register error raw: ", err);

        const backendMsg =
          err?.non_field_errors?.[0] ||
          err?.detail ||
          err?.email?.[0] ||
          err?.username?.[0] ||
          err?.employee_number?.[0] ||
          err?.role?.[0] ||
          err?.message ||
          "Registration failed";

        setMessage(String(backendMsg));
        toast.error(String(backendMsg), { duration: 6000 });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-2xl w-full">
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <UserPlus className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">
              Create Account
            </h1>
            <p className="text-slate-600 mt-2">
              Fill in your details to register
            </p>
          </div>

          <form onSubmit={submit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="first_name"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  First Name
                </label>
                <input
                  id="first_name"
                  name="first_name"
                  type="text"
                  value={form.first_name}
                  onChange={onChange}
                  required
                  className="w-full px-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter first name"
                />
              </div>

              <div>
                <label
                  htmlFor="last_name"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Last Name
                </label>
                <input
                  id="last_name"
                  name="last_name"
                  type="text"
                  value={form.last_name}
                  onChange={onChange}
                  required
                  className="w-full px-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter last name"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                value={form.username}
                onChange={onChange}
                required
                className="w-full px-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Choose a username"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={onChange}
                required
                className="w-full px-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter your email"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={onChange}
                  required
                  className="w-full px-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Create password"
                />
              </div>

              <div>
                <label
                  htmlFor="confirm_password"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Confirm Password
                </label>
                <input
                  id="confirm_password"
                  name="confirm_password"
                  type="password"
                  value={form.confirm_password}
                  onChange={onChange}
                  required
                  className="w-full px-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Confirm password"
                />
              </div>

              {passwordError && (
                <div id="password-error" className="text-sm text-red-600">
                  {passwordError}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="designation"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Designation (Role)
                </label>
                <select
                  id="designation"
                  name="role"
                  value={form.role}
                  onChange={onChange}
                  required
                  className="w-full px-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="">Select designation</option>
                  <option value="Manager">Manager</option>
                  <option value="Member">Member</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="employee_number"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Employee Number
                </label>
                <input
                  id="employee_number"
                  name="employee_number"
                  type="text"
                  value={form.employee_number}
                  onChange={onChange}
                  required
                  className="w-full px-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter employee number"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="department"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Department
                </label>
                <input
                  id="department"
                  name="department"
                  type="text"
                  value={form.department}
                  onChange={onChange}
                  className="w-full px-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter department"
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Phone Number
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={onChange}
                  className="w-full px-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Profile Picture
              </label>
              <div className="flex items-center gap-4">
                <label
                  className="flex items-center gap-2 px-4 py-3 border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors"
                  htmlFor="picture"
                >
                  <Camera className="w-5 h-5 text-slate-500" />
                  <span className="text-sm font-medium">Upload photo</span>
                  <input
                    id="picture"
                    name="picture"
                    type="file"
                    accept="image/*"
                    onChange={onChange}
                    className="hidden"
                  />
                </label>

                <div className="w-20 h-20 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center border border-slate-300">
                  {preview ? (
                    <img
                      src={preview}
                      alt="Profile preview"
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="text-slate-400 text-xs text-center">
                      No photo
                    </div>
                  )}
                </div>
              </div>
            </div>

            {message && (
              <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-sm">
                {message}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Creating Account…" : "Create Account"}
              </button>

              <Link
                to="/"
                className="inline-flex items-center justify-center py-3 px-4 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Already have an account?
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
