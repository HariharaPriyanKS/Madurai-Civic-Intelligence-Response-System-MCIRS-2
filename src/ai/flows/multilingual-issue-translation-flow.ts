'use server';
/**
 * @fileOverview A Genkit flow for translating text between Tamil and English.
 *
 * - translateText - A function that handles the translation process.
 * - MultilingualTranslationInput - The input type for the translateText function.
 * - MultilingualTranslationOutput - The return type for the translateText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MultilingualTranslationInputSchema = z.object({
  textToTranslate: z.string().describe('The text to be translated.'),
  sourceLanguage: z
    .enum(['Tamil', 'English'])
    .describe('The original language of the text. Must be either "Tamil" or "English".'),
  targetLanguage: z
    .enum(['Tamil', 'English'])
    .describe('The target language for the translation. Must be either "Tamil" or "English".'),
});
export type MultilingualTranslationInput = z.infer<
  typeof MultilingualTranslationInputSchema
>;

const MultilingualTranslationOutputSchema = z.object({
  translatedText: z.string().describe('The translated text.'),
});
export type MultilingualTranslationOutput = z.infer<
  typeof MultilingualTranslationOutputSchema
>;

export async function translateText(
  input: MultilingualTranslationInput
): Promise<MultilingualTranslationOutput> {
  return multilingualTranslationFlow(input);
}

const translationPrompt = ai.definePrompt({
  name: 'multilingualTranslationPrompt',
  input: {schema: MultilingualTranslationInputSchema},
  output: {schema: MultilingualTranslationOutputSchema},
  prompt: `You are a highly skilled and professional translator. Your task is to accurately translate text from the source language to the target language, maintaining context and nuance.

Translate the following text from {{{sourceLanguage}}} to {{{targetLanguage}}}:

Text to translate: """{{{textToTranslate}}}"""

Provide only the translated text in your response.`,
});

const multilingualTranslationFlow = ai.defineFlow(
  {
    name: 'multilingualTranslationFlow',
    inputSchema: MultilingualTranslationInputSchema,
    outputSchema: MultilingualTranslationOutputSchema,
  },
  async input => {
    const {output} = await translationPrompt(input);
    return output!;
  }
);
