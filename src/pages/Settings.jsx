import React, { useState } from "react";
import MainLayout from "../components/layout/MainLayout";
import {
  Bell,
  Globe,
  Shield,
  Save,
  Check,
  SlidersHorizontal,
  Accessibility,
  Monitor,
} from "lucide-react";

export default function Settings() {
  const [saved, setSaved] = useState(false);

  const [notifications, setNotifications] = useState({
    publication: true,
    collaboration: true,
    citation: true,
    conference: true,
    system: true,
    weekly: false,
  });

  const [language, setLanguage] = useState("English");

  const [researchSettings, setResearchSettings] = useState({
    showCitations: true,
    showCollaborations: true,
    showRecommendations: true,
  });

  const [workspace, setWorkspace] = useState({
    compactMode: false,
    animations: true,
    autosave: true,
  });

  const saveSettings = () => {
    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  return (
    <MainLayout>
      <div className="space-y-6">

        {/* =====================================================
            HEADER
        ====================================================== */}

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-pink-500">
            Preferences
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-950">
            Settings
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Customize your SciCollab workspace, notifications,
            and research preferences.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[235px_1fr]">

          {/* =====================================================
              SETTINGS NAVIGATION
          ====================================================== */}

          <div className="h-fit rounded-2xl border border-white/80 bg-white/80 p-2 shadow-sm backdrop-blur-xl">

            <SettingNav
              icon={<Bell />}
              label="Notifications"
              active
            />

            <SettingNav
              icon={<Shield />}
              label="Security"
            />

            <SettingNav
              icon={<Globe />}
              label="Language & Region"
            />

            <SettingNav
              icon={<SlidersHorizontal />}
              label="Research Preferences"
            />

            <SettingNav
              icon={<Monitor />}
              label="Workspace"
            />

            <SettingNav
              icon={<Accessibility />}
              label="Accessibility"
            />

          </div>

          {/* =====================================================
              CONTENT
          ====================================================== */}

          <div className="space-y-5">

            {/* =================================================
                NOTIFICATIONS
            ================================================== */}

            <section className="rounded-2xl border border-white/80 bg-white/80 p-6 shadow-sm backdrop-blur-xl">

              <SectionHeader
                icon={<Bell />}
                title="Notifications"
                description="Choose which research updates you want to receive."
              />

              <div className="mt-5 divide-y divide-slate-100">

                <Toggle
                  label="Publication updates"
                  description="Notify me when publications are added or updated."
                  checked={notifications.publication}
                  onChange={() =>
                    setNotifications({
                      ...notifications,
                      publication:
                        !notifications.publication,
                    })
                  }
                />

                <Toggle
                  label="Collaboration updates"
                  description="Receive updates about collaboration requests."
                  checked={notifications.collaboration}
                  onChange={() =>
                    setNotifications({
                      ...notifications,
                      collaboration:
                        !notifications.collaboration,
                    })
                  }
                />

                <Toggle
                  label="Citation alerts"
                  description="Notify me about significant citation changes."
                  checked={notifications.citation}
                  onChange={() =>
                    setNotifications({
                      ...notifications,
                      citation:
                        !notifications.citation,
                    })
                  }
                />

                <Toggle
                  label="Conference reminders"
                  description="Receive reminders for upcoming conferences."
                  checked={notifications.conference}
                  onChange={() =>
                    setNotifications({
                      ...notifications,
                      conference:
                        !notifications.conference,
                    })
                  }
                />

                <Toggle
                  label="System notifications"
                  description="Receive important system and account notifications."
                  checked={notifications.system}
                  onChange={() =>
                    setNotifications({
                      ...notifications,
                      system:
                        !notifications.system,
                    })
                  }
                />

                <Toggle
                  label="Weekly research summary"
                  description="Receive a weekly summary of your research activity."
                  checked={notifications.weekly}
                  onChange={() =>
                    setNotifications({
                      ...notifications,
                      weekly:
                        !notifications.weekly,
                    })
                  }
                />

              </div>
            </section>

            {/* =================================================
                SECURITY
            ================================================== */}

            <section className="rounded-2xl border border-white/80 bg-white/80 p-6 shadow-sm backdrop-blur-xl">

              <SectionHeader
                icon={<Shield />}
                title="Security"
                description="Manage account security and session preferences."
              />

              <div className="mt-5 space-y-3">

                <SettingRow
                  title="Two-factor authentication"
                  description="Add an additional security layer to your account."
                  action="Configure"
                />

                <SettingRow
                  title="Login notifications"
                  description="Get notified whenever your account is accessed."
                  action="Enabled"
                />

                <SettingRow
                  title="Active sessions"
                  description="Review devices currently signed in to your account."
                  action="View sessions"
                />

              </div>
            </section>

            {/* =================================================
                LANGUAGE & REGION
            ================================================== */}

            <section className="rounded-2xl border border-white/80 bg-white/80 p-6 shadow-sm backdrop-blur-xl">

              <SectionHeader
                icon={<Globe />}
                title="Language & Region"
                description="Set your preferred language and regional format."
              />

              <div className="mt-5 grid gap-4 md:grid-cols-2">

                <label>
                  <span className="mb-2 block text-xs font-semibold text-slate-600">
                    Language
                  </span>

                  <select
                    value={language}
                    onChange={(e) =>
                      setLanguage(e.target.value)
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
                  >
                    <option>English</option>
                    <option>Tamil</option>
                    <option>Hindi</option>
                  </select>
                </label>

                <label>
                  <span className="mb-2 block text-xs font-semibold text-slate-600">
                    Date Format
                  </span>

                  <select
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
                  >
                    <option>DD/MM/YYYY</option>
                    <option>MM/DD/YYYY</option>
                    <option>YYYY-MM-DD</option>
                  </select>
                </label>

              </div>
            </section>

            {/* =================================================
                RESEARCH PREFERENCES
            ================================================== */}

            <section className="rounded-2xl border border-white/80 bg-white/80 p-6 shadow-sm backdrop-blur-xl">

              <SectionHeader
                icon={<SlidersHorizontal />}
                title="Research Preferences"
                description="Control the information shown in your research workspace."
              />

              <div className="mt-5 divide-y divide-slate-100">

                <Toggle
                  label="Show citation statistics"
                  description="Display citation metrics across research pages."
                  checked={
                    researchSettings.showCitations
                  }
                  onChange={() =>
                    setResearchSettings({
                      ...researchSettings,
                      showCitations:
                        !researchSettings.showCitations,
                    })
                  }
                />

                <Toggle
                  label="Show collaboration insights"
                  description="Display collaboration network information."
                  checked={
                    researchSettings.showCollaborations
                  }
                  onChange={() =>
                    setResearchSettings({
                      ...researchSettings,
                      showCollaborations:
                        !researchSettings.showCollaborations,
                    })
                  }
                />

                <Toggle
                  label="Research recommendations"
                  description="Show recommended researchers and publications."
                  checked={
                    researchSettings.showRecommendations
                  }
                  onChange={() =>
                    setResearchSettings({
                      ...researchSettings,
                      showRecommendations:
                        !researchSettings.showRecommendations,
                    })
                  }
                />

              </div>
            </section>

            {/* =================================================
                WORKSPACE
            ================================================== */}

            <section className="rounded-2xl border border-white/80 bg-white/80 p-6 shadow-sm backdrop-blur-xl">

              <SectionHeader
                icon={<Monitor />}
                title="Workspace"
                description="Customize how the application behaves."
              />

              <div className="mt-5 divide-y divide-slate-100">

                <Toggle
                  label="Compact mode"
                  description="Use tighter spacing for research dashboards."
                  checked={workspace.compactMode}
                  onChange={() =>
                    setWorkspace({
                      ...workspace,
                      compactMode:
                        !workspace.compactMode,
                    })
                  }
                />

                <Toggle
                  label="Animations"
                  description="Enable interface transitions and animations."
                  checked={workspace.animations}
                  onChange={() =>
                    setWorkspace({
                      ...workspace,
                      animations:
                        !workspace.animations,
                    })
                  }
                />

                <Toggle
                  label="Auto-save"
                  description="Automatically save workspace changes."
                  checked={workspace.autosave}
                  onChange={() =>
                    setWorkspace({
                      ...workspace,
                      autosave:
                        !workspace.autosave,
                    })
                  }
                />

              </div>
            </section>

            {/* =================================================
                ACCESSIBILITY
            ================================================== */}

            <section className="rounded-2xl border border-white/80 bg-white/80 p-6 shadow-sm backdrop-blur-xl">

              <SectionHeader
                icon={<Accessibility />}
                title="Accessibility"
                description="Make SciCollab easier and more comfortable to use."
              />

              <div className="mt-5 space-y-3">

                <SettingRow
                  title="Reduced motion"
                  description="Reduce animations and transitions throughout the application."
                  action="Configure"
                />

                <SettingRow
                  title="Keyboard navigation"
                  description="Improve navigation using keyboard controls."
                  action="Enabled"
                />

                <SettingRow
                  title="High contrast"
                  description="Increase contrast for better readability."
                  action="Configure"
                />

              </div>
            </section>

            {/* =================================================
                SAVE BUTTON
            ================================================== */}

            <div className="flex justify-end">

              <button
                onClick={saveSettings}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 via-purple-500 to-orange-400 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-pink-200 transition hover:scale-[1.02] hover:shadow-xl"
              >

                {saved ? (
                  <>
                    <Check className="h-4 w-4" />
                    Settings Saved
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}

              </button>

            </div>

          </div>
        </div>
      </div>
    </MainLayout>
  );
}


/* ============================================================
   SETTING NAVIGATION COMPONENT
============================================================ */

function SettingNav({
  icon,
  label,
  active,
}) {
  return (
    <button
      type="button"
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${
        active
          ? "bg-pink-50 text-pink-600"
          : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
      }`}
    >
      {React.cloneElement(icon, {
        className: "h-4 w-4",
      })}

      {label}
    </button>
  );
}


/* ============================================================
   SECTION HEADER COMPONENT
============================================================ */

function SectionHeader({
  icon,
  title,
  description,
}) {
  return (
    <div className="flex gap-3">

      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-pink-50 text-pink-500">
        {React.cloneElement(icon, {
          className: "h-5 w-5",
        })}
      </div>

      <div>

        <h2 className="font-bold text-slate-900">
          {title}
        </h2>

        <p className="mt-1 text-xs text-slate-500">
          {description}
        </p>

      </div>

    </div>
  );
}


/* ============================================================
   TOGGLE COMPONENT
============================================================ */

function Toggle({
  label,
  description,
  checked,
  onChange,
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">

      <div>

        <p className="text-sm font-semibold text-slate-700">
          {label}
        </p>

        <p className="mt-1 text-xs text-slate-400">
          {description}
        </p>

      </div>

      <button
        type="button"
        onClick={onChange}
        aria-pressed={checked}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          checked
            ? "bg-gradient-to-r from-pink-500 to-orange-400"
            : "bg-slate-200"
        }`}
      >

        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${
            checked ? "left-6" : "left-1"
          }`}
        />

      </button>

    </div>
  );
}


/* ============================================================
   SETTING ROW COMPONENT
============================================================ */

function SettingRow({
  title,
  description,
  action,
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 p-4">

      <div>

        <p className="text-sm font-semibold text-slate-700">
          {title}
        </p>

        <p className="mt-1 text-xs text-slate-400">
          {description}
        </p>

      </div>

      <button
        type="button"
        className="shrink-0 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-pink-300 hover:text-pink-500"
      >
        {action}
      </button>

    </div>
  );
}