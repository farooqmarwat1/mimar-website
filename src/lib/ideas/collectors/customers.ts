import "server-only";
import { COUNTRY_CODE_TO_REGION, leaksPersonalData, scrubLeadText } from "@/lib/ai/idea-plan";
import { aiIdeas, off, toIdea, type Collector } from "@/lib/ideas/ai";
import { listLeadQuestions } from "@/lib/leads";

/**
 * Customers approach: the questions prospective clients keep asking in our own enquiry form.
 * Leads are personal data, so: contact details and names are scrubbed before the text goes to the
 * AI provider (the same one that writes the drafts), the AI is told to generalise, any idea that
 * still carries a name, email or phone number is dropped, and only the generic question and how
 * many enquiries asked it are stored - never a lead id, a name or a quote.
 */

const WINDOW_DAYS = 90;
/** A question has to come up this often to be a pattern rather than one client's project. */
const MIN_ENQUIRIES = 2;

export const customersCollector: Collector = {
  key: "leads",
  label: "Our enquiries",
  approach: "customers",
  async collect(ctx) {
    if (!ctx.provider) return off("No AI provider is configured.");
    const leads = await listLeadQuestions(new Date(ctx.now.getTime() - WINDOW_DAYS * 86_400_000).toISOString());
    const allNames = leads.flatMap((lead) => lead.names.flatMap((name) => name.split(/\s+/)));
    const items = leads
      .map((lead) => ({ text: scrubLeadText(lead.message, lead.names.flatMap((name) => name.split(/\s+/))), service: lead.service, region: lead.country ? COUNTRY_CODE_TO_REGION[lead.country] : undefined }))
      .filter((item) => item.text.length >= 25)
      .slice(0, 150);
    if (items.length < MIN_ENQUIRIES) return { state: "ok", ideas: [], message: `Only ${items.length} usable enquiries in the last ${WINDOW_DAYS} days.` };

    const suggestions = await aiIdeas(ctx, {
      instruction: `Each item is an anonymised enquiry a prospective client sent the studio (service chosen, country, message). Find the questions, worries or decisions that come up in at least ${MIN_ENQUIRIES} enquiries (scope, timelines, process, what is included, how to compare providers, what affects cost) and turn each into a general blog idea that answers it for everyone. Never describe a specific client, project, company, location detail or budget.`,
      items: items.map((item) => `${item.service ? `[${item.service}] ` : ""}${item.region ? `(${item.region}) ` : ""}${item.text}`),
      max: 6,
    });
    const ideas = suggestions
      .filter((suggestion) => suggestion.sources.length >= MIN_ENQUIRIES)
      .filter((suggestion) => !leaksPersonalData(`${suggestion.title} ${suggestion.keyword} ${suggestion.note}`, allNames))
      .map((suggestion) => toIdea(suggestion, "customers", "leads", { count: suggestion.sources.length, note: `Asked in ${suggestion.sources.length} enquiries in the last ${WINDOW_DAYS} days` }));
    return { state: "ok", ideas, message: `${items.length} enquiries from the last ${WINDOW_DAYS} days read.` };
  },
};
