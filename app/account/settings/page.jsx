"use client";

import { useMemo, useState } from "react";
import {
  Bell,
  ChevronRight,
  Copy,
  Download,
  Eye,
  EyeOff,
  Github,
  KeyRound,
  Link as LinkIcon,
  Linkedin,
  Lock,
  LogOut,
  Mail,
  MapPin,
  Monitor,
  Moon,
  Phone,
  ShieldCheck,
  Sun,
  Trash2,
  UploadCloud,
  UserCircle2,
} from "lucide-react";

const TABS = [
  { id: "profile", label: "Profile", hint: "Public info" },
  { id: "security", label: "Security", hint: "Auth & sessions" },
  { id: "preferences", label: "Preferences", hint: "Theme & alerts" },
  { id: "developer", label: "Developer", hint: "API & integrations" },
  { id: "privacy", label: "Privacy", hint: "Data & danger zone" },
];

const initialProfile = {
  firstName: "Ava",
  lastName: "Patel",
  phone: "+1 (415) 555-0192",
  location: "San Francisco, CA",
  linkedin: "https://www.linkedin.com/in/ava-patel",
  github: "https://github.com/avapatel",
  portfolio: "https://avapatel.dev",
};

const initialNotifications = {
  weeklyRecommendations: true,
  applicationUpdates: true,
  marketingUpdates: false,
};

const initialConnected = [
  { provider: "Google", connected: true },
  { provider: "GitHub", connected: true },
  { provider: "LinkedIn", connected: false },
];

const initialSessions = [
  {
    id: "s1",
    device: "MacBook Pro - Chrome",
    location: "San Francisco, CA",
    ip: "73.162.10.42",
    lastActive: "Just now",
    current: true,
  },
  {
    id: "s2",
    device: "iPhone 15 - Safari",
    location: "San Francisco, CA",
    ip: "73.162.10.42",
    lastActive: "2 hours ago",
    current: false,
  },
  {
    id: "s3",
    device: "Windows 11 - Edge",
    location: "Austin, TX",
    ip: "162.210.44.11",
    lastActive: "3 days ago",
    current: false,
  },
];

function Card({ title, subtitle, children, right }) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{title}</h2>
          {subtitle ? (
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{subtitle}</p>
          ) : null}
        </div>
        {right}
      </div>
      {children}
    </section>
  );
}

function Switch({ enabled, onChange }) {
  return (
    <button
      type="button"
      aria-pressed={enabled}
      onClick={() => onChange(!enabled)}
      className={`relative h-6 w-11 rounded-full transition ${
        enabled ? "bg-indigo-600" : "bg-zinc-300 dark:bg-zinc-700"
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
          enabled ? "left-5" : "left-0.5"
        }`}
      />
    </button>
  );
}

function Field({ label, icon, children }) {
  return (
    <label className="space-y-2">
      <span className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        {icon}
        {label}
      </span>
      {children}
    </label>
  );
}

function TextInput(props) {
  return (
    <input
      {...props}
      className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none ring-indigo-500 transition placeholder:text-zinc-400 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
    />
  );
}

export default function AccountSettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [profile, setProfile] = useState(initialProfile);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [connected, setConnected] = useState(initialConnected);
  const [sessions, setSessions] = useState(initialSessions);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [theme, setTheme] = useState("system");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [tokenValue, setTokenValue] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");

  const emailVerified = true;
  const userEmail = "ava.patel@careerhub.io";

  const tokenPreview = useMemo(() => {
    if (!tokenValue) return "No active personal access token";
    if (showToken) return tokenValue;
    return `${tokenValue.slice(0, 8)}••••••••••••••••${tokenValue.slice(-6)}`;
  }, [tokenValue, showToken]);

  const uploadAvatar = (file) => {
    if (!file) return;
    const next = URL.createObjectURL(file);
    setAvatarUrl(next);
  };

  const onDropAvatar = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    uploadAvatar(file);
  };

  const handleCopy = async () => {
    if (!tokenValue) return;
    await navigator.clipboard.writeText(tokenValue);
  };

  const generateToken = () => {
    const token = `pat_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
    setTokenValue(token);
    setShowToken(false);
  };

  const revokeToken = () => {
    setTokenValue("");
    setShowToken(false);
  };

  const logoutOtherDevices = () => {
    setSessions((prev) => prev.filter((session) => session.current));
  };

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-6 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Account Settings</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Manage your profile, security, preferences, integrations, and privacy controls.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="h-fit rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 lg:sticky lg:top-6">
            <nav className="flex gap-2 overflow-x-auto lg:flex-col">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`group flex min-w-[170px] items-center justify-between rounded-xl px-3 py-2.5 text-left transition lg:min-w-0 ${
                    activeTab === tab.id
                      ? "bg-indigo-600 text-white"
                      : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
                  }`}
                >
                  <span>
                    <span className="block text-sm font-medium">{tab.label}</span>
                    <span
                      className={`block text-xs ${
                        activeTab === tab.id ? "text-indigo-100" : "text-zinc-500 dark:text-zinc-400"
                      }`}
                    >
                      {tab.hint}
                    </span>
                  </span>
                  <ChevronRight className="h-4 w-4 opacity-75" />
                </button>
              ))}
            </nav>
          </aside>

          <section className="space-y-5">
            {activeTab === "profile" && (
              <>
                <Card title="Public / Basic Profile" subtitle="This information appears across your account.">
                  <div className="grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)]">
                    <div>
                      <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={onDropAvatar}
                        className="flex h-52 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-300 bg-zinc-50 p-4 text-center dark:border-zinc-700 dark:bg-zinc-950"
                      >
                        {avatarUrl ? (
                          <img src={avatarUrl} alt="Avatar preview" className="h-20 w-20 rounded-full object-cover" />
                        ) : (
                          <UserCircle2 className="h-14 w-14 text-zinc-400" />
                        )}
                        <p className="mt-3 text-sm font-medium">Drag & drop avatar</p>
                        <p className="mt-1 text-xs text-zinc-500">PNG/JPG up to 2MB</p>
                        <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-medium text-white hover:bg-indigo-500">
                          <UploadCloud className="h-4 w-4" />
                          Upload Image
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => uploadAvatar(e.target.files?.[0])}
                          />
                        </label>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="First Name" icon={<UserCircle2 className="h-3.5 w-3.5" />}>
                        <TextInput
                          value={profile.firstName}
                          onChange={(e) => setProfile((p) => ({ ...p, firstName: e.target.value }))}
                        />
                      </Field>
                      <Field label="Last Name" icon={<UserCircle2 className="h-3.5 w-3.5" />}>
                        <TextInput
                          value={profile.lastName}
                          onChange={(e) => setProfile((p) => ({ ...p, lastName: e.target.value }))}
                        />
                      </Field>
                      <Field label="Phone Number" icon={<Phone className="h-3.5 w-3.5" />}>
                        <TextInput
                          value={profile.phone}
                          onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                        />
                      </Field>
                      <Field label="Location" icon={<MapPin className="h-3.5 w-3.5" />}>
                        <TextInput
                          value={profile.location}
                          onChange={(e) => setProfile((p) => ({ ...p, location: e.target.value }))}
                        />
                      </Field>
                      <Field label="LinkedIn URL" icon={<Linkedin className="h-3.5 w-3.5" />}>
                        <TextInput
                          value={profile.linkedin}
                          onChange={(e) => setProfile((p) => ({ ...p, linkedin: e.target.value }))}
                        />
                      </Field>
                      <Field label="GitHub URL" icon={<Github className="h-3.5 w-3.5" />}>
                        <TextInput
                          value={profile.github}
                          onChange={(e) => setProfile((p) => ({ ...p, github: e.target.value }))}
                        />
                      </Field>
                      <Field label="Portfolio URL" icon={<LinkIcon className="h-3.5 w-3.5" />}>
                        <TextInput
                          value={profile.portfolio}
                          onChange={(e) => setProfile((p) => ({ ...p, portfolio: e.target.value }))}
                        />
                      </Field>
                    </div>
                  </div>
                </Card>
              </>
            )}

            {activeTab === "security" && (
              <>
                <Card
                  title="Authentication & Security"
                  subtitle="Protect your account with strong authentication controls."
                >
                  <div className="space-y-6">
                    <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium">Email Address</p>
                          <p className="text-sm text-zinc-500">{userEmail}</p>
                        </div>
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            emailVerified
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                              : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                          }`}
                        >
                          {emailVerified ? "Verified" : "Unverified"}
                        </span>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      <Field label="Current Password" icon={<Lock className="h-3.5 w-3.5" />}>
                        <TextInput type="password" placeholder="••••••••" />
                      </Field>
                      <Field label="New Password" icon={<Lock className="h-3.5 w-3.5" />}>
                        <TextInput type="password" placeholder="Min. 8 characters" />
                      </Field>
                      <Field label="Confirm Password" icon={<Lock className="h-3.5 w-3.5" />}>
                        <TextInput type="password" placeholder="Repeat password" />
                      </Field>
                    </div>
                    <button className="rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300">
                      Update Password
                    </button>

                    <div className="flex items-center justify-between rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
                      <div className="flex items-start gap-3">
                        <ShieldCheck className="mt-0.5 h-5 w-5 text-indigo-600" />
                        <div>
                          <p className="text-sm font-medium">Two-Factor Authentication (2FA)</p>
                          <p className="text-xs text-zinc-500">Require OTP during sign-in for extra security.</p>
                        </div>
                      </div>
                      <Switch enabled={twoFactorEnabled} onChange={setTwoFactorEnabled} />
                    </div>
                  </div>
                </Card>

                <Card title="Connected Accounts" subtitle="Link OAuth providers for faster sign-in.">
                  <div className="space-y-3">
                    {connected.map((item) => (
                      <div
                        key={item.provider}
                        className="flex items-center justify-between rounded-xl border border-zinc-200 p-3 dark:border-zinc-800"
                      >
                        <div className="flex items-center gap-3">
                          {item.provider === "Google" ? (
                            <Mail className="h-4 w-4 text-rose-500" />
                          ) : item.provider === "GitHub" ? (
                            <Github className="h-4 w-4" />
                          ) : (
                            <Linkedin className="h-4 w-4 text-sky-500" />
                          )}
                          <p className="text-sm font-medium">{item.provider}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setConnected((prev) =>
                              prev.map((x) =>
                                x.provider === item.provider ? { ...x, connected: !x.connected } : x
                              )
                            )
                          }
                          className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                            item.connected
                              ? "bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200"
                              : "bg-indigo-600 text-white hover:bg-indigo-500"
                          }`}
                        >
                          {item.connected ? "Disconnect" : "Connect"}
                        </button>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card
                  title="Active Sessions"
                  subtitle="Review where your account is logged in."
                  right={
                    <button
                      onClick={logoutOtherDevices}
                      className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 px-3 py-2 text-xs font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
                    >
                      <LogOut className="h-4 w-4" />
                      Log out of all other devices
                    </button>
                  }
                >
                  <div className="space-y-3">
                    {sessions.map((session) => (
                      <div
                        key={session.id}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-200 p-3 dark:border-zinc-800"
                      >
                        <div>
                          <p className="text-sm font-medium">{session.device}</p>
                          <p className="text-xs text-zinc-500">
                            {session.location} • {session.ip}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          {session.current ? (
                            <span className="rounded-full bg-emerald-100 px-2 py-1 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                              Current Session
                            </span>
                          ) : null}
                          <span className="rounded-full bg-zinc-100 px-2 py-1 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                            {session.lastActive}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </>
            )}

            {activeTab === "preferences" && (
              <>
                <Card title="App Preferences & Notifications" subtitle="Customize how the platform behaves for you.">
                  <div className="space-y-6">
                    <div>
                      <p className="mb-3 text-sm font-medium">Theme</p>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                        {[
                          { id: "light", label: "Light", icon: <Sun className="h-4 w-4" /> },
                          { id: "dark", label: "Dark", icon: <Moon className="h-4 w-4" /> },
                          { id: "system", label: "System", icon: <Monitor className="h-4 w-4" /> },
                        ].map((option) => (
                          <button
                            key={option.id}
                            onClick={() => setTheme(option.id)}
                            className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm ${
                              theme === option.id
                                ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300"
                                : "border-zinc-300 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
                            }`}
                          >
                            {option.icon}
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="mb-3 flex items-center gap-2 text-sm font-medium">
                        <Bell className="h-4 w-4" />
                        Email Notifications
                      </p>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between rounded-xl border border-zinc-200 p-3 dark:border-zinc-800">
                          <p className="text-sm">Weekly job recommendations</p>
                          <Switch
                            enabled={notifications.weeklyRecommendations}
                            onChange={(v) =>
                              setNotifications((n) => ({ ...n, weeklyRecommendations: v }))
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between rounded-xl border border-zinc-200 p-3 dark:border-zinc-800">
                          <p className="text-sm">Application status updates</p>
                          <Switch
                            enabled={notifications.applicationUpdates}
                            onChange={(v) =>
                              setNotifications((n) => ({ ...n, applicationUpdates: v }))
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between rounded-xl border border-zinc-200 p-3 dark:border-zinc-800">
                          <p className="text-sm">Marketing & product updates</p>
                          <Switch
                            enabled={notifications.marketingUpdates}
                            onChange={(v) => setNotifications((n) => ({ ...n, marketingUpdates: v }))}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </>
            )}

            {activeTab === "developer" && (
              <>
                <Card
                  title="Integrations & Developer"
                  subtitle="Use Personal Access Tokens to connect with n8n, Zapier, or custom webhooks."
                >
                  <div className="space-y-4">
                    <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
                      <p className="text-sm font-medium">Personal Access Token</p>
                      <p className="mt-1 text-xs text-zinc-500">
                        Scope: read jobs, write applications, trigger webhook automations.
                      </p>
                      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                        <div className="flex-1 rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 text-xs font-mono dark:border-zinc-700 dark:bg-zinc-950">
                          {tokenPreview}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setShowToken((v) => !v)}
                            disabled={!tokenValue}
                            className="rounded-lg border border-zinc-300 px-3 py-2 text-xs disabled:opacity-50 dark:border-zinc-700"
                          >
                            {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={handleCopy}
                            disabled={!tokenValue}
                            className="rounded-lg border border-zinc-300 px-3 py-2 text-xs disabled:opacity-50 dark:border-zinc-700"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={generateToken}
                        className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-500"
                      >
                        <KeyRound className="h-4 w-4" />
                        Generate New Token
                      </button>
                      <button
                        onClick={revokeToken}
                        className="rounded-xl border border-zinc-300 px-4 py-2.5 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
                      >
                        Revoke Token
                      </button>
                    </div>
                  </div>
                </Card>
              </>
            )}

            {activeTab === "privacy" && (
              <>
                <Card title="Data & Privacy" subtitle="Export your data and manage account removal.">
                  <div className="space-y-5">
                    <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
                      <p className="text-sm font-medium">Export My Data</p>
                      <p className="mt-1 text-xs text-zinc-500">
                        Download your job tracker history, saved jobs, and profile settings.
                      </p>
                      <div className="mt-3 flex gap-2">
                        <button className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 px-3 py-2 text-sm hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800">
                          <Download className="h-4 w-4" />
                          Export JSON
                        </button>
                        <button className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 px-3 py-2 text-sm hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800">
                          <Download className="h-4 w-4" />
                          Export CSV
                        </button>
                      </div>
                    </div>

                    <div className="rounded-xl border border-red-300 bg-red-50 p-4 dark:border-red-900/40 dark:bg-red-900/10">
                      <p className="text-sm font-semibold text-red-700 dark:text-red-300">Danger Zone</p>
                      <p className="mt-1 text-xs text-red-700/80 dark:text-red-300/80">
                        Deleting your account permanently removes profile, applications, and saved data.
                      </p>
                      <button
                        onClick={() => setShowDeleteModal(true)}
                        className="mt-3 inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete Account
                      </button>
                    </div>
                  </div>
                </Card>
              </>
            )}
          </section>
        </div>
      </div>

      {showDeleteModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-5 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="text-lg font-semibold">Confirm Account Deletion</h3>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              Type <span className="font-mono font-semibold">DELETE</span> to confirm. This action cannot be undone.
            </p>
            <TextInput
              value={deleteInput}
              onChange={(e) => setDeleteInput(e.target.value)}
              placeholder="Type DELETE"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteInput("");
                }}
                className="rounded-lg border border-zinc-300 px-3 py-2 text-sm hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                disabled={deleteInput !== "DELETE"}
                className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

