import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, test, expect, beforeEach, vi } from "vitest";

import { AppProvider, useAppContext } from "../context/AppContext";

// A tiny consumer component so we can exercise the context's functions
// and read back its state through the rendered DOM.
function TestConsumer() {
  const { authStatus, user, login, signup, logout } = useAppContext();

  return (
    <div>
      <span data-testid="status">{authStatus}</span>
      <span data-testid="username">{user?.fullName ?? ""}</span>
      <button onClick={() => login("demo@test.com", "password1")}>do-login</button>
      <button onClick={() => signup("demo", "demo@test.com", "password1")}>do-signup</button>
      <button onClick={logout}>do-logout</button>
    </div>
  );
}

function renderWithProvider() {
  return render(
    <AppProvider>
      <TestConsumer />
    </AppProvider>
  );
}

const fullProfileResponse = {
  UserID: 1,
  Username: "demo",
  Email: "demo@test.com",
  Age: 27,
  WeightKg: 70,
  HeightCm: 175,
  Goal: "maintain",
  DailyCalorieIntake: 2000,
  DailyCalorieBurn: 600,
  Onboarded: 1,
  ActivityCount: 0
};

describe("AppContext", () => {
  beforeEach(() => {
    localStorage.clear();
    global.fetch = vi.fn();
  });

  test("starts in guest status when there is no saved session", async () => {
    renderWithProvider();

    await waitFor(() =>
      expect(screen.getByTestId("status").textContent).toBe("guest")
    );
  });

  test("resumes a saved session and lands on ready when already onboarded", async () => {
    localStorage.setItem("fithub_userId", "1");
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => fullProfileResponse
    });

    renderWithProvider();

    await waitFor(() =>
      expect(screen.getByTestId("status").textContent).toBe("ready")
    );
    expect(screen.getByTestId("username").textContent).toBe("demo");
  });

  test("clears a stale/invalid saved session and falls back to guest", async () => {
    localStorage.setItem("fithub_userId", "999");
    fetch.mockResolvedValueOnce({ ok: false });

    renderWithProvider();

    await waitFor(() =>
      expect(screen.getByTestId("status").textContent).toBe("guest")
    );
    expect(localStorage.getItem("fithub_userId")).toBeNull();
  });

  test("login stores the user id and fetches the full profile", async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          userId: 1,
          username: "demo",
          email: "demo@test.com",
          onboarded: true
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => fullProfileResponse
      });

    renderWithProvider();
    await waitFor(() =>
      expect(screen.getByTestId("status").textContent).toBe("guest")
    );

    fireEvent.click(screen.getByText("do-login"));

    await waitFor(() =>
      expect(screen.getByTestId("status").textContent).toBe("ready")
    );
    expect(localStorage.getItem("fithub_userId")).toBe("1");
    expect(screen.getByTestId("username").textContent).toBe("demo");
  });

  test("signup moves straight to the onboarding status", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        userId: 2,
        username: "newbie",
        email: "newbie@test.com",
        onboarded: false
      })
    });

    renderWithProvider();
    await waitFor(() =>
      expect(screen.getByTestId("status").textContent).toBe("guest")
    );

    fireEvent.click(screen.getByText("do-signup"));

    await waitFor(() =>
      expect(screen.getByTestId("status").textContent).toBe("onboarding")
    );
    expect(localStorage.getItem("fithub_userId")).toBe("2");
  });

  test("logout clears the session and returns to guest", async () => {
    localStorage.setItem("fithub_userId", "1");
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => fullProfileResponse
    });

    renderWithProvider();
    await waitFor(() =>
      expect(screen.getByTestId("status").textContent).toBe("ready")
    );

    fireEvent.click(screen.getByText("do-logout"));

    expect(screen.getByTestId("status").textContent).toBe("guest");
    expect(localStorage.getItem("fithub_userId")).toBeNull();
  });
});
