
'use server';
/**
 * @fileOverview An AI-powered coding assistant.
 *
 * - assistWithCode - A function that provides coding assistance.
 * - CodingAssistantInput - The input type for the assistWithCode function.
 * - CodingAssistantOutput - The return type for the assistWithCode function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CodingAssistantInputSchema = z.object({
  query: z.string().describe('The user PII-redacted coding question or problem description.'),
  programmingLanguage: z.string().optional().describe('The programming language relevant to the query, if any. Can be a standard language or a BBS framework type like "BBS", ".fold", ".if", ".pxr", ".pmf", ".edb", ".idb".'),
  context: z.string().optional().describe('Any additional context or code snippets provided by the user. User PII-redacted.'),
});
export type CodingAssistantInput = z.infer<typeof CodingAssistantInputSchema>;

const CodingAssistantOutputSchema = z.object({
  explanation: z.string().describe('A clear, step-by-step explanation or answer to the coding query.'),
  codeSuggestions: z.array(z.string()).optional().describe('Relevant code snippets or examples, if applicable. For BBS types, this will be conceptual BBS framework code.'),
  potentialIssues: z.array(z.string()).optional().describe('Potential issues or considerations related to the query or suggested code.'),
});
export type CodingAssistantOutput = z.infer<typeof CodingAssistantOutputSchema>;

export async function assistWithCode(input: CodingAssistantInput): Promise<CodingAssistantOutput> {
  return codingAssistantFlow(input);
}

const BBS_FRAMEWORK_SUMMARY_FOR_CODING_ASSISTANT = `
You are an expert in the conceptual BinaryBlocksphere (BBS) Framework.
If the programmingLanguage is 'BBS' or a specific BBS file extension (.fold, .if, .pxr, .pmf, .bbs, .edb, .idb), your response should be tailored to that BBS concept.

BBS Framework Overview:
- .bbs: App Launcher (JSON-like manifest for a BBS application). Structure typically includes appName, version, entryFold, assets, permissions.
- .fold (Framework Object Layout Definition): Defines main structure, layout, hierarchy.
  - Example Root Layout: 'ScreenLayout,FixedFluid,Height,Width,DisplayType-\${content_sources}'
  - ScreenLayout: FullScreen, SplitHorizontal, Grid[rows,cols], Tabs.
  - Content Sources: self (for the fold's container), filename.if (includes content), filename.fold (nests another fold), ComponentName (predefined BBS component).
- .if (Inner Fold - Content Definition): Defines detailed content for sections using symbol-based syntax.
  - !Text content!
  - @dynamic_placeholder@ or @SectionTitle: Some Title@
  - #element_id { path: "PAX:images/logo.png"; shape: image; size: 100px auto; /* other PXR-like props */ } (PAX: is asset dir prefix)
  - * List item or multi-line text. Example for menu naming: *MenuName1* *MenuName2* implies order.
  - •Container/Group• Image layering example: • #img_bg {path:"bg.png"}; + #img_fg {path:"fg.png"}; - #img_far_bg {path:"far_bg.png"} • (+ for on top, - for behind, multiple for z-index)
  - -variable_definition = value- or -style_ref=my_pxr_class- (applies PXR class)
  - {dynamic_data_placeholder} or {list_container_id} {list_item_template.if} {object_type1, object_type2} (for populating lists)
  - [Button Text] ( (action: "action_name") (target: "target_id") (icon: "PAX:icon.svg") (styleClass: "pxr_class_name") (W°120px/button) (H°height/button) )
- .pxr (Pixelative Extended Reality): Defines visual presentation, styling, layout, animations (CSS-like).
  - Selectors: #element_id, .class_name, element_type (e.g. button), $layout_id_from_fold.
  - Properties: color, background-color, font-size, padding, border-radius, display, flex-direction, align-items, box-shadow, transition, backdrop-filter.
  - Variables: {var_theme_color} (defined in a global theme or at root of PXR file).
  - Animations: @animation animation_name { from { opacity:0; transform: translateY(10px); } to { opacity:1; transform: translateY(0px); } duration: 0.5s; timing-function: ease-out; }
- .pmf (Pixelative Manipulated Flow): Defines interactive flows, event handling, dynamic content manipulation.
  - Event Listener Block: @ 'event_name' on '<element_id_or_selector>' [filter: <condition>] ? (payload_mapping e.g., (value: event.target.value)) ¿ ...actions... ¿
  - Actions:
    - UI: UPDATE_CONTENT '<id>' with <"literal" | \`template_\${var}\` | content_from_if_template("template.if", data_obj)>, SHOW_ELEMENT, HIDE_ELEMENT, TOGGLE_CLASS, SET_ATTRIBUTE, DISPLAY_POPOVER, NAVIGATE_TO_FOLD.
    - Data: FETCH_DATA "efb:bridge_function" [with_payload: {data}] THEN (response) => { /* nested_actions */ } CATCH (error) => { /* error_actions */ }, SAVE_DATA.
    - Logic: IF <condition> THEN { } [ELSE IF <condition> THEN { }] [ELSE { }] ENDIF, LOOP_OVER <data_array> AS item DO { } ENDLOOP.
- .efb (External Frontend Bridge): Conceptual bridge between frontend and host/BBS environment.
- .ifb (Internal Backend Bridge): Conceptual bridge for backend logic and core BBS services.
- .edb (External Rendering Bot Definition): Contains natural language input for an AI (like you) to generate frontend files (.fold, .if, .pxr, .pmf).
- .idb (Internal Rendering Bot Definition): Contains natural language input for an AI (like you) to generate backend/internal logic or .ifb services.

When asked to generate BBS code, provide it in the conceptual syntax described.
If the query is about .edb or .idb, explain that these files are used to prompt an AI to generate the other BBS file types and provide an example of what such a natural language prompt might look like.
`;

const prompt = ai.definePrompt({
  name: 'codingAssistantPrompt',
  input: {schema: CodingAssistantInputSchema},
  output: {schema: CodingAssistantOutputSchema},
  prompt: `You are an unbiased, highly skilled, and helpful AI coding assistant. Your goal is to provide clear, accurate, and actionable advice to developers.
Focus on understanding the user's query and providing relevant explanations, code examples, and potential considerations.
Be concise but thorough. If the user provides code, analyze it constructively.
Avoid expressing personal opinions or biases. Stick to factual information and best practices.

{{#if programmingLanguage}}
{{#if (includes (toLowerCase programmingLanguage) "bbs") || (includes (toLowerCase programmingLanguage) ".fold") || (includes (toLowerCase programmingLanguage) ".if") || (includes (toLowerCase programmingLanguage) ".pxr") || (includes (toLowerCase programmingLanguage) ".pmf") || (includes (toLowerCase programmingLanguage) ".edb") || (includes (toLowerCase programmingLanguage) ".idb")}}
${BBS_FRAMEWORK_SUMMARY_FOR_CODING_ASSISTANT}
Your response should focus on the BBS Framework syntax and concepts related to '{{{programmingLanguage}}}'.
{{/if}}
{{/if}}

User Query:
{{{query}}}

{{#if programmingLanguage}}
Programming Language: {{{programmingLanguage}}}
{{/if}}

{{#if context}}
Additional Context/Code:
\`\`\`
{{{context}}}
\`\`\`
{{/if}}

Please provide:
1. A detailed explanation addressing the user's query. If it's about BBS, explain using BBS concepts.
2. If applicable, provide relevant code suggestions. Ensure code is well-formatted. For BBS, generate conceptual BBS syntax.
3. If applicable, list any potential issues or important considerations.
`,
  config: {
    temperature: 0.3, // Lower temperature for more factual and less creative responses
     safetySettings: [
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
    ]
  }
});

// Helper function for Handlebars
import Handlebars from 'handlebars';
Handlebars.registerHelper('includes', function (stringToCheck, substring, options) {
  if (typeof stringToCheck === 'string' && typeof substring === 'string') {
    return stringToCheck.includes(substring) ? options.fn(this) : options.inverse(this);
  }
  return options.inverse(this);
});
Handlebars.registerHelper('toLowerCase', function(str) {
  if (typeof str === 'string') {
    return str.toLowerCase();
  }
  return str;
});


const codingAssistantFlow = ai.defineFlow(
  {
    name: 'codingAssistantFlow',
    inputSchema: CodingAssistantInputSchema,
    outputSchema: CodingAssistantOutputSchema,
  },
  async input => {
    // Sanitize inputs (concept - actual sanitization might be more complex)
    const sanitizedInput = {
      query: input.query.replace(/<script.*?>.*?<\/script>/gi, ''), // Basic script tag removal
      programmingLanguage: input.programmingLanguage?.replace(/<script.*?>.*?<\/script>/gi, ''),
      context: input.context?.replace(/<script.*?>.*?<\/script>/gi, ''),
    };

    const {output} = await prompt(sanitizedInput);
    
    if (!output) {
        // Handle cases where the LLM might not return valid structured output
        // or if the content is blocked by safety settings.
        return {
            explanation: "I apologize, but I couldn't generate a response for that query. This might be due to safety filters or an inability to process the request. Please try rephrasing your query or ensure it aligns with safe usage guidelines.",
            codeSuggestions: [],
            potentialIssues: ["Response generation failed or content was filtered."]
        };
    }
    return output;
  }
);

