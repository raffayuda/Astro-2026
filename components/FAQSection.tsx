"use client";

import { FaInstagram } from "react-icons/fa";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { SectionHeading, SectionShell, Surface, WindowCard } from "@/components/brand";
import type { FAQItem } from "@/types/astro";

interface Props {
  faqs: FAQItem[];
}

export default function FAQSection({ faqs }: Props) {
  return (
    <SectionShell id="faq" band="tint" space="md">
      <SectionHeading
        eyebrow="FAQ"
        pillTone="blue"
        title="Yang sering ditanya"
        lead="Jawaban singkat sebelum kamu daftar."
        align="start"
      />

      <WindowCard title="FAQ" className="mt-6 sm:mt-8">
        <Accordion
          type="single"
          collapsible
          defaultValue="item-0"
          className="flex flex-col gap-2"
        >
          {faqs.map((faq, index) => (
            <AccordionItem
              key={faq.q}
              value={`item-${index}`}
              className="border-b border-sky-mid/60 last:border-b-0"
            >
              <AccordionTrigger className="min-h-11 gap-4 py-3.5 text-left font-heading text-sm font-extrabold tracking-tight text-astro-navy hover:no-underline md:text-base">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="pb-4 text-sm font-medium leading-relaxed text-ink/75">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <Surface
          tone="tint"
          radius="xl"
          pad="md"
          className="mt-6 flex w-full flex-col items-stretch gap-3 text-center shadow-none sm:flex-row sm:items-center sm:justify-between sm:text-left"
        >
          <p className="text-sm font-semibold text-ink/80">
            Belum ketemu jawaban? Tanya panitia di Instagram.
          </p>
          <Button asChild variant="outline" size="sm" className="w-full shrink-0 rounded-full sm:w-auto">
            <a href="https://instagram.com/astrosttnf" target="_blank" rel="noopener noreferrer">
              <FaInstagram data-icon="inline-start" />
              @astrosttnf
            </a>
          </Button>
        </Surface>
      </WindowCard>
    </SectionShell>
  );
}
