// src/pages/ProfilePage.tsx
import React, { useEffect, useState, useRef } from "react";
import ProfileServices from "../services/ProfileServices";
import toast from "react-hot-toast";
import { Camera, Edit2, Save, Key, X, Eye, EyeOff } from "lucide-react";
import CommentServices from "../services/CommentServices";

type ProfilePayload = {
  first_name?: string;
  last_name?: string;
  username?: string;
  email?: string;
  employee_number?: string;
  department?: string;
  picture?: string | null;
  role?: string;
  date_joined?: string;
};

const DEFAULT_AVATAR = "/mnt/data/9aef8500-1147-42ce-9d1d-d741fbfb1d52.png";

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfilePayload | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // edit mode & form state
  const [editing, setEditing] = useState<boolean>(false);
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [pictureFile, setPictureFile] = useState<File | null>(null);
  const [picturePreview, setPicturePreview] = useState<string | null>(null);

  // password change
  const [pwOld, setPwOld] = useState<string>("");
  const [pwNew, setPwNew] = useState<string>("");
  const [pwConfirm, setPwConfirm] = useState<string>("");
  const [pwProcessing, setPwProcessing] = useState<boolean>(false);

  // password visibility
  const [showOld, setShowOld] = useState<boolean>(false);
  const [showNew, setShowNew] = useState<boolean>(false);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);

  const inputFileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    loadProfile();
    return () => {
      if (picturePreview) URL.revokeObjectURL(picturePreview);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    CommentServices.FetchComments("11d2722c-8f9a-4415-84fb-d53650d7beb1")
      .then((r) => {
        console.log("Comments: ", r);
      })
      .catch((e) => {
        console.log("error: ", e);
      });
  }, []);
  function loadProfile() {
    setLoading(true);
    ProfileServices.FetchProfile()
      .then((r: any) => {
        setProfile(r);
        setFirstName(r.first_name || "");
        setLastName(r.last_name || "");
      })
      .catch((e: any) => {
        console.error("FetchProfile error", e);
        toast.error("Failed to load profile");
      })
      .finally(() => setLoading(false));
  }

  function onPickPicture(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    if (picturePreview) URL.revokeObjectURL(picturePreview);
    const url = URL.createObjectURL(f);
    setPictureFile(f);
    setPicturePreview(url);
    setEditing(true);
  }

  function triggerFilePick() {
    inputFileRef.current?.click();
  }

  function handleCancelEdit() {
    setEditing(false);
    setFirstName(profile?.first_name || "");
    setLastName(profile?.last_name || "");
    setPictureFile(null);
    if (picturePreview) {
      URL.revokeObjectURL(picturePreview);
      setPicturePreview(null);
    }
  }

  /**
   * UpdateProfile behaviour:
   * - If pictureFile exists -> build FormData and call UpdateProfile(fd, true)
   * - Otherwise call UpdateProfile(jsonPayload) (image=false by default)
   */
  async function handleSaveProfile() {
    if (!profile) return;
    setLoading(true);

    if (!firstName.trim() || !lastName.trim()) {
      toast.error("First and last name cannot be empty");
      setLoading(false);
      return;
    }

    try {
      if (pictureFile) {
        const fd = new FormData();
        fd.append("first_name", firstName);
        fd.append("last_name", lastName);
        fd.append("picture", pictureFile);
        // the backend expects an "image" flag — caller should pass image=true
        // we pass the payload + image=true to ProfileServices.UpdateProfile
        const res = await ProfileServices.UpdateProfile(fd, true);
        toast.success("Profile updated");
        if (res && typeof res === "object" && res.first_name) {
          setProfile((p) => ({ ...(p || {}), ...(res as any) }));
        } else {
          loadProfile();
        }
        // cleanup preview
        if (picturePreview) {
          URL.revokeObjectURL(picturePreview);
          setPicturePreview(null);
        }
        setPictureFile(null);
      } else {
        // JSON payload, no image flag needed
        const payload = { first_name: firstName, last_name: lastName };
        const res = await ProfileServices.UpdateProfile(payload);
        toast.success("Profile updated");
        console.log("profile Update: ", res);
        localStorage.setItem("user_info", JSON.stringify(res));
        if (res && typeof res === "object" && res.first_name) {
          setProfile((p) => ({ ...(p || {}), ...(res as any) }));
        } else {
          loadProfile();
        }
      }
      setEditing(false);
    } catch (err: any) {
      console.error("UpdateProfile error", err);
      const msg =
        err?.detail ||
        (typeof err === "object" && Object.values(err || {})[0]) ||
        "Failed to update profile";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleChangePassword() {
    if (!pwNew || !pwConfirm) {
      toast.error("Provide and confirm the new password.");
      return;
    }
    if (pwNew !== pwConfirm) {
      toast.error("New passwords do not match.");
      return;
    }
    if (pwNew.length < 8) {
      toast.error("New password must be at least 8 characters.");
      return;
    }

    setPwProcessing(true);
    try {
      await ProfileServices.ChangePassword({
        old_password: pwOld,
        new_password: pwNew,
      });
      toast.success("Password updated", { duration: 8000 });
      setPwOld("");
      setPwNew("");
      setPwConfirm("");
    } catch (err: any) {
      console.error("ChangePassword error", err);
      toast.error(
        err?.new_password ||
          err?.old_password ||
          err?.detail ||
          "Failed to change password"
      );
    } finally {
      setPwProcessing(false);
    }
  }

  const pwCanSubmit =
    !!pwOld && pwNew && pwConfirm && pwNew === pwConfirm && pwNew.length >= 6;

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="bg-white shadow-md rounded-2xl overflow-hidden border">
        {/* Header: avatar centered on top */}
        <div className="p-6 flex flex-col items-center gap-4">
          <div className="relative">
            <img
              src={picturePreview || profile?.picture || DEFAULT_AVATAR}
              alt="Profile"
              className="w-28 h-28 md:w-36 md:h-36 lg:w-44 lg:h-44 rounded-full object-cover border shadow-sm"
            />
            <button
              type="button"
              onClick={triggerFilePick}
              className="absolute -bottom-1 right-0 bg-white rounded-full p-2 shadow border hover:bg-slate-50"
              title="Change profile picture"
            >
              <Camera className="w-4 h-4 text-slate-700" />
            </button>
            <input
              ref={inputFileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onPickPicture}
            />
          </div>

          <div className="text-center">
            <div className="text-lg md:text-xl font-semibold text-slate-800">
              {profile ? `${profile.first_name} ${profile.last_name}` : "—"}
            </div>
            <div className="text-sm text-slate-500">{profile?.role}</div>
            <div className="text-xs text-slate-400 mt-1">
              Member since{" "}
              {profile?.date_joined
                ? new Date(profile.date_joined).toLocaleDateString()
                : "—"}
            </div>
          </div>

          <div className="w-full flex justify-center">
            {!editing ? (
              <button
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-slate-100 hover:bg-slate-200 text-sm"
                onClick={() => setEditing(true)}
              >
                <Edit2 className="w-4 h-4" />
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-green-600 text-white text-sm hover:bg-green-700"
                  onClick={handleSaveProfile}
                  disabled={loading}
                >
                  <Save className="w-4 h-4" /> Save
                </button>
                <button
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-white border text-sm"
                  onClick={handleCancelEdit}
                  disabled={loading}
                >
                  <X className="w-4 h-4" /> Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="border-t" />

        {/* Form fields below */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* first name */}
            <div>
              <label className="block text-xs md:text-sm text-slate-600 mb-1">
                First name
              </label>
              <input
                className="w-full px-3 py-2 rounded-md border text-sm md:text-base"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                readOnly={!editing}
              />
            </div>

            {/* last name */}
            <div>
              <label className="block text-xs md:text-sm text-slate-600 mb-1">
                Last name
              </label>
              <input
                className="w-full px-3 py-2 rounded-md border text-sm md:text-base"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                readOnly={!editing}
              />
            </div>

            {/* username (readonly) */}
            <div>
              <label className="block text-xs md:text-sm text-slate-600 mb-1">
                Username
              </label>
              <input
                className="w-full px-3 py-2 rounded-md border bg-slate-50 text-sm md:text-base"
                value={profile?.username || ""}
                readOnly
              />
            </div>

            {/* email (readonly) */}
            <div>
              <label className="block text-xs md:text-sm text-slate-600 mb-1">
                Email
              </label>
              <input
                className="w-full px-3 py-2 rounded-md border bg-slate-50 text-sm md:text-base"
                value={profile?.email || ""}
                readOnly
              />
            </div>

            {/* employee number (readonly) */}
            <div>
              <label className="block text-xs md:text-sm text-slate-600 mb-1">
                Employee #
              </label>
              <input
                className="w-full px-3 py-2 rounded-md border bg-slate-50 text-sm md:text-base"
                value={(profile as any)?.employee_number || ""}
                readOnly
              />
            </div>

            {/* department (readonly) */}
            <div>
              <label className="block text-xs md:text-sm text-slate-600 mb-1">
                Department
              </label>
              <input
                className="w-full px-3 py-2 rounded-md border bg-slate-50 text-sm md:text-base"
                value={(profile as any)?.department || ""}
                readOnly
              />
            </div>
          </div>

          {/* picture preview info */}
          {picturePreview ? (
            <div className="mt-3 text-sm text-slate-600">
              New picture ready to upload
            </div>
          ) : null}

          {/* password change box */}
          <div className="mt-6 border-t pt-4">
            <h3 className="text-sm md:text-base font-medium text-slate-800">
              Change password
            </h3>
            <p className="text-xs md:text-sm text-slate-500 mt-1">
              Provide your current password and choose a new password.
            </p>

            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 items-end">
              {/* old password */}
              <div className="md:col-span-2">
                <label className="block text-xs text-slate-600 mb-1">
                  Current password
                </label>
                <div className=" relative">
                  <input
                    onChange={(e) => setPwOld(e.target.value)}
                    type="passwor"
                    className="hidden"
                  />
                  <input
                    type={showOld ? "text" : "password"}
                    className="w-full px-3 py-2 rounded-md border text-sm md:text-base"
                    value={pwOld}
                    onChange={(e) => setPwOld(e.target.value)}
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOld((s) => !s)}
                    className="absolute h-full right-1 px-2 top-0 text-slate-500"
                  >
                    {showOld ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* new password */}
              <div className="md:col-span-1 relative">
                <label className="block text-xs text-slate-600 mb-1">
                  New password
                </label>
                <input
                  type={showNew ? "text" : "password"}
                  className="w-full px-3 py-2 rounded-md border text-sm md:text-base"
                  value={pwNew}
                  onChange={(e) => setPwNew(e.target.value)}
                  placeholder="New password"
                />
                <button
                  type="button"
                  onClick={() => setShowNew((s) => !s)}
                  className="absolute right-2 top-9 text-slate-500"
                >
                  {showNew ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* confirm password + action */}
              <div className="md:col-span-1 relative flex items-center gap-2">
                <div className="flex-1">
                  <label className="block text-xs text-slate-600 mb-1">
                    Confirm new password
                  </label>
                  <input
                    type={showConfirm ? "text" : "password"}
                    className="w-full px-3 py-2 rounded-md border text-sm md:text-base"
                    value={pwConfirm}
                    onChange={(e) => setPwConfirm(e.target.value)}
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((s) => !s)}
                    className="absolute right-2 top-9 text-slate-500"
                  >
                    {showConfirm ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="ml-2 md:col-span-2 flex justify-end">
                <button
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm ${
                    pwCanSubmit
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-slate-100 text-slate-400 cursor-not-allowed"
                  }`}
                  onClick={handleChangePassword}
                  disabled={!pwCanSubmit || pwProcessing}
                  title={
                    !pwCanSubmit
                      ? "Enter current password and matching new passwords (min 6 chars)"
                      : "Change password"
                  }
                >
                  <Key className="w-4 h-4" />
                  Update
                </button>
              </div>
            </div>

            <div className="mt-2 text-xs text-slate-500">
              {pwNew && pwNew.length > 0 && pwNew.length < 8 && (
                <div className="text-rose-600">
                  New password must be at least 8 characters.
                </div>
              )}
              {pwNew && pwConfirm && pwNew !== pwConfirm && (
                <div className="text-rose-600">New passwords do not match.</div>
              )}
            </div>
          </div>

          {/* footer spacing */}
          <div className="mt-6 flex items-center justify-end">
            {!editing ? null : (
              <div className="flex gap-2">
                <button
                  className="px-4 py-2 rounded-md bg-white border"
                  onClick={handleCancelEdit}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 rounded-md bg-green-600 text-white"
                  onClick={handleSaveProfile}
                  disabled={loading}
                >
                  Save changes
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
