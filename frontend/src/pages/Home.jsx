import { useEffect, useState } from "react";
import { motion, animate } from "framer-motion";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  Tooltip,
} from "recharts";
import {
  FiGrid,
  FiPocket,
  FiActivity,
  FiUsers,
  FiSettings,
  FiBell,
  FiShield,
  FiCpu,
  FiUserCheck,
  FiEye,
  FiArrowUpRight,
  FiLock,
  FiGlobe,
  FiZap,
  FiSmartphone,
  FiCheckCircle,
  FiPieChart,
  FiMapPin,
  FiTerminal,
  FiDatabase,
  FiServer,
  FiCreditCard,
  FiAlertCircle,
} from "react-icons/fi";

// --- ANIMATED RUPEE/NUMBER FORMATTING ---
const AnimatedNumber = ({ value }) => {
  const [displayValue, setDisplayValue] = useState("0");
  useEffect(() => {
    const numericValue = parseFloat(value.replace(/,/g, ""));
    const controls = animate(0, numericValue, {
      duration: 2,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => {
        setDisplayValue(
          new Intl.NumberFormat("en-IN", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 1,
          }).format(latest)
        );
      },
    });
    return () => controls.stop();
  }, [value]);
  return <span>{displayValue}</span>;
};

// --- STACKED DASHBOARD CONTAINER ---
const DashboardStack = ({ children, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, margin: "-5%" }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      // Stacking logic: Har dashboard pichle wale se 40px niche rukega
      className="sticky mb-32 w-full max-w-[1180px] mx-auto px-4"
      style={{
        zIndex: index,
        top: `${80 + index * 40}px`,
      }}
    >
      <div className="bg-white rounded-[3rem] border border-gray-200/50 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.15)] flex overflow-hidden min-h-[700px] ring-1 ring-gray-200/50">
        {children}
      </div>
    </motion.div>
  );
};

const Home = () => {
  const chartData = [
    { name: "Jan", v: 30 },
    { name: "Feb", v: 45 },
    { name: "Mar", v: 38 },
    { name: "Apr", v: 65 },
    { name: "May", v: 48 },
    { name: "Jun", v: 80 },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] selection:bg-indigo-100 pb-60 font-sans">
      {/* --- HERO SECTION --- */}
      <section className="relative pt-24 pb-32 text-center px-4">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-[radial-gradient(circle_at_center,_#EEF2FF_0%,_transparent_70%)] -z-10 opacity-70"></div>

        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 bg-white border border-indigo-100 text-indigo-600 px-5 py-2 rounded-full text-[12px] font-bold mb-8 shadow-sm"
          >
            <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-pulse"></span>
            V3.0 BIOMETRIC PROTOCOL LIVE
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-[92px] font-bold tracking-tighter mb-8 text-slate-900 leading-[0.9]"
          >
            Pay with a{" "}
            <span className="text-indigo-600 italic font-medium">Smile</span>.
            <br />
            Secure with{" "}
            <span className="underline decoration-indigo-200 underline-offset-8">
              Vision.
            </span>
          </motion.h1>

          <p className="text-slate-500 text-[22px] max-w-3xl mx-auto mb-12 font-medium leading-relaxed">
            DrishtiPay eliminates PINs and passwords. Experience India's first{" "}
            <br />
            fully autonomous Face-to-Pay ecosystem.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto mb-16 px-4">
            <HeroFeature
              icon={<FiCheckCircle />}
              title="99.9% Liveness"
              desc="Anti-deepfake AI"
              color="text-green-500"
            />
            <HeroFeature
              icon={<FiShield />}
              title="E2E Sharding"
              desc="Decentralized data"
              color="text-indigo-600"
            />
            <HeroFeature
              icon={<FiZap />}
              title="200ms Latency"
              desc="Instant verification"
              color="text-amber-500"
            />
            <HeroFeature
              icon={<FiLock />}
              title="Quantum Safe"
              desc="PQC Encryption"
              color="text-blue-600"
            />
          </div>

          <div className="flex flex-col sm:row gap-4 justify-center items-center">
            <button className="bg-slate-900 text-white px-12 py-5 rounded-full font-bold text-[16px] shadow-2xl hover:bg-indigo-600 transition-all hover:scale-105">
              Get Started Now
            </button>
            <button className="text-slate-600 font-bold hover:text-indigo-600 flex items-center gap-2">
              <FiEye /> View Security Whitepaper
            </button>
          </div>
        </div>
      </section>

      {/* --- STACKED DASHBOARDS --- */}
      <div className="relative pt-20">
        {/* DASHBOARD 1: Intelligence Hub */}
        <DashboardStack index={1}>
          <Sidebar active="Intelligence" />
          <main className="flex-1 p-10 bg-white overflow-y-auto">
            <DashHeader title="Intelligence Hub" />
            <div className="grid grid-cols-3 gap-6 mb-10">
              <StatCard title="Security Score" value="98.4" suffix="%" />
              <StatCard title="Global Nodes" value="1420" />
              <StatCard title="Active Scans" value="42.1" suffix="k" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-slate-50 rounded-[2.5rem] p-8 h-80">
                <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <FiActivity className="text-indigo-600" /> Traffic Pulse
                </h4>
                <ResponsiveContainer width="100%" height="85%">
                  <AreaChart data={chartData}>
                    <Area
                      type="monotone"
                      dataKey="v"
                      stroke="#4F46E5"
                      fill="#4F46E520"
                      strokeWidth={3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-slate-50 rounded-[2.5rem] p-8 h-80">
                <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <FiAlertCircle className="text-amber-500" /> Threat Monitoring
                </h4>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-100"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span className="text-sm font-medium text-slate-600">
                          Encrypted Tunnel Node #{i + 120}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-indigo-600">
                        SECURE
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </main>
        </DashboardStack>

        {/* DASHBOARD 2: Neural Vault */}
        <DashboardStack index={2}>
          <Sidebar active="Digital Vault" />
          <main className="flex-1 p-10 bg-slate-900 text-white overflow-y-auto">
            <DashHeader title="Neural Vault" isDark />
            <div className="grid grid-cols-2 gap-6 mt-6">
              <VaultCard
                icon={<FiLock />}
                title="Encrypted ID"
                desc="Biometric hashes sharded across 12 decentralized clusters."
              />
              <VaultCard
                icon={<FiCpu />}
                title="Neural Sync"
                desc="Hardware-level synchronization with secure enclaves."
              />
            </div>
            <div className="mt-8 grid grid-cols-3 gap-6">
              <div className="col-span-2 bg-white/5 border border-white/10 rounded-[2.5rem] p-8">
                <h4 className="font-bold mb-6 flex items-center gap-2">
                  <FiCreditCard /> Recent Biometric Auth
                </h4>
                <div className="space-y-4">
                  {["Mumbai Store", "Online Checkout", "Starbucks Delhi"].map(
                    (loc, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between border-b border-white/5 pb-4"
                      >
                        <div className="flex gap-4 items-center">
                          <div className="w-10 h-10 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400">
                            <FiUserCheck />
                          </div>
                          <div>
                            <p className="font-bold text-sm">{loc}</p>
                            <p className="text-xs text-slate-500">
                              Verified via FaceID v3
                            </p>
                          </div>
                        </div>
                        <p className="font-mono text-indigo-400">
                          ₹{450 * (i + 1)}.00
                        </p>
                      </div>
                    )
                  )}
                </div>
              </div>
              <div className="bg-indigo-600 rounded-[2.5rem] p-8 flex flex-col justify-between">
                <FiZap size={40} />
                <div>
                  <h4 className="text-2xl font-bold">Liveness Check</h4>
                  <p className="text-indigo-200 text-xs mt-2">
                    Sub-dermal pulse scanning active
                  </p>
                </div>
                <div className="flex gap-1 h-12 items-end">
                  {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ height: [10, 30, 10] }}
                      transition={{ repeat: Infinity, delay: i * 0.1 }}
                      className="flex-1 bg-white/40 rounded-full"
                    />
                  ))}
                </div>
              </div>
            </div>
          </main>
        </DashboardStack>

        {/* DASHBOARD 3: Network Nodes */}
        <DashboardStack index={3}>
          <Sidebar active="Nodes" />
          <main className="flex-1 p-10 bg-white overflow-y-auto">
            <DashHeader title="Edge Network" />
            <div className="grid grid-cols-4 gap-4 mb-8">
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <FiServer className="text-indigo-600 mb-2" />
                <p className="text-2xl font-bold">0.04ms</p>
                <p className="text-[10px] text-slate-400 uppercase font-bold">
                  Ping
                </p>
              </div>
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <FiGlobe className="text-emerald-500 mb-2" />
                <p className="text-2xl font-bold">142</p>
                <p className="text-[10px] text-slate-400 uppercase font-bold">
                  Regions
                </p>
              </div>
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <FiDatabase className="text-amber-500 mb-2" />
                <p className="text-2xl font-bold">99.9%</p>
                <p className="text-[10px] text-slate-400 uppercase font-bold">
                  Uptime
                </p>
              </div>
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <FiTerminal className="text-blue-500 mb-2" />
                <p className="text-2xl font-bold">4.2TB</p>
                <p className="text-[10px] text-slate-400 uppercase font-bold">
                  Daily Thru
                </p>
              </div>
            </div>
            <div className="h-80 border-2 border-dashed border-slate-200 rounded-[3rem] bg-slate-50/50 flex items-center justify-center relative">
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage:
                    "radial-gradient(#4F46E5 1px, transparent 1px)",
                  backgroundSize: "20px 20px",
                }}
              ></div>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="w-64 h-64 border border-indigo-200 rounded-full flex items-center justify-center"
              >
                <div className="w-12 h-12 bg-white shadow-xl rounded-full absolute -top-6 flex items-center justify-center text-indigo-600">
                  <FiGlobe />
                </div>
                <div className="w-32 h-32 bg-indigo-600 rounded-full shadow-2xl flex items-center justify-center text-white">
                  <FiZap size={40} />
                </div>
              </motion.div>
              <div className="absolute bottom-8 right-8 text-right">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Master Node Status
                </p>
                <p className="text-xl font-bold text-slate-800">
                  Operational: Bangalore-01
                </p>
              </div>
            </div>
          </main>
        </DashboardStack>

        {/* DASHBOARD 4: Biometric Analytics */}
        <DashboardStack index={4}>
          <Sidebar active="Analytics" />
          <main className="flex-1 p-10 bg-white">
            <DashHeader title="Neural Analytics" />
            <div className="grid grid-cols-2 gap-8">
              <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden h-[400px]">
                <p className="text-xs font-bold opacity-50 uppercase tracking-widest">
                  Facial Mapping Precision
                </p>
                <h3 className="text-6xl font-bold mt-4 tracking-tighter">
                  99.998%
                </h3>
                <div className="mt-12 space-y-6 relative z-10">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <p>Vector Extraction</p>
                      <p>0.02ms</p>
                    </div>
                    <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                      <div className="w-[90%] h-full bg-indigo-500"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <p>Depth Perception</p>
                      <p>0.01ms</p>
                    </div>
                    <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                      <div className="w-[95%] h-full bg-emerald-500"></div>
                    </div>
                  </div>
                </div>
                <FiEye
                  size={220}
                  className="absolute bottom-[-40px] right-[-40px] opacity-10"
                />
              </div>
              <div className="space-y-6">
                <div className="bg-indigo-50 rounded-[2.5rem] p-8 h-48">
                  <p className="font-bold text-slate-800 mb-4">
                    Verification Velocity
                  </p>
                  <ResponsiveContainer width="100%" height="70%">
                    <BarChart data={chartData}>
                      <Bar dataKey="v" fill="#4F46E5" radius={[5, 5, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="bg-emerald-50 rounded-[2.5rem] p-8 h-48 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-emerald-900">
                      Fraud Prevented
                    </p>
                    <p className="text-4xl font-black text-emerald-600 mt-2">
                      1,240
                    </p>
                    <p className="text-xs text-emerald-700 mt-1 font-medium">
                      Attempted spoofs blocked today
                    </p>
                  </div>
                  <FiShield size={60} className="text-emerald-200" />
                </div>
              </div>
            </div>
          </main>
        </DashboardStack>

        {/* DASHBOARD 5: Global Compliance */}
        <DashboardStack index={5}>
          <Sidebar active="Compliance" />
          <main className="flex-1 p-10 bg-[#0F172A] text-white overflow-y-auto">
            <DashHeader title="Trust & Compliance" isDark />
            <div className="grid grid-cols-3 gap-6">
              <ComplianceCard title="GDPR Ready" status="Certified" />
              <ComplianceCard title="PCI-DSS v4.0" status="Verified" />
              <ComplianceCard title="ISO 27001" status="Active" />
            </div>
            <div className="mt-10 bg-white/5 rounded-[3rem] p-12 border border-white/10 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-emerald-500 to-indigo-500"></div>
              <div className="w-20 h-20 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiCheckCircle size={40} />
              </div>
              <h3 className="text-4xl font-bold tracking-tight">
                System Fully Optimized.
              </h3>
              <p className="text-slate-400 mt-4 max-w-md mx-auto leading-relaxed">
                All biometric protocols are operating within military-grade
                safety parameters. Your infrastructure is secure.
              </p>
              <div className="mt-10 flex gap-4 justify-center">
                <button className="bg-indigo-600 px-10 py-4 rounded-2xl font-bold hover:bg-indigo-500 transition-colors">
                  Generate Audit Report
                </button>
                <button className="bg-white/10 px-10 py-4 rounded-2xl font-bold hover:bg-white/20 transition-colors">
                  Contact SOC
                </button>
              </div>
            </div>
          </main>
        </DashboardStack>
      </div>
    </div>
  );
};

// --- SUB-COMPONENTS ---

const HeroFeature = ({ icon, title, desc, color }) => (
  <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm text-left hover:shadow-md transition-all hover:-translate-y-1">
    <div className={`${color} mb-3 text-2xl`}>{icon}</div>
    <h4 className="font-bold text-slate-900 text-sm">{title}</h4>
    <p className="text-[12px] text-slate-400 mt-1 leading-tight">{desc}</p>
  </div>
);

const Sidebar = ({ active }) => (
  <aside className="w-72 bg-[#F9FAFB] border-r border-gray-100 p-10 hidden md:flex flex-col">
    <div className="flex items-center gap-2 mb-12">
      <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg">
        <FiEye className="text-white" />
      </div>
      <span className="text-2xl font-bold tracking-tighter italic">
        Drishti<span className="not-italic text-indigo-600">Pay</span>
      </span>
    </div>
    <div className="space-y-2">
      <NavItem
        icon={<FiGrid />}
        label="Intelligence"
        active={active === "Intelligence"}
      />
      <NavItem
        icon={<FiPocket />}
        label="Digital Vault"
        active={active === "Digital Vault"}
      />
      <NavItem icon={<FiUsers />} label="Nodes" active={active === "Nodes"} />
      <NavItem
        icon={<FiPieChart />}
        label="Analytics"
        active={active === "Analytics"}
      />
      <NavItem
        icon={<FiShield />}
        label="Compliance"
        active={active === "Compliance"}
      />
    </div>
    <div className="mt-auto p-6 bg-white rounded-3xl border border-gray-100">
      <p className="text-[10px] font-bold text-slate-400 uppercase">
        System Status
      </p>
      <p className="text-xs font-bold text-emerald-500 mt-1 flex items-center gap-2">
        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>{" "}
        All Nodes Live
      </p>
    </div>
  </aside>
);

const NavItem = ({ icon, label, active }) => (
  <div
    className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl text-[13px] font-bold transition-all cursor-pointer ${
      active
        ? "bg-white shadow-sm text-slate-900 ring-1 ring-slate-200"
        : "text-slate-400 hover:text-indigo-600 hover:bg-slate-50"
    }`}
  >
    <span className="text-lg">{icon}</span> {label}
  </div>
);

const StatCard = ({ title, value, suffix = "" }) => (
  <div className="bg-white border border-gray-100 p-8 rounded-[2.5rem] shadow-sm">
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
      {title}
    </p>
    <div className="flex items-baseline gap-1">
      <p className="text-4xl font-extrabold text-slate-900 tracking-tighter">
        <AnimatedNumber value={value} />
      </p>
      <span className="text-lg font-bold text-slate-400">{suffix}</span>
    </div>
  </div>
);

const VaultCard = ({ icon, title, desc }) => (
  <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] hover:bg-white/10 transition-colors">
    <div className="text-indigo-400 mb-4 text-3xl">{icon}</div>
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
  </div>
);

const ComplianceCard = ({ title, status }) => (
  <div className="bg-white/5 border border-white/10 p-6 rounded-3xl">
    <p className="text-[10px] font-bold text-indigo-400 uppercase mb-1">
      Standard
    </p>
    <h4 className="font-bold">{title}</h4>
    <div className="mt-4 flex items-center gap-2 text-xs text-emerald-400">
      <FiCheckCircle /> {status}
    </div>
  </div>
);

const DashHeader = ({ title, isDark }) => (
  <div className="flex justify-between items-center mb-10">
    <div>
      <h2
        className={`text-3xl font-bold tracking-tight ${
          isDark ? "text-white" : "text-slate-800"
        }`}
      >
        {title}
      </h2>
      <p
        className={`text-[11px] font-bold uppercase tracking-widest mt-1 ${
          isDark ? "text-indigo-400" : "text-slate-400"
        }`}
      >
        Live Monitoring Protocol v3.0.4
      </p>
    </div>
    <div className="flex gap-3">
      <div
        className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${
          isDark
            ? "border-white/10 bg-white/5"
            : "border-gray-200 bg-white shadow-sm"
        }`}
      >
        <FiBell className={isDark ? "text-white" : "text-slate-600"} />
      </div>
      <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30">
        <FiUserCheck />
      </div>
    </div>
  </div>
);

export default Home;
