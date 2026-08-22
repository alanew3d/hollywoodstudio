"use client"

import * as Accordion from "@radix-ui/react-accordion"
import { ChevronDown } from "lucide-react"

interface FAQItem {
  question: string
  answer: string
}

interface FAQSectionProps {
  faqs: FAQItem[]
}

export function FAQSection({ faqs }: FAQSectionProps) {
  return (
    <div className="max-w-3xl mx-auto">
      <h3 className="text-2xl font-bold text-center mb-8 text-foreground">
        ❓ Quick FAQ
      </h3>
      
      <Accordion.Root type="multiple" className="space-y-4">
        {faqs.map((faq, index) => (
          <Accordion.Item
            key={index}
            value={`item-${index}`}
            className="bg-white rounded-lg border border-gray-200 overflow-hidden"
          >
            <Accordion.Header>
              <Accordion.Trigger className="flex w-full items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors group">
                <span className="font-semibold text-foreground pr-4">
                  {faq.question}
                </span>
                <ChevronDown className="w-5 h-5 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content className="data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up overflow-hidden">
              <div className="px-6 pb-6 pt-2 text-muted-foreground">
                {faq.answer}
              </div>
            </Accordion.Content>
          </Accordion.Item>
        ))}
      </Accordion.Root>
    </div>
  )
}