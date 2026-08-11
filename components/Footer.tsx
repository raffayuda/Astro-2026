'use client';

import Image from 'next/image';
import { motion, useReducedMotion } from 'motion/react';
import { Heart } from 'lucide-react';
import { FaInstagram, FaTiktok, FaYoutube } from 'react-icons/fa6';
import { Button } from '@/components/ui/button';

export default function Footer() {
  const reduce = useReducedMotion();

  const socialLinks = [
    { icon: FaInstagram, label: 'Instagram', href: 'https://www.instagram.com/astrosttnf/' },
    { icon: FaTiktok, label: 'TikTok', href: 'https://www.tiktok.com/@astro.fest.competition' },
    { icon: FaYoutube, label: 'YouTube', href: 'https://www.youtube.com/@ASTROSTTNF' },
  ];

  return (
    <footer className="relative bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid md:grid-cols-3 gap-8 md:gap-12">
          {/* Brand */}
          <motion.div
            className="md:col-span-1 relative"
            initial={reduce ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >

            <div className="flex items-center gap-3 mb-3 relative z-10">
              <Image
                src="/assets/logo-astro.png"
                alt="ASTRO Logo"
                width={48}
                height={48}
                className="w-10 h-10 md:w-12 md:h-12 object-contain"
              />
              <span className="font-masterpiece text-xl md:text-2xl font-black tracking-tight bg-gradient-to-r from-slate-950 via-slate-800 to-cyan-600 bg-clip-text text-transparent">
                ASTRO 2026
              </span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed max-w-xs relative z-10">
              Ajang kompetisi dan kreativitas terbesar yang menggabungkan akademik, olahraga, dan esports dalam satu panggung spektakuler.
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Tautan Cepat</h3>
            <ul className="space-y-2.5">
              {[
                { label: 'Beranda', href: '/#home' },
                { label: 'Tentang', href: '/#about' },
                { label: 'Lomba', href: '/#competitions' },
                { label: 'Timeline', href: '/#timeline' },
                { label: 'FAQ', href: '/#faq' },
              ].map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-slate-600 hover:text-cyan-600 transition-all duration-200 ease-in-out"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Social */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Ikuti Kami</h3>
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <Button
                    key={social.label}
                    asChild
                    variant="outline"
                    size="icon"
                    aria-label={social.label}
                    className="rounded-xl border-slate-200 text-slate-600 hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-600"
                  >
                    <a href={social.href} target="_blank" rel="noopener noreferrer">
                      <Icon />
                    </a>
                  </Button>
                );
              })}
            </div>
          </motion.div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            &copy; 2026 ASTRO 2026. All rights reserved.
          </p>
          <p className="text-xs text-slate-500 flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-red-500" /> by the ASTRO Team
          </p>
        </div>
      </div>
    </footer>
  );
}
