import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
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

    expect(screen.getAllByText("Remove duplicates from an array").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Read a JSON file").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Center an element").length).toBeGreaterThan(0);
  });

  it("filters snippets by search text", () => {
    render(<App />);

    fireEvent.change(screen.getByPlaceholderText("Search snippets, tags, or code..."), {
      target: { value: "Read a JSON file" },
    });

    expect(screen.getAllByText("Read a JSON file").length).toBeGreaterThan(0);
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

    expect(screen.getAllByText("Format a date").length).toBeGreaterThan(0);
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

    fireEvent.click(screen.getAllByText("Remove duplicates from an array")[0]);
    fireEvent.click(screen.getByTitle("Edit snippet"));
    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "Remove duplicate values" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save snippet" }));

    expect(screen.getAllByText("Remove duplicate values").length).toBeGreaterThan(0);
    expect(screen.queryByText("Remove duplicates from an array")).not.toBeInTheDocument();
  });

  it("deletes a snippet after confirmation", () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    render(<App />);

    fireEvent.click(screen.getAllByText("Remove duplicates from an array")[0]);
    fireEvent.click(screen.getByTitle("Delete snippet"));

    expect(screen.queryByText("Remove duplicates from an array")).not.toBeInTheDocument();
    expect(window.confirm).toHaveBeenCalledOnce();
  });

  it("imports a valid JSON backup and replaces the library", async () => {
    render(<App />);
    const backup = [{
      id: "imported-1",
      title: "Imported helper",
      language: "TypeScript",
      description: "Imported from a backup.",
      code: "const answer: number = 42;",
      tags: ["backup", "test"],
      updatedAt: "2025-01-01T00:00:00.000Z",
    }];
    const file = new File([JSON.stringify(backup)], "backup.json", { type: "application/json" });
    const input = document.querySelector('input[type="file"]');

    expect(input).not.toBeNull();
    fireEvent.change(input!, { target: { files: [file] } });

    expect((await screen.findAllByText("Imported helper")).length).toBeGreaterThan(0);
    expect(screen.queryByText("Remove duplicates from an array")).not.toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem("codevault.snippets.v1") ?? "[]")).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: "imported-1", title: "Imported helper" })]),
    );
  });

  it("rejects an invalid JSON backup without replacing saved snippets", async () => {
    const alert = vi.spyOn(window, "alert").mockImplementation(() => {});
    render(<App />);
    const file = new File(['{"not":"an array"}'], "invalid.json", { type: "application/json" });
    const input = document.querySelector('input[type="file"]');

    fireEvent.change(input!, { target: { files: [file] } });

    await waitFor(() => expect(alert).toHaveBeenCalledWith(
      "That file doesn't look like a valid CodeVault JSON backup.",
    ));
    expect(screen.getAllByText("Remove duplicates from an array").length).toBeGreaterThan(0);
  });

  it("selects and deletes multiple visible snippets", () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    render(<App />);

    fireEvent.click(screen.getByLabelText("Select all"));
    expect(screen.getByText("3 selected")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Delete selected" }));

    expect(screen.queryByText("Remove duplicates from an array")).not.toBeInTheDocument();
    expect(screen.queryByText("Read a JSON file")).not.toBeInTheDocument();
    expect(screen.queryByText("Center an element")).not.toBeInTheDocument();
    expect(window.confirm).toHaveBeenCalledWith("Delete 3 selected snippets? This cannot be undone.");
  });

  it("exports a JSON backup", () => {
    const createObjectURL = vi.fn(() => "blob:codevault-test");
    const revokeObjectURL = vi.fn();
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    vi.stubGlobal("URL", {
      ...URL,
      createObjectURL,
      revokeObjectURL,
    });
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: /Export backup/ }));

    expect(createObjectURL).toHaveBeenCalledOnce();
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:codevault-test");
    expect(click).toHaveBeenCalledOnce();
  });
});
