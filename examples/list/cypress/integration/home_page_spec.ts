//@ts-nocheck

describe("The Home Page", () => {
    it("successfully loads", () => {
        cy.visit("http://localhost:1234");

        cy.get("#btn-add-item").click();
        cy.get("ul").should("contain", "sample");

        cy.get("input").type("hello");
        cy.get("#btn-add-item").click();
        cy.get("ul").should("contain", "sample");
        cy.get("ul").should("contain", "hello");

        cy.get("#btn-remove-0").click();
        cy.get("#btn-remove-0").should("not.exist");
        cy.get("ul").should("contain", "hello");

        cy.get("input").type("world");
        cy.get("#btn-add-item").click();
        cy.get("#btn-remove-0").should("not.exist");
        cy.get("ul").should("contain", "hello");
        cy.get("ul").should("contain", "world");
    });
});
