import { afterEach, describe, expect, it, vi } from "vitest";

import { envFlag, envOr, envValue } from "../env";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("env helper: compose passes an unset variable as the empty string", () => {
  it("treats empty and whitespace as unset", () => {
    vi.stubEnv("HL_TEST_VAR", "");
    expect(envValue("HL_TEST_VAR")).toBeUndefined();
    expect(envOr("HL_TEST_VAR", "fallback")).toBe("fallback");
    vi.stubEnv("HL_TEST_VAR", "   ");
    expect(envOr("HL_TEST_VAR", "fallback")).toBe("fallback");
  });

  it("returns a set value trimmed", () => {
    vi.stubEnv("HL_TEST_VAR", "  https://example.test  ");
    expect(envValue("HL_TEST_VAR")).toBe("https://example.test");
    expect(envOr("HL_TEST_VAR", "fallback")).toBe("https://example.test");
  });

  it("falls back when the variable is absent", () => {
    delete process.env.HL_TEST_ABSENT;
    expect(envOr("HL_TEST_ABSENT", "fallback")).toBe("fallback");
  });

  it("reads switches as 1, true, yes or on in any case", () => {
    for (const on of ["1", "true", "TRUE", "yes", "Yes", "on", " true "]) {
      vi.stubEnv("HL_TEST_FLAG", on);
      expect(envFlag("HL_TEST_FLAG"), on).toBe(true);
    }
    for (const off of ["", "0", "false", "no", "off", "2", "enabled"]) {
      vi.stubEnv("HL_TEST_FLAG", off);
      expect(envFlag("HL_TEST_FLAG"), off).toBe(false);
    }
  });
});

describe("getPgBossPollingIntervalSeconds", () => {
  it("is undefined when unset or blank", async () => {
    const { getPgBossPollingIntervalSeconds } = await import("../env");
    delete process.env.PGBOSS_POLLING_INTERVAL_SECONDS;
    expect(getPgBossPollingIntervalSeconds()).toBeUndefined();
    vi.stubEnv("PGBOSS_POLLING_INTERVAL_SECONDS", "");
    expect(getPgBossPollingIntervalSeconds()).toBeUndefined();
  });

  it("accepts a valid value, including fractions", async () => {
    const { getPgBossPollingIntervalSeconds } = await import("../env");
    vi.stubEnv("PGBOSS_POLLING_INTERVAL_SECONDS", "10");
    expect(getPgBossPollingIntervalSeconds()).toBe(10);
    vi.stubEnv("PGBOSS_POLLING_INTERVAL_SECONDS", "0.5");
    expect(getPgBossPollingIntervalSeconds()).toBe(0.5);
  });

  it("is undefined for junk or below the pg-boss minimum", async () => {
    const { getPgBossPollingIntervalSeconds } = await import("../env");
    for (const bad of ["abc", "0", "0.1", "-5", "NaN"]) {
      vi.stubEnv("PGBOSS_POLLING_INTERVAL_SECONDS", bad);
      expect(getPgBossPollingIntervalSeconds()).toBeUndefined();
    }
  });
});
