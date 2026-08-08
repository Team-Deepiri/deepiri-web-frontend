import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom/vitest";
import App from "./App";

describe("App", () => {
  it("renders without crashing and routes an unauthenticated user to Login", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>
    );

    // AuthGuard should redirect "/" -> "/login" for a signed-out user,
    // and the lazy-loaded Login page should resolve past the Suspense fallback.
    expect(await screen.findByText(/sign in to the deepiri hub/i)).toBeInTheDocument();
  });
});