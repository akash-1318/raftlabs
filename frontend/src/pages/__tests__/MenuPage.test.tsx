import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect } from "vitest";
import { MenuPage } from "../MenuPage";

describe("MenuPage", () => {
  it("renders menu heading", async () => {
    render(
      <MemoryRouter>
        <MenuPage />
      </MemoryRouter>,
    );

    expect(await screen.findByText(/Menu/i)).toBeInTheDocument();
  });
});
