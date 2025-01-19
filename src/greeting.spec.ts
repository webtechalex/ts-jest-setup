import { greeting } from "./greeting";

describe("greeting", () => {
  it("returns a greeting", () => {
    expect(greeting()).toBe("hello world imported")
  })
})