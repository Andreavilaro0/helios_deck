import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// @testing-library/react does not auto-cleanup when globals: false.
// Explicitly register cleanup after every test.
afterEach(cleanup);
