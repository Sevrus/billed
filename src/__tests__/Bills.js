/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import {bills} from "../fixtures/bills.js"
import {ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import '@testing-library/jest-dom';

import router from "../app/Router.js";
import Bills from "../containers/Bills.js";
import {formatDate} from "../app/format.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    beforeEach(() => {
      document.body.innerHTML = BillsUI({ data: bills });
    });

    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression
      expect(windowIcon).toHaveClass('active-icon');
    })
    test("Then bills should be ordered from earliest to latest", () => {
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
    test("When I click on the New Bill button, handleClickNewBill should navigate to NewBill page", () => {
      const onNavigate = jest.fn();
      const bills = new Bills({ document, onNavigate });

      const newBillButton = screen.getByTestId('btn-new-bill');
      newBillButton.click();

      expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH['NewBill']);
    });
    test("When handleClickIconEye is called, it should display with the correct image", () => {
      const modalMock = jest.fn();
      $.prototype.modal = modalMock;

      const iconEyeElement = document.createElement("div");
      iconEyeElement.setAttribute("data-testID", "icon-eye");
      iconEyeElement.setAttribute("data-bill-url", "https://example.com/bill.pdf");
      document.body.append(iconEyeElement);

      const billInstance = new Bills({ document, onNavigate: jest.fn() });

      billInstance.handleClickIconEye(iconEyeElement);

      const modalBody = document.querySelector(".modal-body");
      const imageElement = modalBody.querySelector("img");

      expect(imageElement).toBeTruthy();
      expect(imageElement.getAttribute("src")).toBe("https://example.com/bill.pdf");
      expect(imageElement.getAttribute("alt")).toBe("Bill");

      expect(modalMock).toHaveBeenCalledWith("show");
    });
  })
  test("When getBills is called, it should return sorted and formatted bills", async () => {
    const storeMock = {
      bills: jest.fn(() => ({
        list: jest.fn(() =>
            Promise.resolve([
              { date: "2022-01-01", status: "accepted" },
              { date: "2023-01-01", status: "pending" },
            ])
        ),
      })),
    };

    const bills = new Bills({ document, onNavigate: jest.fn(), store: storeMock });
    const result = await bills.getBills();

    expect(result).toEqual([
      expect.objectContaining({ date: "1 Jan. 23", status: "En attente", rawDate: "2023-01-01" }),
      expect.objectContaining({ date: "1 Jan. 22", status: "Accepté", rawDate: "2022-01-01" })
    ]);

    expect(storeMock.bills).toHaveBeenCalled();
  });
  test("formatDate should correctly format a date", () => {
    const formattedDate = formatDate("2023-01-01");
    expect(formattedDate).toBe("1 Jan. 23");

    const formattedDate2 = formatDate("2022-01-01");
    expect(formattedDate2).toBe("1 Jan. 22");
  });
  test("When getBills is called with corrupted data, it should return unformatted date", async () => {
    const storeMock = {
      bills: jest.fn(() => ({
        list: jest.fn(() =>
            Promise.resolve([
              { date: "invalid-date", status: "accepted" },
            ])
        ),
      })),
    };

    const bills = new Bills({ document, onNavigate: jest.fn(), store: storeMock });
    const result = await bills.getBills();

    expect(result).toEqual([
      expect.objectContaining({ date: "invalid-date", rawDate: "invalid-date" }),
    ]);
  });
})
