import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, test, expect, beforeEach, vi } from "vitest";

import Onboarding from "../Onboarding";
import * as AppContextModule from "../context/AppContext";

vi.mock("../context/AppContext", () => ({
  useAppContext: vi.fn()
}));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

function renderOnboarding() {
  return render(
    <MemoryRouter>
      <Onboarding />
    </MemoryRouter>
  );
}

describe("Onboarding", () => {
  let completeOnboardingMock;

  beforeEach(() => {
    completeOnboardingMock = vi.fn();
    AppContextModule.useAppContext.mockReturnValue({
      completeOnboarding: completeOnboardingMock
    });
    mockNavigate.mockClear();
  });

  test("blocks moving past step 1 without an age", () => {
    renderOnboarding();

    fireEvent.click(screen.getByRole("button", { name: /continue/i }));

    expect(screen.getByText(/please enter your age/i)).toBeInTheDocument();
    expect(screen.getByText(/step 1 of 3/i)).toBeInTheDocument();
  });

  test("blocks moving past step 2 without a weight", async () => {
    renderOnboarding();

    await userEvent.type(screen.getByPlaceholderText(/e.g. 28/i), "27");
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));

    expect(await screen.findByText(/step 2 of 3/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /continue/i }));

    expect(screen.getByText(/please enter your weight/i)).toBeInTheDocument();
    expect(screen.getByText(/step 2 of 3/i)).toBeInTheDocument();
  });

  test("the back button returns to the previous step", async () => {
    renderOnboarding();

    await userEvent.type(screen.getByPlaceholderText(/e.g. 28/i), "27");
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));
    expect(await screen.findByText(/step 2 of 3/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /back/i }));
    expect(await screen.findByText(/step 1 of 3/i)).toBeInTheDocument();
  });

  test("walks through all 3 steps and submits the collected data", async () => {
    completeOnboardingMock.mockResolvedValue({ success: true });
    renderOnboarding();

    // Step 1 - age
    await userEvent.type(screen.getByPlaceholderText(/e.g. 28/i), "27");
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));

    // Step 2 - weight + optional height
    expect(await screen.findByText(/step 2 of 3/i)).toBeInTheDocument();
    await userEvent.type(screen.getByPlaceholderText(/e.g. 70/i), "70");
    await userEvent.type(screen.getByPlaceholderText(/e.g. 175/i), "178");
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));

    // Step 3 - goal + daily targets
    expect(await screen.findByText(/step 3 of 3/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText(/lose weight/i));
    fireEvent.click(screen.getByRole("button", { name: /get started/i }));

    await waitFor(() =>
      expect(completeOnboardingMock).toHaveBeenCalledWith({
        age: 27,
        weight: 70,
        height: 178,
        goal: "lose",
        dailyCalorieIntake: 2000,
        dailyCalorieBurn: 600
      })
    );
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/"));
  });

  test("shows an error and stays on the page if saving fails", async () => {
    completeOnboardingMock.mockResolvedValue({
      success: false,
      message: "Failed to save your info"
    });
    renderOnboarding();

    await userEvent.type(screen.getByPlaceholderText(/e.g. 28/i), "27");
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));
    await userEvent.type(
      await screen.findByPlaceholderText(/e.g. 70/i),
      "70"
    );
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));
    await screen.findByText(/step 3 of 3/i);

    fireEvent.click(screen.getByRole("button", { name: /get started/i }));

    expect(
      await screen.findByText(/failed to save your info/i)
    ).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
