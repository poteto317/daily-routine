import { type WorkTemplate } from "@/types/routine";
import { generateId } from "@/lib/storage/core";
import { getWorkTemplates, saveWorkTemplates } from "./storageData";

export const addWorkTemplate = (name: string): WorkTemplate => {
  const templates = getWorkTemplates();
  const now = new Date().toISOString();
  const newTemplate: WorkTemplate = {
    id: generateId("work-template"),
    name,
    createdAt: now,
    updatedAt: now,
  };
  templates.push(newTemplate);
  saveWorkTemplates(templates);
  return newTemplate;
};

export const updateWorkTemplate = (templateId: string, name: string): void => {
  const templates = getWorkTemplates();
  const index = templates.findIndex((template) => template.id === templateId);
  if (index === -1) return;
  templates[index].name = name;
  templates[index].updatedAt = new Date().toISOString();
  saveWorkTemplates(templates);
};

export const updateWorkTemplateLastUsed = (templateId: string): void => {
  const templates = getWorkTemplates();
  const index = templates.findIndex((template) => template.id === templateId);
  if (index === -1) return;
  templates[index].lastUsedAt = new Date().toISOString();
  saveWorkTemplates(templates);
};

export const deleteWorkTemplate = (templateId: string): void => {
  const templates = getWorkTemplates();
  saveWorkTemplates(templates.filter((template) => template.id !== templateId));
};

export const getOrCreateWorkTemplate = (name: string): WorkTemplate => {
  const templates = getWorkTemplates();
  const existing = templates.find((template) => template.name === name);
  return existing || addWorkTemplate(name);
};
