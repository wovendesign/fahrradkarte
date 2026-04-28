import { persisted } from "svelte-persisted-store";

export const allComments = persisted<Record<string, string>>("fahrradkarte-comments", {});