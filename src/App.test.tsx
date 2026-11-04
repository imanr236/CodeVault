import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";

describe("CodeVault", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("shows the starter snippets on first launch", () => {
    render(<App />);

    expect(screen.getByText("Remove duplicates from an array")).toBeInTheDocument();
    expect(screen.getByText("Read a JSON file")).toBeInTheDocument();
    expect(screen.getByText("Center an element")).toBeInTheDocument();
  });

  it("filters snippets by search text", () => {
    render(<App />);

    fireEvent.change(screen.getByPlaceholderText("Search snippets, tags, or code..."), {
      target: { value: "Read a JSON file" },
    });

    expect(screen.getByText("Read a JSON file")).toBeInTheDocument();
    expect(screen.queryByText("Remove duplicates from an array")).not.toBeInTheDocument();
  });

  it("creates a snippet and persists it in local storage", () => {
    render(<App />);

    fireEvent.click(screen.getAllByRole("button", { name: /New snippet/ })[0]);
    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "Format a date" },
    });
    fireEvent.change(screen.getByPlaceholderText("What does this snippet do?"), {
      target: { value: "A date formatting helper." },
    });
    fireEvent.change(screen.getByPlaceholderText("Paste your code here..."), {
      target: { value: "const today = new Date();" },
    });
    fireEvent.change(screen.getByPlaceholderText("utility, dates"), {
      target: { value: "dates, utility" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save snippet" }));

    expect(screen.getByText("Format a date")).toBeInTheDocument();
    const saved = JSON.parse(localStorage.getItem("codevault.snippets.v1") ?? "[]");
    expect(saved).toEqual(expect.arrayContaining([
      expect.objectContaining({
        title: "Format a date",
        code: "const today = new Date();",
        tags: ["dates", "utility"],
      }),
    ]));
  });

  it("edits an existing snippet", () => {
    render(<App />);

    fireEvent.click(screen.getByText("Remove duplicates from an array"));
    fireEvent.click(screen.getByRole("button", { name: "Edit snippet" }));
    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "Remove duplicate values" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save snippet" }));

    expect(screen.getByText("Remove duplicate values")).toBeInTheDocument();
    expect(screen.queryByText("Remove duplicates from an array")).not.toBeInTheDocument();
  });

  it("deletes a snippet after confirmation", () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    render(<App />);

    fireEvent.click(screen.getByText("Remove duplicates from an array"));
    fireEvent.click(screen.getByRole("button", { name: "Delete snippet" }));

    expect(screen.queryByText("Remove duplicates from an array")).not.toBeInTheDocument();
    expect(window.confirm).toHaveBeenCalledOnce();
  });
});
