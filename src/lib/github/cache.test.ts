import { describe, expect, it, vi } from "vitest";
import { getCachedValue } from "./cache";

describe("GitHub evidence cache", () => {
  it("returns a cached value while its TTL is valid", async () => {
    const loader = vi.fn().mockResolvedValue({ value: 1 });

    await expect(getCachedValue("cached-success", loader)).resolves.toEqual({ value: 1 });
    await expect(getCachedValue("cached-success", loader)).resolves.toEqual({ value: 1 });

    expect(loader).toHaveBeenCalledTimes(1);
  });

  it("does not cache a rejected request", async () => {
    const loader = vi.fn().mockRejectedValue(new Error("GitHub unavailable"));

    await expect(getCachedValue("rejected-request", loader)).rejects.toThrow("GitHub unavailable");
    await expect(getCachedValue("rejected-request", loader)).rejects.toThrow("GitHub unavailable");

    expect(loader).toHaveBeenCalledTimes(2);
  });
});
