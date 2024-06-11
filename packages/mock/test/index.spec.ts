import { describe, expect, it } from "vitest";
import { Mock } from "../src";

describe("Mock", () => {
  const mock = new Mock(`
    interface People {
      name: string;
      age: number;
    }

    interface User {
      name: string;
      age: number;
      address: string;
      spouse: User;
    }

    interface ResponseUser {
      code: number;
      message: string;
      data: User;
    }

    interface ResponseUserList {
      code: number;
      message: string;
      data: User[];
    }
  `);

  it("mock basic type", () => {
    const result = mock.generate("People", {
      name: {
        type: "string",
        min: 1,
        max: 2,
        language: "en",
      },
    });

    expect(result).toHaveProperty("name");
    expect(result).toHaveProperty("age");

    expect(typeof result.name).toBe("string");
    expect(typeof result.age).toBe("number");
  });

  it("mock reference type", () => {
    const result = mock.generate("User");

    expect(result).toHaveProperty("name");
    expect(result).toHaveProperty("age");
    expect(result).toHaveProperty("address");
    expect(result).toHaveProperty("spouse");

    expect(typeof result.name).toBe("string");
    expect(typeof result.age).toBe("number");
    expect(typeof result.address).toBe("string");
    expect(typeof result.spouse).toBe("object");

    expect(typeof result.spouse.spouse.name).toBe("string");
    expect(typeof result.spouse.spouse.age).toBe("number");
    expect(typeof result.spouse.spouse.address).toBe("string");
  });

  it("mock list", () => {
    const result = mock.generate("ResponseUserList");

    expect(result).toHaveProperty("code");
    expect(result).toHaveProperty("message");
    expect(result).toHaveProperty("data");

    expect(typeof result.code).toBe("number");
    expect(typeof result.message).toBe("string");
    expect(Array.isArray(result.data)).toBe(true);
  });
});
