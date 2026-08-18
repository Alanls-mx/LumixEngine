import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { randomUUID } from 'node:crypto';

export type StoredLead = {
  id: string;
  email: string;
  phone: string;
  source: string;
  createdAt: string;
  userAgent: string | null;
  ip: string | undefined;
};

type LeadInput = {
  email: string;
  phone: string;
  source: string;
  userAgent: string | null;
  ip: string | undefined;
};

const leadsFilePath = resolve(process.cwd(), 'server', 'data', 'leads.json');

async function readLeads(): Promise<StoredLead[]> {
  try {
    const fileContent = await readFile(leadsFilePath, 'utf8');
    const parsedContent: unknown = JSON.parse(fileContent);

    return Array.isArray(parsedContent) ? (parsedContent as StoredLead[]) : [];
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      return [];
    }

    throw error;
  }
}

export async function saveLead(input: LeadInput): Promise<StoredLead> {
  const lead: StoredLead = {
    id: randomUUID(),
    email: input.email,
    phone: input.phone,
    source: input.source,
    createdAt: new Date().toISOString(),
    userAgent: input.userAgent,
    ip: input.ip,
  };

  const currentLeads = await readLeads();
  const nextLeads = [lead, ...currentLeads].slice(0, 1000);

  await mkdir(dirname(leadsFilePath), { recursive: true });
  await writeFile(leadsFilePath, `${JSON.stringify(nextLeads, null, 2)}\n`, 'utf8');

  return lead;
}
