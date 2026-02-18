const REMOTIVE_BASE_URL = 'https://remotive.com/api/remote-jobs';

const COMMON_ROLE_REGEX =
  /\b(software engineer|frontend developer|backend developer|full stack developer|data engineer|data scientist|machine learning engineer|devops engineer|product manager|qa engineer|ui\/ux designer)\b/i;

const sanitizeTerm = (value) =>
  (value || '')
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const buildSearchTerms = ({ analysis, jobDescription }) => {
  const terms = [];

  const roleMatch = jobDescription.match(COMMON_ROLE_REGEX);
  if (roleMatch?.[1]) {
    terms.push(roleMatch[1]);
  }

  const fromAnalysis = [
    ...(analysis?.missing_skills || []),
    ...(analysis?.keyword_gaps || []),
    ...(analysis?.strengths || []),
  ];

  for (const item of fromAnalysis) {
    const cleaned = sanitizeTerm(item);
    if (!cleaned) continue;
    // Keep search focused to avoid noisy market results.
    terms.push(cleaned.split(',')[0]);
  }

  const unique = Array.from(new Set(terms.filter((t) => t.length >= 3)));
  return unique.slice(0, 3);
};

const fetchJobsByTerm = async (term) => {
  const endpoint = `${REMOTIVE_BASE_URL}?search=${encodeURIComponent(term)}`;
  const response = await fetch(endpoint);
  if (!response.ok) return [];

  const payload = await response.json();
  if (!Array.isArray(payload?.jobs)) return [];

  return payload.jobs;
};

export const fetchLatestRelevantOpenPositions = async ({ analysis, jobDescription }) => {
  const searchTerms = buildSearchTerms({ analysis, jobDescription });
  if (searchTerms.length === 0) {
    return [];
  }

  const jobsMap = new Map();
  for (const term of searchTerms) {
    try {
      const jobs = await fetchJobsByTerm(term);
      for (const job of jobs) {
        if (!job?.id || !job?.url || !job?.title) continue;
        jobsMap.set(job.id, job);
      }
    } catch {
      // Ignore upstream fetch failures and continue with partial results.
    }
  }

  const normalized = Array.from(jobsMap.values())
    .sort((a, b) => new Date(b.publication_date) - new Date(a.publication_date))
    .slice(0, 5)
    .map((job) => ({
      id: job.id,
      title: job.title,
      company_name: job.company_name || 'Unknown Company',
      location: job.candidate_required_location || 'Not specified',
      publication_date: job.publication_date,
      url: job.url,
      source: 'Remotive',
    }));

  return normalized;
};

