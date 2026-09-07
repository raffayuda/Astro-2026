"use client";

import { motion, useReducedMotion } from "motion/react";
import { FaInstagram } from "react-icons/fa";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Pattern,
  Pill,
  SectionHeading,
  SectionShell,
  Surface,
} from "@/components/brand";
import type { FAQItem } from "@/types/astro";

interface Props {
  faqs: FAQItem[];
}

export default function FAQSection({ faqs }: Props) {
  const reduce = useReducedMotion();

  return (
    <SectionShell
      id="faq"
      sky="none"
      width="wide"
      className="relative overflow-hidden bg-linear-to-b from-white via-sky-bottom to-surface py-18 md:py-24"
    >
      <Pattern className="absolute inset-0 -z-10 opacity-25" />

      <div className="grid gap-8 lg:grid-cols-[0.42fr_0.58fr] lg:items-start">
        <motion.aside
          initial={reduce ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as const }}
          className="lg:sticky lg:top-24"
        >
          <Surface
            tone="blue"
            radius="2xl"
            pad="xl"
            className="overflow-hidden"
          >
            <SectionHeading
              eyebrow="FAQ"
              title="Pertanyaan yang sering muncul"
              lead="Jawaban singkat untuk hal yang paling sering ditanyakan peserta sebelum daftar."
              align="start"
              chrome={false}
              className="[&_[data-slot=pill]]:bg-white/20 [&_[data-slot=pill]]:text-white [&_h2]:text-white [&_p]:text-white/82"
            />

            <div className="mt-8 rounded-xl bg-white/14 p-4 ring-1 ring-inset ring-white/25">
              <Pill tone="gold" size="sm">
                Kontak cepat
              </Pill>
              <p className="mt-3 text-sm font-medium leading-relaxed text-white/84">
                Kalau pertanyaanmu belum ada di daftar, hubungi panitia melalui
                Instagram resmi ASTRO.
              </p>
              <Button
                asChild
                variant="secondary"
                className="mt-5 w-full rounded-full text-xs font-black uppercase tracking-wider"
              >
                <a
                  href="https://instagram.com/astrosttnf"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaInstagram data-icon="inline-start" />
                  Hubungi @astrosttnf
                </a>
              </Button>
            </div>
          </Surface>
        </motion.aside>

        <Accordion type="single" collapsible defaultValue="item-0" className="flex flex-col gap-3">
          {faqs.map((faq, index) => (
            <motion.div
              key={`${faq.q}-${index}`}
              initial={reduce ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.04, duration: 0.35 }}
            >
              <AccordionItem
                value={`item-${index}`}
                className="overflow-hidden rounded-xl border border-astro-cyan-2/55 bg-white/90 px-1 shadow-soft-sm transition-all duration-200 data-[state=open]:border-astro-blue/45 data-[state=open]:shadow-soft"
              >
                <AccordionTrigger className="gap-4 px-5 py-5 text-left text-sm font-extrabold tracking-tight text-astro-navy hover:no-underline md:text-base">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="border-t border-astro-cyan-2/35 px-5 pb-5 pt-4 text-sm font-medium leading-relaxed text-ink/78 md:text-base">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            </motion.div>
          ))}
        </Accordion>
      </div>
    </SectionShell>
  );
}
