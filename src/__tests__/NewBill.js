/**
 * @jest-environment jsdom
 */

import {fireEvent, screen} from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    describe("When I upload a file", () => {
      test("Then it should accept a file with a valid extension (jpg, jpeg, png)", async () => {
        document.body.innerHTML = NewBillUI();

        const onNavigate = jest.fn();
        const storeMock = {
          bills: jest.fn(() => ({
            create: jest.fn().mockResolvedValue({
              fileUrl: "https://example.com/file.jpg",
              key: "12345"
            })
          }))
        };

        const newBill = new NewBill({
          document,
          onNavigate,
          store: storeMock,
          localStorage: window.localStorage
        });

        const fileInput = screen.getByTestId("file");
        expect(fileInput).toBeInTheDocument();

        const file = new File(["content"], "file.jpg", { type: "image/jpg" });

        const handleChangeFile = jest.spyOn(newBill, "handleChangeFile");
        fileInput.addEventListener("change", newBill.handleChangeFile);

        fireEvent.change(fileInput, {
          target: {
            files: [file]
          }
        });

        await new Promise((resolve) => setTimeout(resolve, 100));

        expect(handleChangeFile).toHaveBeenCalled();

        expect(newBill.fileName).toEqual("file.jpg");
        expect(newBill.fileUrl).toEqual("https://example.com/file.jpg");
        expect(newBill.billId).toEqual("12345");
      });
    });
  });
});
