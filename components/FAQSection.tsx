'use client';

import Image from 'next/image';
import { motion, useReducedMotion } from 'motion/react';
import { FaInstagram } from 'react-icons/fa';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { FAQItem } from '@/types/astro';

const MotionImage = motion.create(Image);

interface Props {
  faqs: FAQItem[];
}

export default function FAQSection({ faqs }: Props) {
  const reduce = useReducedMotion();

  return (
    <section id="faq" className="relative overflow-hidden py-24 md:py-32">
      {/* Background — starts at sky-100 (connects Timeline's bottom) → deeper sky */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-sky-100 via-sky-200 to-slate-50" />

      {/* ─── FLOATING BLOB ROUND IMAGES ─── */}
      <MotionImage
        src="/assets/blob-round.png"
        alt=""
        width={144}
        height={144}
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute top-[8%] left-[6%] z-0 size-24 object-contain select-none md:size-36"
      />
      <MotionImage
        src="/assets/blob-round.png"
        alt=""
        width={128}
        height={128}
        animate={{ y: [0, -14, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute top-[15%] right-[3%] z-0 size-20 object-contain select-none md:size-32"
      />
      <MotionImage
        src="/assets/blob-round.png"
        alt=""
        width={96}
        height={96}
        animate={{ y: [0, -16, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute top-[55%] left-[2%] z-0 size-16 object-contain select-none md:size-24"
      />
      <MotionImage
        src="/assets/blob-round.png"
        alt=""
        width={112}
        height={112}
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute top-[60%] right-[6%] z-0 size-20 object-contain select-none md:size-28"
      />

      {/* ─── FISH IMAGES ─── */}
      <MotionImage
        src="/assets/fish1.png"
        alt=""
        width={112}
        height={80}
        animate={{ x: [0, 25, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute top-[28%] left-[1%] z-0 h-auto w-20 object-contain opacity-60 select-none md:w-28"
      />
      <MotionImage
        src="/assets/fish-in-blob.png"
        alt=""
        width={128}
        height={96}
        animate={{ y: [0, -18, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute right-[2%] bottom-[15%] z-0 h-auto w-24 object-contain opacity-60 select-none md:w-32"
      />

      {/* Angular accent lines */}
      <div className="pointer-events-none absolute top-[20%] -left-[10%] size-[400px] rounded-full bg-sky-500/5 blur-[120px]" />
      <div className="pointer-events-none absolute right-[5%] bottom-[30%] h-[2px] w-[100px] skew-x-[-12deg] bg-gradient-to-r from-sky-300/20 to-transparent" />

      <div className="relative z-10 mx-auto mb-10 max-w-3xl px-4 sm:px-6">
        {/* Section Header */}
        <motion.div
          className="mb-12 text-center md:mb-14"
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as const }}
        >
          <div className="mb-3 flex justify-center">
            <div className="accent-line" />
          </div>
          <h2 className="font-masterpiece mb-3 text-5xl leading-tight text-slate-900 md:text-6xl lg:text-7xl">
            Frequently Asked <span className="text-sky-500">Questions</span>
          </h2>
          <p className="text-sm font-light leading-relaxed text-slate-600 md:text-base">
            Punya pertanyaan? Cek dulu FAQ berikut.
          </p>
        </motion.div>

        <Accordion type="single" collapsible defaultValue="item-0">
          {faqs.map((faq, idx) => (
            <motion.div
              key={idx}
              initial={reduce ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05, duration: 0.4 }}
            >
              <AccordionItem
                value={`item-${idx}`}
                className="clip-angled mb-3 overflow-hidden border border-border bg-white transition-all duration-200 data-[state=open]:border-primary/40 data-[state=open]:shadow-sm"
              >
                <AccordionTrigger className="gap-4 p-5 text-sm font-bold tracking-tight hover:no-underline md:p-6 md:text-base">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="border-t border-border px-5 pt-4 text-sm leading-relaxed text-muted-foreground md:px-6 md:text-base">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            </motion.div>
          ))}
        </Accordion>

        {/* Bottom CTA */}
        <motion.div
          className="mt-10 text-center"
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="clip-angled-lg inline-flex flex-col items-center gap-3 border border-border bg-white p-8 shadow-sm">
            <div className="clip-angled-sm border border-pink-200 bg-gradient-to-tr from-amber-50 via-rose-50 to-purple-50 p-3">
              <FaInstagram className="size-6 text-pink-600" />
            </div>
            <div>
              <p className="text-sm font-black uppercase tracking-wider text-foreground">Masih punya pertanyaan?</p>
              <p className="mt-1 text-sm font-light text-muted-foreground">Hubungi kami langsung melalui Direct Message Instagram.</p>
            </div>
            <Button asChild variant="default" className="clip-angled bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 text-white text-xs font-black uppercase tracking-wider hover:opacity-90 active:scale-95 shadow-md">
              <a href="https://instagram.com/astrosttnf" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                <FaInstagram className="size-4" /> Hubungi @astrosttnf
              </a>
            </Button>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
