import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, test, expect, beforeEach, vi } from "vitest";

import Signup from "../Signup";
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

function renderSignup() {
  return render(
    <MemoryRouter>
      <Signup />
    </MemoryRouter>
  );
}

describe("Signup", () => {
  let signupMock;

  beforeEach(() => {
    signupMock = vi.fn();
    AppContextModule.useAppContext.mockReturnValue({ signup: signupMock });
    mockNavigate.mockClear();
  });

  test("shows an error when the form is submitted empty", async () => {
    renderSignup();

    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

    expect(
      await screen.findByText(/please fill in all fields/i)
    ).toBeInTheDocument();
    expect(signupMock).not.toHaveBeenCalled();
  });

  test("shows an error for passwords under 6 characters", async () => {
    renderSignup();

    await userEvent.type(screen.getByPlaceholderText(/your username/i), "demo");
    await userEvent.type(screen.getByPlaceholderText(/you@example.com/i), "demo@test.com");
    await userEvent.type(screen.getByPlaceholderText(/at least 6 characters/i), "123");

    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

    expect(
      await screen.findByText(/password must be at least 6 characters/i)
    ).toBeInTheDocument();
    expect(signupMock).not.toHaveBeenCalled();
  });

  test("calls signup with form values and redirects to onboarding on success", async () => {
    signupMock.mockResolvedValue({ success: true });
    renderSignup();

    await userEvent.type(screen.getByPlaceholderText(/your username/i), "demo");
    await userEvent.type(screen.getByPlaceholderText(/you@example.com/i), "demo@test.com");
    await userEvent.type(screen.getByPlaceholderText(/at least 6 characters/i), "password1");

    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() =>
      expect(signupMock).toHaveBeenCalledWith("demo", "demo@test.com", "password1")
    );
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/onboarding"));
  });

  test("shows the server's error message when signup fails", async () => {
    signupMock.mockResolvedValue({
      success: false,
      message: "An account with that email or username already exists"
    });
    renderSignup();

    await userEvent.type(screen.getByPlaceholderText(/your username/i), "demo");
    await userEvent.type(screen.getByPlaceholderText(/you@example.com/i), "demo@test.com");
    await userEvent.type(screen.getByPlaceholderText(/at least 6 characters/i), "password1");

    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

    expect(
      await screen.findByText(/already exists/i)
    ).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test("toggles the password field between hidden and visible", async () => {
    renderSignup();

    const passwordInput = screen.getByPlaceholderText(/at least 6 characters/i);
    expect(passwordInput).toHaveAttribute("type", "password");

    fireEvent.click(screen.getByLabelText(/show password/i));
    expect(passwordInput).toHaveAttribute("type", "text");
  });
});
