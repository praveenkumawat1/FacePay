import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Instagram, Twitter, Globe } from "lucide-react";

/* ---------------- ANIMATIONS (UNCHANGED) ---------------- */
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" },
  },
};

const lineDraw = {
  hidden: { width: 0 },
  visible: { width: "100%", transition: { duration: 1, delay: 0.5 } },
};

const ContactAndFooter = () => {
  return (
    <div className="bg-[#0B0F14] w-full min-h-screen font-sans">
      {/* ================= CONTACT SECTION ================= */}
      <section className="min-h-screen text-[#E5E7EB] p-8 md:p-16 flex flex-col justify-center border-b border-[#1F2937]">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* LEFT TITLE */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.h1
              variants={fadeInUp}
              className="text-6xl md:text-8xl leading-none tracking-tight font-serif uppercase"
            >
              LET’S <br />
              <span className="relative text-emerald-400">
                BUILD
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 12,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="absolute -top-12 -right-16 w-24 h-24 border border-[#1F2937] rounded-full flex items-start justify-center pt-2"
                >
                  <div className="w-4 h-4 bg-emerald-400 rounded-full shadow-lg" />
                </motion.div>
              </span>{" "}
              <br />
              FACEPAY
            </motion.h1>
          </motion.div>

          {/* RIGHT FORM */}
          <div className="flex flex-col justify-between pt-10">
            <motion.form
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="space-y-12"
            >
              {/* NAME */}
              <div className="relative">
                <label className="text-[10px] uppercase tracking-widest text-[#9CA3AF] mb-2 block">
                  Full Name *
                </label>
                <input
                  type="text"
                  placeholder="Your name"
                  className="bg-transparent w-full pb-2 outline-none text-[#E5E7EB] placeholder:text-[#6B7280]"
                />
                <motion.div
                  variants={lineDraw}
                  className="h-[1px] bg-[#1F2937] absolute bottom-0 w-full"
                />
              </div>

              {/* EMAIL + PHONE */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="relative">
                  <label className="text-[10px] uppercase tracking-widest text-[#9CA3AF] mb-2 block">
                    Email *
                  </label>
                  <input
                    type="email"
                    placeholder="you@facepay.ai"
                    className="bg-transparent w-full pb-2 outline-none text-[#E5E7EB] placeholder:text-[#6B7280]"
                  />
                  <div className="h-[1px] bg-[#1F2937] w-full" />
                </div>

                <div className="relative">
                  <label className="text-[10px] uppercase tracking-widest text-[#9CA3AF] mb-2 block">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 XXXXX XXXXX"
                    className="bg-transparent w-full pb-2 outline-none text-[#E5E7EB] placeholder:text-[#6B7280]"
                  />
                  <div className="h-[1px] bg-[#1F2937] w-full" />
                </div>
              </div>

              {/* SUBMIT */}
              <motion.div
                className="flex justify-end cursor-pointer group text-emerald-400"
                whileHover={{ x: 10 }}
              >
                <ArrowRight className="w-10 h-10" />
              </motion.div>
            </motion.form>

            {/* CONTACT INFO */}
            <div className="grid grid-cols-2 gap-8 mt-20 text-[11px] tracking-widest uppercase text-[#9CA3AF]">
              <div>
                <p className="text-[#E5E7EB] mb-2">India</p>
                <p>
                  FacePay HQ
                  <br />
                  support@facepay.ai
                </p>
              </div>
              <div>
                <p className="text-[#E5E7EB] mb-2">Global</p>
                <p>
                  Enterprise & Partnerships
                  <br />
                  partners@facepay.ai
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="pt-24 pb-8 px-8 md:px-16 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-32">
            <div className="max-w-xs">
              <div className="border border-[#1F2937] rounded-full px-4 py-1 inline-block text-[10px] tracking-widest mb-6 text-[#9CA3AF]">
                FACEPAY
              </div>
              <h2 className="text-3xl font-serif italic text-[#E5E7EB]">
                The future of payments is your face.
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-16 text-[10px] tracking-widest uppercase text-[#9CA3AF]">
              <div className="space-y-3">
                <h4 className="text-[#E5E7EB] mb-4">Product</h4>
                <p>How it Works</p>
                <p>Security</p>
                <p>Pricing</p>
              </div>

              <div className="space-y-3">
                <h4 className="text-[#E5E7EB] mb-4">Company</h4>
                <p>About FacePay</p>
                <p>Careers</p>
                <p>Contact</p>
              </div>

              <div className="space-y-3">
                <h4 className="text-[#E5E7EB] mb-4">Social</h4>
                <div className="flex items-center gap-2">
                  <Instagram size={12} /> Instagram
                </div>
                <div className="flex items-center gap-2">
                  <Twitter size={12} /> Twitter
                </div>
                <div className="flex items-center gap-2">
                  <Globe size={12} /> Website
                </div>
              </div>
            </div>
          </div>

          {/* GIANT BRAND TEXT */}
          <div className="relative h-[20vw] flex justify-center items-end overflow-hidden">
            <motion.h1
              initial={{ y: "100%" }}
              whileInView={{ y: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="text-[22vw] leading-[0.7] font-serif text-[#111827] pointer-events-none"
            >
              FacePay
            </motion.h1>
          </div>

          <p className="text-center text-[9px] text-[#4B5563] tracking-[0.4em] mt-10 uppercase">
            © 2025 FacePay. All Rights Reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ContactAndFooter;
