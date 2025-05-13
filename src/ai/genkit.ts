import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [googleAI()],
  // No default model specified at the AI instance level.
  // Prompts or generate calls will need to specify their models,
  // or Genkit might error if no model can be resolved.
});
