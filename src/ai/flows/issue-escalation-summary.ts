'use server';
/**
 * @fileOverview A Genkit flow that generates a concise summary of an escalated civic issue.
 *
 * - issueEscalationSummary - A function that handles the generation of an issue summary for a Zonal Officer.
 * - IssueEscalationSummaryInput - The input type for the issueEscalationSummary function.
 * - IssueEscalationSummaryOutput - The return type for the issueEscalationSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IssueEscalationSummaryInputSchema = z.object({
  citizenReport: z
    .string()
    .describe('The original report submitted by the citizen, including details and context.'),
  issueHistory: z
    .string()
    .describe('A chronological log of all events and updates related to the issue.'),
  previousActions: z
    .string()
    .describe('A summary of all actions that have been taken to address the issue so far.'),
});
export type IssueEscalationSummaryInput = z.infer<
  typeof IssueEscalationSummaryInputSchema
>;

const IssueEscalationSummaryOutputSchema = z.object({
  summary: z
    .string()
    .describe(
      'A concise summary of the issue, its history, and previous actions, tailored for a Zonal Officer.'
    ),
});
export type IssueEscalationSummaryOutput = z.infer<
  typeof IssueEscalationSummaryOutputSchema
>;

export async function issueEscalationSummary(
  input: IssueEscalationSummaryInput
): Promise<IssueEscalationSummaryOutput> {
  return issueEscalationSummaryFlow(input);
}

const issueEscalationSummaryPrompt = ai.definePrompt({
  name: 'issueEscalationSummaryPrompt',
  input: {schema: IssueEscalationSummaryInputSchema},
  output: {schema: IssueEscalationSummaryOutputSchema},
  prompt: `You are an AI assistant designed to help a Zonal Officer quickly understand escalated civic issues.
Your task is to provide a concise summary based on the following information:

Original Citizen Report:
{{{citizenReport}}}

Issue History:
{{{issueHistory}}}

Previous Actions Taken:
{{{previousActions}}}

Synthesize this information into a brief, actionable summary that highlights the core problem, its progression, and what has been attempted so far, to enable the Zonal Officer to make an informed decision without reviewing lengthy details.`,
});

const issueEscalationSummaryFlow = ai.defineFlow(
  {
    name: 'issueEscalationSummaryFlow',
    inputSchema: IssueEscalationSummaryInputSchema,
    outputSchema: IssueEscalationSummaryOutputSchema,
  },
  async (input) => {
    const {output} = await issueEscalationSummaryPrompt(input);
    return output!;
  }
);
