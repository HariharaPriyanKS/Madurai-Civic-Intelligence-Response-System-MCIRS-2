import { config } from 'dotenv';
config();

import '@/ai/flows/multilingual-issue-translation-flow.ts';
import '@/ai/flows/issue-escalation-summary.ts';
import '@/ai/flows/automated-issue-categorization.ts';