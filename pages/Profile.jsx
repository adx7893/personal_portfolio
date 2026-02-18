import React, { useMemo, useState } from 'react';
import {
  Camera,
  Download,
  Edit3,
  FileText,
  Lock,
  MapPin,
  Upload,
  UserCircle2,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getAuthToken, uploadFileApi } from '../services/authApi';

const FALLBACK_BANNER =
  'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1400&q=80';

const DEFAULT_HIGHLIGHTS = [
  {
    id: 'h1',
    title: 'Portfolio Redesign',
    type: 'Side Project',
    image:
      'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'h2',
    title: 'System Design Cert',
    type: 'Certification',
    image:
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'h3',
    title: 'Job Tracker Repo',
    type: 'GitHub',
    image:
      'https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'h4',
    title: 'AI Resume Analyzer',
    type: 'Case Study',
    image:
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'h5',
    title: 'Interview Prep Board',
    type: 'Workflow',
    image:
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'h6',
    title: 'NLP Mini App',
    type: 'Demo',
    image:
      'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&w=900&q=80',
  },
];

const Profile = () => {
  const { user, updateProfile, changePassword, isAuthenticated } = useAuth();
  const isOwner = Boolean(isAuthenticated);

  const [isPublicView, setIsPublicView] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState({ profile: false, resume: false });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || 'Ava',
    lastName: user?.lastName || 'Patel',
    headline: user?.preferences?.headline || 'Full-Stack Engineer',
    location: user?.preferences?.preferredLocation || 'San Francisco, CA',
    about:
      user?.preferences?.about ||
      'Engineer focused on building practical career tools. I work across frontend, backend, and AI workflows to deliver products that are simple to use and measurable in impact.',
    profilePicture: user?.profilePicture || '',
    bannerImage: user?.preferences?.bannerImage || FALLBACK_BANNER,
    resumeFile: user?.resumeFile || '',
    remoteOnly: user?.preferences?.remoteOnly !== false,
    skills: user?.preferences?.skills || [
      'React',
      'Node.js',
      'MongoDB',
      'TypeScript',
      'Tailwind CSS',
      'AI Integrations',
    ],
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [stats] = useState({
    jobsTracked: 24,
    interviews: 3,
    offers: 1,
  });

  const [highlights, setHighlights] = useState(DEFAULT_HIGHLIGHTS);

  const fullName = useMemo(
    () => `${profileForm.firstName} ${profileForm.lastName}`.trim(),
    [profileForm.firstName, profileForm.lastName]
  );

  const onUpload = async (field, file) => {
    if (!file) return;
    setError('');
    setMessage('');
    setUploading((prev) => ({ ...prev, [field]: true }));
    try {
      const token = getAuthToken();
      const uploaded = await uploadFileApi(token, file);
      const fileUrl = uploaded.url?.startsWith('http')
        ? uploaded.url
        : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}${uploaded.url}`;

      if (field === 'profile') {
        setProfileForm((prev) => ({ ...prev, profilePicture: fileUrl }));
      } else {
        setProfileForm((prev) => ({ ...prev, resumeFile: fileUrl }));
      }
      setMessage(field === 'profile' ? 'Profile photo updated.' : 'Resume uploaded.');
    } catch (err) {
      setError(err.message || 'Upload failed.');
    } finally {
      setUploading((prev) => ({ ...prev, [field]: false }));
    }
  };

  const onSaveProfile = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      await updateProfile({
        firstName: profileForm.firstName,
        lastName: profileForm.lastName,
        profilePicture: profileForm.profilePicture,
        resumeFile: profileForm.resumeFile,
        preferences: {
          preferredLocation: profileForm.location,
          roleCategory: profileForm.headline,
          remoteOnly: profileForm.remoteOnly,
          about: profileForm.about,
          headline: profileForm.headline,
          bannerImage: profileForm.bannerImage,
          skills: profileForm.skills,
        },
      });
      setMessage('Profile updated successfully.');
      setShowEditModal(false);
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const onChangePassword = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New password and confirm password must match.');
      return;
    }
    setLoading(true);
    try {
      await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setMessage('Password changed successfully.');
    } catch (err) {
      setError(err.message || 'Failed to change password.');
    } finally {
      setLoading(false);
    }
  };

  const addHighlight = (file) => {
    if (!file) return;
    const image = URL.createObjectURL(file);
    const id = `h${Date.now()}`;
    setHighlights((prev) => [
      {
        id,
        title: 'New Highlight',
        type: 'Portfolio',
        image,
      },
      ...prev,
    ]);
  };

  return (
    <section className="mt-20 mb-12">
      <div className="max-w-6xl mx-auto space-y-6">
        <article className="rounded-3xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md shadow-sm">
          <div
            className="h-44 sm:h-56 md:h-64 bg-cover bg-center"
            style={{ backgroundImage: `url('${profileForm.bannerImage || FALLBACK_BANNER}')` }}
          />
          <div className="px-5 sm:px-8 pb-7">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-14 sm:-mt-16 gap-4">
              <div className="flex items-end gap-4">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white dark:border-zinc-900 bg-zinc-200 dark:bg-zinc-800 overflow-hidden shadow-lg">
                  {profileForm.profilePicture ? (
                    <img src={profileForm.profilePicture} alt={fullName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <UserCircle2 className="w-14 h-14 text-zinc-500" />
                    </div>
                  )}
                </div>
                <div className="pb-1">
                  <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">{fullName}</h1>
                  <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-300">{profileForm.headline}</p>
                  <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 inline-flex items-center gap-1.5 mt-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {profileForm.location}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                  {profileForm.remoteOnly ? 'Remote Only' : 'Open to Hybrid/Onsite'}
                </span>
                {isOwner && (
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono uppercase tracking-wide"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit Profile
                  </button>
                )}
              </div>
            </div>

            {isOwner && (
              <div className="mt-4">
                <button
                  onClick={() => setIsPublicView((prev) => !prev)}
                  className="text-xs px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  {isPublicView ? 'Switch to Owner View' : 'Switch to Public View'}
                </button>
              </div>
            )}
          </div>
        </article>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-5">
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 p-5">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">About Me</h2>
              <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">{profileForm.about}</p>
            </div>

            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 p-5">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Highlights</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Projects, certifications, repositories, and portfolio moments.
              </p>

              {isOwner && !isPublicView && (
                <label className="mt-4 inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 hover:border-indigo-500 cursor-pointer text-xs">
                  <Upload className="w-4 h-4" />
                  Add Highlight
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => addHighlight(e.target.files?.[0])} />
                </label>
              )}

              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                {highlights.map((item) => (
                  <div key={item.id} className="group relative rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
                    <img src={item.image} alt={item.title} className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
                      <p className="text-xs text-white font-medium truncate">{item.title}</p>
                      <p className="text-[10px] text-zinc-200">{item.type}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 p-5">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Fast Facts
              </h3>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-zinc-100 dark:bg-zinc-800 p-3">
                  <p className="text-xl font-bold">{stats.jobsTracked}</p>
                  <p className="text-[11px] text-zinc-500">Jobs Tracked</p>
                </div>
                <div className="rounded-xl bg-zinc-100 dark:bg-zinc-800 p-3">
                  <p className="text-xl font-bold">{stats.interviews}</p>
                  <p className="text-[11px] text-zinc-500">Interviews</p>
                </div>
                <div className="rounded-xl bg-zinc-100 dark:bg-zinc-800 p-3">
                  <p className="text-xl font-bold">{stats.offers}</p>
                  <p className="text-[11px] text-zinc-500">Offers</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 p-5">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Resume</h3>
              <div className="mt-3 rounded-xl border border-indigo-300/50 bg-indigo-50/70 dark:bg-indigo-900/20 dark:border-indigo-700/40 p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate">
                      {profileForm.resumeFile ? 'Resume Uploaded' : 'No Resume Uploaded'}
                    </p>
                    <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-1">
                      PDF/DOCX ready for recruiters and hiring managers.
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <a
                    href={profileForm.resumeFile || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium ${
                      profileForm.resumeFile
                        ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.35)]'
                        : 'bg-zinc-300 text-zinc-600 cursor-not-allowed'
                    }`}
                  >
                    <Download className="w-4 h-4" />
                    View Resume
                  </a>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 p-5">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Top Skills</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {profileForm.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 rounded-full text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showEditModal && isOwner && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm p-4 flex items-center justify-center">
          <div className="w-full max-w-2xl rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Edit Profile</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={onSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  value={profileForm.firstName}
                  onChange={(e) => setProfileForm((p) => ({ ...p, firstName: e.target.value }))}
                  placeholder="First name"
                  className="rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50/70 dark:bg-zinc-950/40 px-4 py-3 text-sm"
                />
                <input
                  value={profileForm.lastName}
                  onChange={(e) => setProfileForm((p) => ({ ...p, lastName: e.target.value }))}
                  placeholder="Last name"
                  className="rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50/70 dark:bg-zinc-950/40 px-4 py-3 text-sm"
                />
                <input
                  value={profileForm.headline}
                  onChange={(e) => setProfileForm((p) => ({ ...p, headline: e.target.value }))}
                  placeholder="Professional headline"
                  className="rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50/70 dark:bg-zinc-950/40 px-4 py-3 text-sm sm:col-span-2"
                />
                <input
                  value={profileForm.location}
                  onChange={(e) => setProfileForm((p) => ({ ...p, location: e.target.value }))}
                  placeholder="Location"
                  className="rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50/70 dark:bg-zinc-950/40 px-4 py-3 text-sm"
                />
                <input
                  value={profileForm.bannerImage}
                  onChange={(e) => setProfileForm((p) => ({ ...p, bannerImage: e.target.value }))}
                  placeholder="Banner image URL"
                  className="rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50/70 dark:bg-zinc-950/40 px-4 py-3 text-sm"
                />
                <textarea
                  value={profileForm.about}
                  onChange={(e) => setProfileForm((p) => ({ ...p, about: e.target.value }))}
                  rows={4}
                  placeholder="About me"
                  className="rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50/70 dark:bg-zinc-950/40 px-4 py-3 text-sm sm:col-span-2"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 hover:border-indigo-500 cursor-pointer text-xs">
                  <Camera className="w-4 h-4" />
                  {uploading.profile ? 'Uploading photo...' : 'Upload Profile Photo'}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => onUpload('profile', e.target.files?.[0] || null)}
                    disabled={uploading.profile}
                  />
                </label>

                <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 hover:border-indigo-500 cursor-pointer text-xs">
                  <Upload className="w-4 h-4" />
                  {uploading.resume ? 'Uploading resume...' : 'Upload Resume (PDF/DOCX)'}
                  <input
                    type="file"
                    accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    className="hidden"
                    onChange={(e) => onUpload('resume', e.target.files?.[0] || null)}
                    disabled={uploading.resume}
                  />
                </label>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm disabled:opacity-60"
                >
                  Save Changes
                </button>
              </div>
            </form>

            <form onSubmit={onChangePassword} className="border-t border-zinc-200 dark:border-zinc-800 pt-4 space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400 inline-flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Change Password
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))}
                  placeholder="Current Password"
                  className="rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50/70 dark:bg-zinc-950/40 px-4 py-3 text-sm"
                />
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))}
                  placeholder="New Password"
                  className="rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50/70 dark:bg-zinc-950/40 px-4 py-3 text-sm"
                />
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                  placeholder="Confirm Password"
                  className="rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50/70 dark:bg-zinc-950/40 px-4 py-3 text-sm"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 text-sm disabled:opacity-60"
                >
                  Update Password
                </button>
              </div>
            </form>

            {message && <p className="text-sm text-emerald-600 dark:text-emerald-400">{message}</p>}
            {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
          </div>
        </div>
      )}
    </section>
  );
};

export { Profile };

