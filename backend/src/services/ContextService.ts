import OpenAI from 'openai';
import { db } from '../db';
import { contextCompressions, messages, conversations } from '../db/schema-simple';
import { eq, desc } from 'drizzle-orm';

export class ContextService {
    private openai: OpenAI;

    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
    }

    async compressConversation(conversationId: string, strategy: 'summarize' | 'entities' = 'summarize') {
        // 1. Fetch messages
        const conversationMessages = await db.query.messages.findMany({
            where: eq(messages.conversation_id, conversationId),
            orderBy: [desc(messages.created_at)],
            limit: 50, // Limit context window
        });

        if (conversationMessages.length === 0) {
            throw new Error('No messages found to compress');
        }

        // Reverse to get chronological order
        const chronMessages = [...conversationMessages].reverse();
        const textContent = chronMessages.map(m => `${m.sender}: ${m.content}`).join('\n');

        // 2. Compress using OpenAI
        let summary = '';
        let compressedContent = '';

        if (strategy === 'summarize') {
            const response = await this.openai.chat.completions.create({
                model: 'gpt-4',
                messages: [
                    { role: 'system', content: 'Summarize the following conversation, capturing key decisions, code snippets, and user intent. Keep it concise.' },
                    { role: 'user', content: textContent }
                ],
            });
            summary = response.choices[0].message.content || '';
            compressedContent = summary; // For now, compressed content is the summary
        } else {
            // Entity extraction strategy
            const response = await this.openai.chat.completions.create({
                model: 'gpt-4',
                messages: [
                    { role: 'system', content: 'Extract key entities, technical terms, and action items from this conversation. Return as a JSON list.' },
                    { role: 'user', content: textContent }
                ],
            });
            summary = 'Entity Extraction';
            compressedContent = response.choices[0].message.content || '';
        }

        // 3. Store in DB
        const [record] = await db.insert(contextCompressions).values({
            conversation_id: conversationId,
            summary,
            compressed_content: compressedContent,
            strategy,
            token_count: String(textContent.length / 4), // Rough estimate
        }).returning();

        return record;
    }

    async extractEntities(content: string): Promise<string[]> {
        const response = await this.openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'system', content: 'Extract key technical terms and entities from the text. Return as a comma-separated list.' },
                { role: 'user', content }
            ],
        });

        const text = response.choices[0].message.content || '';
        return text.split(',').map(s => s.trim());
    }

    async generateTransitionPrompt(fromPlatform: string, toPlatform: string): Promise<string> {
        const response = await this.openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'system', content: 'Generate a transition prompt for an AI to continue a conversation from one platform to another.' },
                { role: 'user', content: `Generate a prompt to switch context from ${fromPlatform} to ${toPlatform}. The AI should know it's continuing a previous task.` }
            ],
        });

        return response.choices[0].message.content || '';
    }
}

export const contextService = new ContextService();
