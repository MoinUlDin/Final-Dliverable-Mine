import React, { useEffect, useState, useRef } from "react";
import ProfileServices from "../services/ProfileServices";
import toast from "react-hot-toast";
import { Camera, Edit2, Save, Key, X } from "lucide-react";

type ProfilePayload = {
  first_name?: string;
  last_name?: string;
  // these are readonly on UI but included for completeness
  username?: string;
  email?: string;
  employee_number?: string;
  department?: string;
  picture?: string | null;
  role?: string;
};

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
  const [pwProcessing, setPwProcessing] = useState<boolean>(false);

  const inputFileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    loadProfile();
    // cleanup preview URL on unmount
    return () => {
      if (picturePreview) URL.revokeObjectURL(picturePreview);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // revoke previous
    if (picturePreview) URL.revokeObjectURL(picturePreview);
    const url = URL.createObjectURL(f);
    setPictureFile(f);
    setPicturePreview(url);
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
   * NEW: single UpdateProfile call for both fields and picture.
   * - If pictureFile exists -> use FormData and include fields + file
   * - Otherwise send JSON payload
   */
  function handleSaveProfile() {
    if (!profile) return;
    setLoading(true);

    // build payload: FormData if picture, else JSON
    let payload: FormData | { first_name?: string; last_name?: string };

    if (pictureFile) {
      const fd = new FormData();
      fd.append("first_name", firstName);
      fd.append("last_name", lastName);
      fd.append("picture", pictureFile);
      payload = fd;
    } else {
      payload = { first_name: firstName, last_name: lastName };
    }

    // call ProfileServices.UpdateProfile with dot-notation
    ProfileServices.UpdateProfile(payload)
      .then((res) => {
        toast.success("Profile updated");
        setEditing(false);

        // if backend returned updated profile, use it; otherwise refresh
        if (res && typeof res === "object" && (res as any).first_name) {
          setProfile((p) => ({ ...(p || {}), ...(res as any) }));
        } else {
          // safe fallback — reload profile
          loadProfile();
        }

        // cleanup preview if present
        if (picturePreview) {
          URL.revokeObjectURL(picturePreview);
          setPicturePreview(null);
        }
        setPictureFile(null);
      })
      .catch((err: any) => {
        console.error("UpdateProfile error", err);
        // backend may return { detail } or field errors
        const msg =
          err?.detail ||
          (typeof err === "object" && Object.values(err || {})[0]) ||
          "Failed to update profile";
        toast.error(msg);
      })
      .finally(() => setLoading(false));
  }

  function handleChangePassword() {
    if (!pwOld || !pwNew) {
      toast.error("Provide both old and new password");
      return;
    }
    if (pwNew.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    setPwProcessing(true);
    ProfileServices.ChangePassword({ old_password: pwOld, new_password: pwNew })
      .then(() => {
        toast.success("Password updated");
        setPwOld("");
        setPwNew("");
      })
      .catch((err: any) => {
        console.error("ChangePassword error", err);
        toast.error(err?.detail || "Failed to change password");
      })
      .finally(() => setPwProcessing(false));
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="bg-white shadow-md rounded-2xl overflow-hidden">
        <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6 md:gap-8">
          {/* Left - Avatar */}
          <div className="flex-shrink-0 flex flex-col items-center md:items-start gap-4">
            <div className="relative">
              <img
                src={
                  picturePreview ||
                  (profile as any)?.picture ||
                  "/avatar-placeholder.png"
                }
                alt="Profile"
                // use the size-8 class you requested and responsive variations
                className="size-8 md:size-12 lg:size-16 rounded-full object-cover shadow-sm"
              />
              {/* camera button */}
              <button
                type="button"
                onClick={triggerFilePick}
                className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow border hover:bg-slate-50"
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

            <div className="text-center md:text-left">
              <div className="text-sm md:text-base lg:text-lg font-semibold text-slate-800">
                {profile ? `${profile.first_name} ${profile.last_name}` : "—"}
              </div>
              <div className="text-xs md:text-sm text-slate-500">
                {profile?.role}
              </div>
            </div>
          </div>

          {/* Right - Details */}
          <div className="flex-1">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-base md:text-xl lg:text-2xl font-bold text-slate-800">
                  My Profile
                </h2>
                <p className="text-xs md:text-sm text-slate-500 mt-1">
                  Update your information. Some fields cannot be changed.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {!editing ? (
                  <button
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-sm"
                    onClick={() => setEditing(true)}
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                ) : (
                  <>
                    <button
                      className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-green-600 text-white text-sm hover:bg-green-700"
                      onClick={handleSaveProfile}
                      disabled={loading}
                    >
                      <Save className="w-4 h-4" />
                      Save
                    </button>
                    <button
                      className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white border text-sm"
                      onClick={handleCancelEdit}
                      disabled={loading}
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* form */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <div className="mt-4 text-sm text-slate-600">
                <div>New picture ready to upload</div>
              </div>
            ) : null}

            {/* password change box */}
            <div className="mt-6 border-t pt-4">
              <h3 className="text-sm md:text-base font-medium text-slate-800">
                Change password
              </h3>
              <p className="text-xs md:text-sm text-slate-500 mt-1">
                Provide your old password and a new password to update.
              </p>

              <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                <div className="md:col-span-1">
                  <label className="block text-xs text-slate-600 mb-1">
                    Old password
                  </label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 rounded-md border text-sm md:text-base"
                    value={pwOld}
                    onChange={(e) => setPwOld(e.target.value)}
                  />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-xs text-slate-600 mb-1">
                    New password
                  </label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 rounded-md border text-sm md:text-base"
                    value={pwNew}
                    onChange={(e) => setPwNew(e.target.value)}
                  />
                </div>

                <div className="md:col-span-1 flex items-center gap-2">
                  <button
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700"
                    onClick={handleChangePassword}
                    disabled={pwProcessing}
                  >
                    <Key className="w-4 h-4" />
                    Update password
                  </button>
                </div>
              </div>
            </div>

            {/* small footer actions */}
            <div className="mt-6 flex items-center justify-between">
              <div className="text-xs text-slate-500">
                Last synced:{" "}
                <span className="font-medium">
                  {/* optionally show timestamp */}—
                </span>
              </div>

              <div className="flex items-center gap-3">
                {editing ? (
                  <button
                    className="px-3 py-2 rounded-md bg-white border text-sm"
                    onClick={handleCancelEdit}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                ) : null}

                <button
                  className="px-3 py-2 rounded-md bg-slate-100 hover:bg-slate-200 text-sm"
                  onClick={loadProfile}
                >
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
