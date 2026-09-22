import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ArrowRight,
  BadgeCheck,
  Briefcase,
  Building2,
  CheckCircle2,
  FileText,
  GraduationCap,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';
import { api } from '../services/api';

const heroImage = 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=2200&q=82';
const internalImage = 'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1400&q=80';
const externalImage = 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1400&q=80';
const studentImage = 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1400&q=80';

export const HomePage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    api.getAdminStats()
      .then(res => setStats(res.kpis))
      .catch(() => setStats({
        openAvJobs: 6,
        openAllJobs: 5,
        totalCandidates: 129,
        confirmedEmployees: 1,
      }));
  }, []);

  return (
    <div className="pb-16">
      <section className="relative left-1/2 right-1/2 -mx-[50vw] w-screen min-h-[calc(100svh-8rem)] overflow-hidden bg-slate-950 text-white">
        <img src={heroImage} alt="Young candidates preparing for career opportunities" className="absolute inset-0 h-full w-full object-cover opacity-58" />
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950 via-emerald-950/78 to-slate-950/25" />
        <div className="relative mx-auto flex min-h-[calc(100svh-8rem)] max-w-7xl items-center px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="max-w-2xl space-y-7"
          >
            <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-lime-200">
              <Sparkles className="h-4 w-4" />
              Ayudh Vikas Manpower
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[0.96]">
                Find work that can actually open a door.
              </h1>
              <p className="text-sm sm:text-base leading-7 text-emerald-50/88 max-w-xl">
                Register once, apply with confidence, and get matched across Foundation roles and trusted external organizations.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/manpower/jobs/av" className="inline-flex items-center justify-center gap-2 rounded-xl bg-lime-300 px-5 py-3 text-sm font-extrabold text-emerald-950 transition-transform hover:scale-[1.02]">
                Start AV profile
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/manpower/jobs/all" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/12 px-5 py-3 text-sm font-bold text-white backdrop-blur transition-colors hover:bg-white/18">
                Browse partner jobs
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-4 border-t border-white/15 pt-6 text-xs">
              <Stat value={stats?.openAvJobs ?? 6} label="Foundation paths" />
              <Stat value={stats?.openAllJobs ?? 5} label="Partner roles" />
              <Stat value={`${stats?.totalCandidates ?? 129}+`} label="Candidate profiles" />
            </div>
          </motion.div>
        </div>
      </section>

      <section className="mt-14 grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-10 items-center">
        <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.5 }} className="space-y-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-emerald-700">Two ways into opportunity</p>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">Internal support roles and external career openings in one place.</h2>
          <p className="text-sm leading-7 text-slate-600">
            Students and early-career applicants can build one profile, choose the right path, and see every application as a step toward contact, review, and placement.
          </p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <PathPanel image={internalImage} icon={<Briefcase className="h-5 w-5" />} title="AV Jobs" copy="Submit a full profile for Foundation teams to review and match offline to suitable roles." to="/manpower/jobs/av" cta="Complete AV profile" />
          <PathPanel image={externalImage} icon={<Building2 className="h-5 w-5" />} title="All Jobs" copy="Apply to external organizations and receive updates without repeated registration fees." to="/manpower/jobs/all" cta="See open jobs" />
        </div>
      </section>

      <section className="mt-16 relative overflow-hidden rounded-[2rem] bg-slate-950 text-white">
        <img src={studentImage} alt="Students discussing career applications" className="absolute inset-0 h-full w-full object-cover opacity-38" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/88 to-emerald-950/40" />
        <div className="relative grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-8 p-6 sm:p-10 lg:p-12">
          <div className="space-y-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-lime-200">Why applying feels safer</p>
            <h2 className="text-3xl font-black tracking-tight">Every application has a next step.</h2>
            <p className="text-sm leading-7 text-slate-200">
              The portal keeps the candidate profile, document status, staff review, and application history together so opportunities do not disappear into a blank form.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Proof icon={<ShieldCheck />} title="One-time registration" copy="No repeated Rs.10 fee for every job." />
            <Proof icon={<FileText />} title="Document-ready profile" copy="AV candidates can upload identity proof once." />
            <Proof icon={<BadgeCheck />} title="Applied state" copy="Jobs show when you have already applied." />
            <Proof icon={<Users />} title="Staff review" copy="Staff can expand profiles and process candidates." />
          </div>
        </div>
      </section>

      <section className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Step number="01" title="Create profile" copy="Candidate, education, skills, and document details are captured once." />
        <Step number="02" title="Apply with intent" copy="Internal AV profile or external job application, both stay trackable." />
        <Step number="03" title="Wait for updates" copy="The team reviews and notifies based on role fit and application status." />
      </section>

      <section className="mt-16 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 border-t border-emerald-100 pt-8">
        <div>
          <h2 className="text-2xl font-black text-slate-950">Ready to start?</h2>
          <p className="mt-1 text-sm text-slate-600">Choose the path that matches your next opportunity.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Link to="/manpower/jobs/av" className="inline-flex justify-center rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700">AV profile</Link>
          <Link to="/manpower/jobs/all" className="inline-flex justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-900 hover:bg-slate-50">All jobs</Link>
        </div>
      </section>
    </div>
  );
};

const Stat = ({ value, label }: { value: string | number; label: string }) => (
  <div>
    <div className="text-2xl font-black text-white">{value}</div>
    <div className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-100/75">{label}</div>
  </div>
);

const PathPanel = ({ image, icon, title, copy, to, cta }: { image: string; icon: React.ReactNode; title: string; copy: string; to: string; cta: string }) => (
  <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white">
    <div className="relative h-56 overflow-hidden">
      <img src={image} alt={title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent" />
      <div className="absolute bottom-4 left-4 flex h-11 w-11 items-center justify-center rounded-xl bg-white text-emerald-700">
        {icon}
      </div>
    </div>
    <div className="p-5 space-y-3">
      <h3 className="text-xl font-black text-slate-950">{title}</h3>
      <p className="text-sm leading-6 text-slate-600">{copy}</p>
      <Link to={to} className="inline-flex items-center gap-2 text-sm font-extrabold text-emerald-700">
        {cta}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  </motion.div>
);

const Proof = ({ icon, title, copy }: { icon: React.ReactNode; title: string; copy: string }) => (
  <div className="rounded-2xl border border-white/12 bg-white/10 p-4 backdrop-blur">
    <div className="text-lime-200 [&>svg]:h-5 [&>svg]:w-5">{icon}</div>
    <h3 className="mt-3 font-extrabold text-white">{title}</h3>
    <p className="mt-1 text-xs leading-5 text-slate-200">{copy}</p>
  </div>
);

const Step = ({ number, title, copy }: { number: string; title: string; copy: string }) => (
  <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.4 }} transition={{ duration: 0.45 }} className="border-t border-slate-200 pt-5">
    <div className="text-xs font-black text-emerald-600">{number}</div>
    <h3 className="mt-2 text-xl font-black text-slate-950">{title}</h3>
    <p className="mt-2 text-sm leading-6 text-slate-600">{copy}</p>
  </motion.div>
);
