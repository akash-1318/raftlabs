import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MenuPage } from "../MenuPage";

describe("MenuPage", () => {
  it("renders menu heading", async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        json: async () => [
          { id: "1", name: "Pizza", price: 200 },
          { id: "2", name: "Burger", price: 150 },
        ],
      })),
    );

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <MenuPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/Menu/i)).toBeInTheDocument();
  });
});
