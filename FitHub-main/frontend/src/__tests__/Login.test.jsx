import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, test, expect, beforeEach, vi } from "vitest";

import Login from "../Login";
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

function renderLogin() {
  return render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  );
}

describe("Login", () => {
  let loginMock;

  beforeEach(() => {
    loginMock = vi.fn();
    AppContextModule.useAppContext.mockReturnValue({ login: loginMock });
    mockNavigate.mockClear();
  });

  test("shows an error when submitted empty", async () => {
    renderLogin();

    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    expect(
      await screen.findByText(/enter your email and password/i)
    ).toBeInTheDocument();
    expect(loginMock).not.toHaveBeenCalled();
  });

  test("calls login and redirects to the dashboard on success", async () => {
    loginMock.mockResolvedValue({ success: true });
    renderLogin();

    await userEvent.type(screen.getByPlaceholderText(/you@example.com/i), "demo@test.com");
    await userEvent.type(screen.getByPlaceholderText(/your password/i), "password1");

    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() =>
      expect(loginMock).toHaveBeenCalledWith("demo@test.com", "password1")
    );
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/"));
  });

  test("shows an error message and does not navigate on invalid credentials", async () => {
    loginMock.mockResolvedValue({
      success: false,
      message: "Invalid email or password"
    });
    renderLogin();

    await userEvent.type(screen.getByPlaceholderText(/you@example.com/i), "demo@test.com");
    await userEvent.type(screen.getByPlaceholderText(/your password/i), "wrong-password");

    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    expect(
      await screen.findByText(/invalid email or password/i)
    ).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
