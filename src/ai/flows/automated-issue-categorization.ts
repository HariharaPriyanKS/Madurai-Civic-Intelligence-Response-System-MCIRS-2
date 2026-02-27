'use server';
/**
 * @fileOverview This file implements a Genkit flow for automated issue categorization.
 *
 * - automatedIssueCategorization - A function that analyzes citizen reports (text, voice, photo)
 *   to automatically categorize issues, identify the relevant ward, and determine the appropriate
 *   department and responsible authority for resolution.
 * - AutomatedIssueCategorizationInput - The input type for the automatedIssueCategorization function.
 * - AutomatedIssueCategorizationOutput - The return type for the automatedIssueCategorization function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// 1. Define Input Schema
const AutomatedIssueCategorizationInputSchema = z.object({
  issueDescription: z.string().describe('A detailed description of the issue reported by the citizen. This can be text or a transcription of a voice report.'),
  imageDataUri: z.string().optional().describe("An optional photo related to the issue, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
  locationDescription: z.string().optional().describe('An optional textual description of the location where the issue occurred (e.g., "Near the old temple on Main Street").'),
  gpsCoordinates: z.string().optional().describe('Optional GPS coordinates (latitude, longitude) of the issue location.'),
});
export type AutomatedIssueCategorizationInput = z.infer<typeof AutomatedIssueCategorizationInputSchema>;

// 2. Define Output Schema
const AutomatedIssueCategorizationOutputSchema = z.object({
  issueCategory: z.enum([
    'Solid Waste', 'Roads & Potholes', 'Streetlights', 'Water Supply', 'Drainage',
    'Public Toilets', 'Encroachments', 'Construction Debris', 'Stray Animals',
    'Traffic Signals', 'Public Safety', 'Environmental Violations', 'Other'
  ]).describe('The automatically classified category of the reported issue.'),
  wardId: z.number().int().min(1).max(100).describe('The ID of the ward where the issue is located.'),
  wardName: z.string().describe('The name of the ward where the issue is located.'),
  department: z.string().describe('The department responsible for handling the issue.'),
  responsibleAuthority: z.string().describe('The specific authority (role) responsible for initial resolution of the issue.'),
  reasoning: z.string().describe('A brief explanation of why the issue was categorized as such and why this ward/department/authority was chosen.'),
});
export type AutomatedIssueCategorizationOutput = z.infer<typeof AutomatedIssueCategorizationOutputSchema>;

// Helper data for wards and issue mappings
const wardList = [
    { id: 1, name: "Santhi Nagar" }, { id: 2, name: "Koodal Nagar" }, { id: 3, name: "Anaiyur" },
    { id: 4, name: "Sambandhar Alankulam" }, { id: 5, name: "B.B.Kulam" }, { id: 6, name: "Meenambalpuram" },
    { id: 7, name: "Kailaasapuram" }, { id: 8, name: "Vilangudi" }, { id: 9, name: "Thathaneri" },
    { id: 10, name: "Aarappalayam" }, { id: 11, name: "Ponnaharam" }, { id: 12, name: "Krishnaapalayam" },
    { id: 13, name: "Azhagaradi" }, { id: 14, name: "Viswasapuri" }, { id: 15, name: "Melapponnaharam" },
    { id: 16, name: "Railway Colony" }, { id: 17, name: "Ellis Nagar" }, { id: 18, name: "S.S.Colony" },
    { id: 19, name: "Ponmeni" }, { id: 20, name: "Arasaradi Othakkadai" }, { id: 21, name: "Bethaniyapuram" },
    { id: 22, name: "Kochadai" }, { id: 23, name: "Visalakshi Nagar" }, { id: 24, name: "Thiruppaalai" },
    { id: 25, name: "Kannanendhal" }, { id: 26, name: "Parasuraamanpatti" }, { id: 27, name: "Karpaga Nagar" },
    { id: 28, name: "Uthangudi" }, { id: 29, name: "Masthaanpatti" }, { id: 30, name: "Melamadai" },
    { id: 31, name: "Tahsildhar Nagar" }, { id: 32, name: "Vandiyur" }, { id: 33, name: "Saathamangalam" },
    { id: 34, name: "Arignar Anna Nagar" }, { id: 35, name: "Madhichiyam" }, { id: 36, name: "Aazhwarpuram" },
    { id: 37, name: "Sellur" }, { id: 38, name: "Pandhalkudi" }, { id: 39, name: "Goripalayam" },
    { id: 40, name: "Ahimsapuram" }, { id: 41, name: "Narimedu" }, { id: 42, name: "Chokkikulam" },
    { id: 43, name: "Tallakulam" }, { id: 44, name: "K.K.Nagar" }, { id: 45, name: "Pudur" },
    { id: 46, name: "Lourdhu Nagar" }, { id: 47, name: "Reserve Line" }, { id: 48, name: "Aathikulam" },
    { id: 49, name: "Naahanakulam" }, { id: 50, name: "Swami Sannidhi" }, { id: 51, name: "Ismailpuram" },
    { id: 52, name: "Sourashtra Hr. Sec. School" }, { id: 53, name: "Pangajam Colony" }, { id: 54, name: "Mariamman Theppakulam" },
    { id: 55, name: "Iraavadhanallur" }, { id: 56, name: "Sinna Anuppanadi" }, { id: 57, name: "Anuppanadi" },
    { id: 58, name: "Chinthamani" }, { id: 59, name: "Meenakshi Nagar" }, { id: 60, name: "Avaniyaapuram" },
    { id: 61, name: "Villapuram Pudhu Nagar" }, { id: 62, name: "Kathirvel Nagar" }, { id: 63, name: "Villaapuram" },
    { id: 64, name: "Keeraithurai" }, { id: 65, name: "Sappani Kovil" }, { id: 66, name: "South Krishnan Kovil" },
    { id: 67, name: "Manjanakara Street" }, { id: 68, name: "Dhrowpathi Amman Kovil" }, { id: 69, name: "St.Marys" },
    { id: 70, name: "Kaamarajapuram" }, { id: 71, name: "Balaranganathapuram" }, { id: 72, name: "Navarathinapuram" },
    { id: 73, name: "Lakshmipuram" }, { id: 74, name: "Thirumalai Naicker Mahal" }, { id: 75, name: "Maadakkulam" },
    { id: 76, name: "Pazhangaanatham" }, { id: 77, name: "Sundarajapuram" }, { id: 78, name: "Madurai Baskaradass Nagar" },
    { id: 79, name: "Perumal Theppakulam" }, { id: 80, name: "Krishnarayar Theppakulam" }, { id: 81, name: "Tamilsangam" },
    { id: 82, name: "Sokkanadhar Kovil" }, { id: 83, name: "North Krishnan Kovil" }, { id: 84, name: "Meenakshi Kovil" },
    { id: 85, name: "Jadamuni Kovil" }, { id: 86, name: "Kaajimar Street" }, { id: 87, name: "Subramaniapuram" },
    { id: 88, name: "Solai Azhagupuram" }, { id: 89, name: "Jaihindpuram" }, { id: 90, name: "Veerakali Amman Kovil" },
    { id: 91, name: "Thennaharam" }, { id: 92, name: "Kovalan Nagar" }, { id: 93, name: "T.V.S.Nagar" },
    { id: 94, name: "Paamban Swami Nagar" }, { id: 95, name: "Mannar College" }, { id: 96, name: "Thirupparamkundram" },
    { id: 97, name: "Haarvipatti" }, { id: 98, name: "Thirunahar" }, { id: 99, name: "Balaji Nagar" },
    { id: 100, name: "Muthuramalingapuram" }
];

const issueMappings = [
    { category: 'Solid Waste', department: 'Sanitation', authority: 'Sanitation Worker' },
    { category: 'Roads & Potholes', department: 'Public Works', authority: 'Ward Officer' },
    { category: 'Streetlights', department: 'Electrical', authority: 'Ward Officer' },
    { category: 'Water Supply', department: 'Water Management', authority: 'Ward Officer' },
    { category: 'Drainage', department: 'Public Works', authority: 'Ward Officer' },
    { category: 'Public Toilets', department: 'Sanitation', authority: 'Ward Officer' },
    { category: 'Encroachments', department: 'Revenue', authority: 'Tahsildar' },
    { category: 'Construction Debris', department: 'Public Works', authority: 'Ward Officer' },
    { category: 'Stray Animals', department: 'Animal Welfare', authority: 'Ward Officer' },
    { category: 'Traffic Signals', department: 'Traffic Management', authority: 'Police Authority' },
    { category: 'Public Safety', department: 'Law & Order', authority: 'Police Authority' },
    { category: 'Environmental Violations', department: 'Environment', authority: 'Ward Officer' },
    { category: 'Other', department: 'General Administration', authority: 'Ward Officer' },
];

// 3. Define the Prompt
const issueCategorizationPrompt = ai.definePrompt({
  name: 'issueCategorizationPrompt',
  input: { schema: AutomatedIssueCategorizationInputSchema },
  output: { schema: AutomatedIssueCategorizationOutputSchema },
  prompt: `You are an AI assistant for the Madurai Civic Intelligence & Response System (MCIRS). Your task is to intelligently analyze citizen issue reports and categorize them, identify the correct ward, and determine the responsible department and authority.

Here is the list of all 100 wards in Madurai, with their IDs and names. Use this list to accurately identify the ward based on the provided description. Prioritize ward names explicitly mentioned or strongly implied by location details in the description. If GPS coordinates are provided, consider the general area they indicate for ward inference:
${wardList.map(w => `- Ward ID: ${w.id}, Ward Name: ${w.name}`).join('\n')}

Here are the possible issue categories and their corresponding departments and initial responsible authorities. You MUST choose one category exactly as listed:
${issueMappings.map(m => `- Category: ${m.category}, Department: ${m.department}, Authority: ${m.authority}`).join('\n')}

Based on the citizen's report, categorize the issue, identify the most appropriate ward (ID and Name), department, and responsible authority.
If no specific ward can be identified from the description or image, infer a logical ward if possible, otherwise, use Ward 1 (Santhi Nagar) as a default.

Citizen's Issue Report:
Description: "{{{issueDescription}}}"
{{#if locationDescription}}Location Description: "{{{locationDescription}}}"{{/if}}
{{#if gpsCoordinates}}GPS Coordinates: "{{{gpsCoordinates}}}"{{/if}}
{{#if imageDataUri}}Photo: {{media url=imageDataUri}}{{/if}}

Provide your response strictly in JSON format according to the provided output schema. Include a 'reasoning' field explaining your choices for category, ward, department, and authority.`,
});

// 4. Define the Flow
const automatedIssueCategorizationFlow = ai.defineFlow(
  {
    name: 'automatedIssueCategorizationFlow',
    inputSchema: AutomatedIssueCategorizationInputSchema,
    outputSchema: AutomatedIssueCategorizationOutputSchema,
  },
  async (input) => {
    let output = await issueCategorizationPrompt(input).then(res => res.output);

    if (!output) {
      throw new Error('Failed to categorize issue: No output from AI model.');
    }

    let reasoningUpdates: string[] = [];

    // --- Validate and correct issueCategory, Department, and Authority ---
    const validCategories = AutomatedIssueCategorizationOutputSchema.shape.issueCategory.options;
    const initialCategory = output.issueCategory;
    let correspondingMapping = issueMappings.find(m => m.category === initialCategory);

    if (!correspondingMapping) {
        // Attempt a case-insensitive match for flexibility
        correspondingMapping = issueMappings.find(m => m.category.toLowerCase() === initialCategory.toLowerCase());
        if (correspondingMapping) {
            output.issueCategory = correspondingMapping.category; // Correct to canonical casing
            reasoningUpdates.push(`Corrected issue category from '${initialCategory}' to canonical '${output.issueCategory}'.`);
        } else {
            // Default to 'Other' if no valid category found
            output.issueCategory = 'Other';
            correspondingMapping = issueMappings.find(m => m.category === 'Other');
            reasoningUpdates.push(`Original category '${initialCategory}' was not valid; defaulted to 'Other'.`);
        }
    }
    // Ensure department and authority are consistent with the final issueCategory
    if (correspondingMapping) {
        if (output.department !== correspondingMapping.department) {
            reasoningUpdates.push(`Corrected department from '${output.department}' to '${correspondingMapping.department}' for category '${output.issueCategory}'.`);
            output.department = correspondingMapping.department;
        }
        if (output.responsibleAuthority !== correspondingMapping.authority) {
            reasoningUpdates.push(`Corrected responsible authority from '${output.responsibleAuthority}' to '${correspondingMapping.authority}' for category '${output.issueCategory}'.`);
            output.responsibleAuthority = correspondingMapping.authority;
        }
    }


    // --- Validate and correct wardId and wardName ---
    const initialWardId = output.wardId;
    const initialWardName = output.wardName;
    let foundWard = wardList.find(w => w.id === initialWardId || w.name.toLowerCase() === initialWardName.toLowerCase());

    if (!foundWard) {
        // If ward is not found or invalid, default to Ward 1
        const defaultWard = wardList[0]; // Santhi Nagar
        output.wardId = defaultWard.id;
        output.wardName = defaultWard.name;
        reasoningUpdates.push(`Original ward '${initialWardName}' (ID: ${initialWardId}) was not found or invalid; defaulted to Ward ${defaultWard.id}, ${defaultWard.name}.`);
    } else {
        // Ensure consistency between ID and Name
        if (output.wardId !== foundWard.id) {
            reasoningUpdates.push(`Corrected ward ID from '${initialWardId}' to '${foundWard.id}' to match name '${foundWard.name}'.`);
            output.wardId = foundWard.id;
        }
        if (output.wardName.toLowerCase() !== foundWard.name.toLowerCase()) {
            reasoningUpdates.push(`Corrected ward name from '${initialWardName}' to canonical '${foundWard.name}' for ID '${foundWard.id}'.`);
            output.wardName = foundWard.name;
        }
    }

    // Append any corrections to the original reasoning
    if (reasoningUpdates.length > 0) {
        output.reasoning = (output.reasoning ? output.reasoning + ' ' : '') + `[Post-processing corrections: ${reasoningUpdates.join(' ')}]`;
    }

    return output;
  }
);

export async function automatedIssueCategorization(input: AutomatedIssueCategorizationInput): Promise<AutomatedIssueCategorizationOutput> {
  return automatedIssueCategorizationFlow(input);
}
