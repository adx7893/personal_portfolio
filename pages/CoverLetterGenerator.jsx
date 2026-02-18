import React, { useState } from 'react';
import {
  Copy,
  Download,
  FileText,
  LoaderCircle,
  Sparkles,
  Upload,
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { COVER_LETTER_TONES, generateCoverLetterApi } from '../services/coverLetterApi';

const downloadAsPdf = (fileName, text) => {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const margin = 48;
  const width = doc.internal.pageSize.getWidth() - margin * 2;
  const lines = doc.splitTextToSize(text, width);
  let y = 64;

  doc.setFont('times', 'normal');
  doc.setFontSize(11);

  lines.forEach((line) => {
    if (y > doc.internal.pageSize.getHeight() - 64) {
      doc.addPage();
      y = 64;
    }
    doc.text(line, margin, y);
    y += 17;
  });

  doc.save(`${fileName}.pdf`);
};

const downloadAsDocx = async (fileName, text) => {
  const paragraphs = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map(
      (line) =>
        new Paragraph({
          children: [new TextRun({ text: line, size: 24 })],
          spacing: { after: 200 },
        })
    );

  const doc = new Document({
    sections: [{ properties: {}, children: paragraphs }],
  });

  const blob = await Packer.toBlob(doc);
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${fileName}.docx`;
  link.click();
  URL.revokeObjectURL(link.href);
};

const CoverLetterGenerator = () => {
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [tone, setTone] = useState('Professional');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [matchedSkills, setMatchedSkills] = useState([]);
  const [suggestedImprovements, setSuggestedImprovements] = useState([]);

  const handleGenerate = async (event) => {
    event.preventDefault();
    setError('');
    if (!company.trim() || !role.trim()) {
      setError('Company and role are required.');
      return;
    }
    if (jobDescription.trim().length < 60) {
      setError('Job description must be at least 60 characters.');
      return;
    }
    if (!resumeText.trim() && !resumeFile) {
      setError('Provide resume text or upload resume PDF/DOCX.');
      return;
    }

    setIsLoading(true);
    try {
      const application = {
        id: crypto.randomUUID(),
        company: company.trim(),
        role: role.trim(),
        description: jobDescription.trim(),
      };

      const result = await generateCoverLetterApi({
        application,
        tone,
        resumeText: resumeText.trim(),
        resumeFile,
      });

      setCoverLetter(result.coverLetter || '');
      setMatchedSkills(result.matchedSkills || []);
      setSuggestedImprovements(result.suggestedImprovements || []);
    } catch (apiError) {
      setError(apiError.message || 'Failed to generate cover letter.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="mt-24 mb-12">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight text-zinc-900 dark:text-white">
            AI Cover Letter Generator
          </h1>
          <p className="mt-3 text-zinc-600 dark:text-zinc-300 max-w-3xl">
            Generate a job-specific cover letter using job description, resume context, and tone preference.
          </p>
        </div>

        <form
          onSubmit={handleGenerate}
          className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 md:p-6 space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Company name"
              required
              className="rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50/70 dark:bg-zinc-950/40 px-4 py-3 text-sm"
            />
            <input
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Role title"
              required
              className="rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50/70 dark:bg-zinc-950/40 px-4 py-3 text-sm"
            />
          </div>

          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={7}
            placeholder="Paste full job description"
            className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50/70 dark:bg-zinc-950/40 px-4 py-3 text-sm"
          />

          <textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            rows={5}
            placeholder="Paste resume text (optional if uploading file)"
            className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50/70 dark:bg-zinc-950/40 px-4 py-3 text-sm"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="text-xs text-zinc-600 dark:text-zinc-300">
              <span className="inline-flex items-center gap-1 mb-1">
                <Upload className="w-3.5 h-3.5" />
                Upload resume (PDF/DOCX)
              </span>
              <input
                type="file"
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm"
              />
            </label>

            <label className="text-xs text-zinc-600 dark:text-zinc-300">
              <span className="inline-flex items-center gap-1 mb-1">Tone</span>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm"
              >
                {COVER_LETTER_TONES.map((toneOption) => (
                  <option key={toneOption} value={toneOption}>
                    {toneOption}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-mono text-xs uppercase tracking-widest w-full sm:w-auto"
          >
            {isLoading ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {isLoading ? 'Generating...' : 'Generate Cover Letter'}
          </button>

          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        </form>

        <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 md:p-6 space-y-4">
          <h2 className="text-sm font-mono uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
            Generated Letter
          </h2>

          <textarea
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            rows={14}
            placeholder="Generated cover letter will appear here..."
            className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-3 text-sm leading-relaxed"
          />

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(coverLetter)}
              disabled={!coverLetter}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 disabled:opacity-50 text-xs font-mono uppercase tracking-wider"
            >
              <Copy className="w-3.5 h-3.5" />
              Copy
            </button>
            <button
              type="button"
              onClick={() => downloadAsPdf(`${company || 'company'}-${role || 'role'}-cover-letter`, coverLetter)}
              disabled={!coverLetter}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-mono uppercase tracking-wider"
            >
              <Download className="w-3.5 h-3.5" />
              Download PDF
            </button>
            <button
              type="button"
              onClick={() => downloadAsDocx(`${company || 'company'}-${role || 'role'}-cover-letter`, coverLetter)}
              disabled={!coverLetter}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-mono uppercase tracking-wider"
            >
              <Download className="w-3.5 h-3.5" />
              Download DOCX
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div>
              <p className="font-mono uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-1 inline-flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" />
                Matched Skills
              </p>
              <div className="flex flex-wrap gap-1.5">
                {matchedSkills.length === 0 ? (
                  <span className="text-zinc-500 dark:text-zinc-400">No skills returned.</span>
                ) : (
                  matchedSkills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                    >
                      {skill}
                    </span>
                  ))
                )}
              </div>
            </div>

            <div>
              <p className="font-mono uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-1">
                Suggested Improvements
              </p>
              <ul className="space-y-1 text-zinc-700 dark:text-zinc-300">
                {suggestedImprovements.length === 0 ? (
                  <li className="text-zinc-500 dark:text-zinc-400">No suggestions returned.</li>
                ) : (
                  suggestedImprovements.map((tip) => <li key={tip}>- {tip}</li>)
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export { CoverLetterGenerator };
