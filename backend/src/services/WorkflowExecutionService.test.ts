import { describe, expect, it, vi } from 'vitest';

async function createService() {
  vi.resetModules();
  process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
  process.env.JWT_SECRET = '12345678901234567890123456789012';
  const { WorkflowExecutionService } = await import('./WorkflowExecutionService');
  return new WorkflowExecutionService() as any;
}

describe('WorkflowExecutionService', () => {
  it('normalizes builder node aliases to runtime node types', async () => {
    const service = await createService();

    const normalized = service.normalizeTemplate({
      id: 'template-1',
      name: 'Alias test',
      nodes: [
        { id: 'n1', type: 'ai-platform', position: { x: 0, y: 0 }, data: {} },
        { id: 'n2', type: 'condition', position: { x: 0, y: 0 }, data: {} },
        { id: 'n3', type: 'mcp-web-search', position: { x: 0, y: 0 }, data: {} },
      ],
      edges: [],
    });

    expect(normalized.nodes.map((n: any) => n.type)).toEqual(['aiNode', 'conditionNode', 'mcpNode']);
  }, 15000);

  it('retries provider call and succeeds before max attempts', async () => {
    const service = await createService();
    let attempts = 0;

    const fn = vi.fn(async () => {
      attempts += 1;
      if (attempts < 3) {
        throw new Error('temporary failure');
      }
      return 'ok';
    });

    const result = await service.withRetries(fn, 'test-provider');

    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(3);
  }, 15000);

  it('throws when provider call exceeds max retries', async () => {
    const service = await createService();

    const fn = vi.fn(async () => {
      throw new Error('permanent failure');
    });

    await expect(service.withRetries(fn, 'test-provider')).rejects.toThrow('Failed after retries');
    expect(fn).toHaveBeenCalledTimes(3);
  }, 15000);
});
