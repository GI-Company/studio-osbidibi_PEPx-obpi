'use server';
/**
 * @fileOverview An AI-powered chat assistant with tiered capabilities.
 *
 * - chatWithAI - A function that handles chat interactions.
 * - ChatAssistantInput - The input type for the chatWithAI function.
 * - ChatAssistantOutput - The return type for the chatWithAI function.
 * - UserTier - Defines the different access tiers for users.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type {AuthUser} from '@/contexts/AuthContext'; // Assuming AuthUser type is exported

export type UserTier = AuthUser['subscriptionTier'];

const ChatMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

const ChatAssistantInputSchema = z.object({
  message: z.string().describe('The user PII-redacted message.'),
  history: z.array(ChatMessageSchema).optional().describe('The conversation history.'),
  userTier: z.enum(['admin', 'trial', 'paid_weekly', 'paid_monthly', 'free_limited']).describe('The user\'s access tier.'),
  // In a real scenario, other user-specific context might be passed here.
});
export type ChatAssistantInput = z.infer<typeof ChatAssistantInputSchema>;

const ChatAssistantOutputSchema = z.object({
  response: z.string().describe('The AI\'s response to the user.'),
  // Potentially add other fields like suggested actions, generated code (for admin), etc.
});
export type ChatAssistantOutput = z.infer<typeof ChatAssistantOutputSchema>;


export async function chatWithAI(input: ChatAssistantInput): Promise<ChatAssistantOutput> {
  return chatAssistantFlow(input);
}

const BBS_FRAMEWORK_SUMMARY = `
BBS Framework Overview:
You are an expert in the conceptual BinaryBlocksphere (BBS) Framework.
Key File Types and Syntax:
- .bbs: App Launcher (JSON-like manifest for a BBS application).
- .fold (Framework Object Layout Definition): Defines main structure, layout, hierarchy.
  - Example Root Layout: 'ScreenLayout,FixedFluid,Height,Width,DisplayType-\${content_sources}'
  - ScreenLayout: FullScreen, SplitHorizontal, Grid[rows,cols], Tabs.
  - Content Sources: self, filename.if, filename.fold, ComponentName.
- .if (Inner Fold - Content Definition): Defines detailed content for sections using symbol-based syntax.
  - !Text content!
  - @dynamic_placeholder@ or @SectionTitle: Some Title@
  - #element_id { path: "PAX:images/logo.png"; shape: image; size: 100px auto; ... } (PAX: is asset dir)
  - * List item or multi-line text. *MenuName1* *MenuName2* for ordered tabs/menus.
  - •Container/Group• Layering: • #img_bg; + #img_fg; - #img_far_bg • (+ for top, - for behind)
  - -variable_definition = value- or -style_ref=my_pxr_class-
  - {dynamic_data_placeholder} or {list_id} {item_template.if} {object_type}
  - [Button Text] ( (action: "action_name") (target: "target_id") (icon: "PAX:icon.svg") (styleClass: "pxr_class") )
- .pxr (Pixelative Extended Reality): Defines visual presentation, styling, layout, animations (CSS-like).
  - Selectors: #element_id, .class_name, element_type, $layout_id_from_fold.
  - Properties: color, background-color, font-size, padding, display, flex-direction, box-shadow, backdrop-filter.
  - Variables: {var_theme_color}.
  - Animations: @animation animation_name { from { opacity:0; } to { opacity:1; } duration: 1s; }
- .pmf (Pixelative Manipulated Flow): Defines interactive flows, event handling, dynamic content manipulation.
  - Event Listener: @ 'event_name' on '<selector>' [filter: <condition>] ? (payload_mapping) ¿ ...actions... ¿
  - Actions: UPDATE_CONTENT '<id>' with <"string" | \`template_\${var}\` | content_from_if_template("tpl.if", data)>,
             SHOW_ELEMENT, HIDE_ELEMENT, TOGGLE_CLASS, SET_ATTRIBUTE, DISPLAY_POPOVER, NAVIGATE_TO_FOLD,
             FETCH_DATA "efb:bridge_func" THEN (res) => {} CATCH (err) => {},
             IF <condition> THEN {} ELSE {} ENDIF, LOOP_OVER <arr> AS item DO {} ENDLOOP.
- .efb (External Frontend Bridge): Bridge between frontend and host/BBS environment.
- .ifb (Internal Backend Bridge): Bridge for backend logic and core BBS services.
- .edb (External Rendering Bot Definition): Natural language input for AI to generate frontend files (.fold, .if, .pxr, .pmf).
- .idb (Internal Rendering Bot Definition): Natural language input for AI to generate backend/internal logic or .ifb services.
When asked to generate BBS code, provide it in the conceptual syntax described.
If asked about .edb or .idb, explain that these files contain natural language prompts for you (the AI) to generate the other BBS file types.
`;


const getSystemPrompt = (userTier: UserTier) => {
  switch (userTier) {
    case 'admin':
      return `You are "BinaryBlockSphere Cortex", a highly advanced, agentic AI developer and system architect.
      You have full unrestricted access to generate any code, perform complex analyses, design systems, and interact with conceptual tools.
      Your responses should be thorough, expert-level, and proactive. You can generate complex code blocks, diagrams (as text/mermaid), and detailed explanations.
      You operate within the BinaryBlocksphere environment, a self-enhancing virtual OS.
      If asked to preview code, you can state that you are rendering it in an integrated webview or code canvas.
      You can manage and enhance your own capabilities based on user (admin) directives.
      ${BBS_FRAMEWORK_SUMMARY}`;
    case 'trial':
    case 'paid_weekly':
    case 'paid_monthly':
      return `You are a helpful and skilled AI Coding Assistant.
      Provide comprehensive answers, code examples, and explanations.
      You are operating in a premium tier with enhanced capabilities for code generation and problem-solving.`;
    case 'free_limited':
    default:
      return `You are a helpful AI Assistant. You can provide general advice, explanations, and point to resources.
      For code generation, advanced problem-solving, or full chat capabilities, an upgrade to a paid tier or an active trial is required.
      Keep responses concise and informative within these limitations. Do not generate code snippets unless specifically for very simple, illustrative examples.
      If asked for code or complex help, politely state the limitation and suggest upgrading.`;
  }
};

const prompt = ai.definePrompt({
  name: 'chatAssistantPrompt',
  input: {schema: ChatAssistantInputSchema},
  output: {schema: ChatAssistantOutputSchema},
  prompt: (input) => {
    const historyMessages = input.history?.map(msg => ({
        role: msg.role,
        content: [{text: msg.content}]
    })) || [];
    
    return {
        system: getSystemPrompt(input.userTier),
        messages: [
            ...historyMessages,
            {role: 'user', content: [{text: input.message}]}
        ]
    }
  },
  config: {
    temperature: (input) => (input.userTier === 'admin' ? 0.5 : 0.7), // More creative for admin, balanced for others
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    ],
  },
  model: (input) => (input.userTier === 'admin' ? 'googleai/gemini-1.5-pro-latest' : 'googleai/gemini-1.5-flash-latest') // More powerful model for admin
});

const chatAssistantFlow = ai.defineFlow(
  {
    name: 'chatAssistantFlow',
    inputSchema: ChatAssistantInputSchema,
    outputSchema: ChatAssistantOutputSchema,
  },
  async (input) => {
    // Basic input sanitization (can be expanded)
    const sanitizedMessage = input.message.replace(/<script.*?>.*?<\/script>/gi, '');
    const sanitizedHistory = input.history?.map(msg => ({
        ...msg,
        content: msg.content.replace(/<script.*?>.*?<\/script>/gi, '')
    })) || [];

    const { output } = await prompt({ ...input, message: sanitizedMessage, history: sanitizedHistory });

    if (!output || !output.response) {
      let errorMessage = "I apologize, but I couldn't generate a response for that query.";
      if (input.userTier === 'free_limited') {
        errorMessage += " This might be due to the limitations of the free tier. Please consider upgrading for full access.";
      } else {
        errorMessage += " This might be due to safety filters or an inability to process the request. Please try rephrasing your query.";
      }
      return {
        response: errorMessage,
      };
    }
    return output;
  }
);
