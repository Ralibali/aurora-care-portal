import { describe, expect, it } from "vitest";
import { PORTFOLIO_PROJECTS } from "../portfolio-registry";

describe("portfolio registry", () => {
  it("contains the complete inventoried workspace without duplicate ids", () => {
    expect(PORTFOLIO_PROJECTS).toHaveLength(25);
    expect(new Set(PORTFOLIO_PROJECTS.map((project) => project.id)).size).toBe(25);
  });

  it("keeps private and support projects out of the live stage", () => {
    const internalLive = PORTFOLIO_PROJECTS.filter(
      (project) => project.kind === "internal" && project.stage === "live",
    );
    expect(internalLive).toEqual([]);
  });
});
