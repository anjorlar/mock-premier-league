process.env.NODE_ENV = 'test'
import expect from "expect";

describe("Sample test", () => {
    it('Equals to 2', () => {
        expect(1 + 1).toBe(2)
    })
})