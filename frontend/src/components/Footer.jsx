import React from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Instagram,
  Twitter,
  Globe,
  Mail,
  Phone,
  MapPin,
  Send,
} from "lucide-react";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  },
};

const ContactSection = () => {
  return (
    <div className="bg-white w-full min-h-screen font-sans text-slate-900 selection:bg-indigo-600 selection:text-white">
      {/* ================= CONTACT SECTION ================= */}
      <section className="min-h-screen relative p-6 md:p-16 flex flex-col justify-center overflow-hidden">
        {/* Subtle Background Accent */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-slate-50/50 -z-10" />

        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16 relative z-10">
          {/* LEFT SIDE: HEADLINE */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex flex-col justify-center"
          >
            <motion.span
              variants={fadeInUp}
              className="text-indigo-600 font-black text-xs tracking-[0.3em] uppercase mb-6 block"
            >
              Contact Us
            </motion.span>

            <motion.h1
              variants={fadeInUp}
              className="text-5xl md:text-8xl leading-[0.95] tracking-tighter font-black uppercase text-slate-900"
            >
              Ready to <br />
              <span className="text-indigo-600 italic">Transform</span> <br />
              Payments?
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="mt-8 text-slate-600 text-lg md:text-xl max-w-md font-medium leading-relaxed"
            >
              Experience India's most advanced biometric gateway. Fill the form,
              and our enterprise team will reach out within 24 hours.
            </motion.p>

            {/* Quick Info Cards */}
            <motion.div
              variants={fadeInUp}
              className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-12"
            >
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="p-3 bg-white rounded-xl shadow-sm text-indigo-600">
                  <Mail size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Email us
                  </p>
                  <p className="text-sm font-bold text-slate-900">
                    hello@drishtipay.ai
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="p-3 bg-white rounded-xl shadow-sm text-indigo-600">
                  <Phone size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Call us
                  </p>
                  <p className="text-sm font-bold text-slate-900">
                    +91 80 4422 1100
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* RIGHT SIDE: HIGH CONTRAST FORM */}
          <div className="flex flex-col justify-center">
            <motion.form
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="space-y-6 bg-white border-2 border-slate-900 p-8 md:p-12 rounded-[2rem] shadow-[12px_12px_0px_0px_rgba(79,70,229,1)]"
            >
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-slate-900 mb-3 block">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Verma"
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none focus:border-indigo-600 focus:bg-white transition-all text-slate-900 font-bold"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-slate-900 mb-3 block">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="rahul@company.com"
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none focus:border-indigo-600 focus:bg-white transition-all text-slate-900 font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-slate-900 mb-3 block">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+91..."
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none focus:border-indigo-600 focus:bg-white transition-all text-slate-900 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-widest text-slate-900 mb-3 block">
                  How can we help?
                </label>
                <textarea
                  rows="3"
                  placeholder="Tell us about your requirements..."
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none focus:border-indigo-600 focus:bg-white transition-all text-slate-900 font-bold resize-none"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-slate-900 text-white py-5 rounded-xl font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-indigo-600 transition-colors"
              >
                Send Message <Send size={18} />
              </motion.button>
            </motion.form>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="pt-24 pb-12 px-6 md:px-16 bg-slate-950 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 mb-20">
            <div className="lg:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center font-black">
                  DP
                </div>
                <span className="text-xl font-black tracking-tighter">
                  DRISHTIPAY
                </span>
              </div>
              <p className="text-slate-400 font-medium leading-relaxed mb-8">
                The world's first autonomous face-based payment ecosystem. Built
                in India for the world.
              </p>
              <div className="flex gap-4">
                {[Instagram, Twitter, Globe].map((Icon, i) => (
                  <a
                    key={i}
                    href="#"
                    className="w-10 h-10 rounded-full border border-slate-800 flex items-center justify-center hover:bg-indigo-600 hover:border-indigo-600 transition-all text-slate-400 hover:text-white"
                  >
                    <Icon size={18} />
                  </a>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:col-span-3 gap-8">
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-indigo-500">
                  Platform
                </h4>
                <ul className="space-y-2 text-slate-300 font-bold text-sm">
                  <li className="hover:text-white cursor-pointer transition-colors">
                    Neural Core
                  </li>
                  <li className="hover:text-white cursor-pointer transition-colors">
                    Merchant SDK
                  </li>
                  <li className="hover:text-white cursor-pointer transition-colors">
                    Security
                  </li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-indigo-500">
                  Company
                </h4>
                <ul className="space-y-2 text-slate-300 font-bold text-sm">
                  <li className="hover:text-white cursor-pointer transition-colors">
                    About Us
                  </li>
                  <li className="hover:text-white cursor-pointer transition-colors">
                    Careers
                  </li>
                  <li className="hover:text-white cursor-pointer transition-colors">
                    Press
                  </li>
                </ul>
              </div>
              <div className="space-y-4 col-span-2 md:col-span-1">
                <h4 className="text-xs font-black uppercase tracking-widest text-indigo-500">
                  Office
                </h4>
                <p className="text-slate-300 font-bold text-sm leading-relaxed">
                  Level 4, Prestige Tech Park,
                  <br /> Bangalore, Karnataka 560103
                </p>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-900 flex flex-col md:row justify-between items-center gap-6">
            <p className="text-[10px] font-bold text-slate-500 tracking-[0.3em] uppercase">
              © 2026 DrishtiPay. All Rights Reserved.
            </p>
            <div className="flex gap-8 text-[10px] font-black text-slate-500 uppercase tracking-widest">
              <span className="hover:text-indigo-400 cursor-pointer transition-colors">
                Privacy
              </span>
              <span className="hover:text-indigo-400 cursor-pointer transition-colors">
                Terms
              </span>
              <span className="hover:text-indigo-400 cursor-pointer transition-colors">
                Security Audit
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ContactSection;
