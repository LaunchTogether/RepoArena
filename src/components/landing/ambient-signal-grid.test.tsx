import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AmbientSignalGrid } from "./ambient-signal-grid";

describe("AmbientSignalGrid", () => {
  it("is decorative and excluded from assistive technology", () => {
    render(<AmbientSignalGrid />);

    expect(screen.getByTestId("ambient-signal-grid")).toHaveAttribute("aria-hidden", "true");
  });
});
