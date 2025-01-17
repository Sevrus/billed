/**
 * @jest-environment jsdom
 */

import {fireEvent, screen, waitFor} from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import mockStore, {createMock} from "../__mocks__/store";

jest.mock("../app/store", () => {
    return {
        bills: jest.fn(() => ({
            create: jest.fn(() => Promise.resolve({ fileUrl: "mockFileUrl", key: "mockKey" })),
            update: jest.fn(() => Promise.resolve({})),
        }))
    };
});


describe("Given I am connected as an employee", () => {
    describe("When I am on NewBill Page", () => {
        let newBill;

        beforeEach(() => {
            // Simulation de l'utilisateur connecté
            Object.defineProperty(window, 'localStorage', {value: {getItem: jest.fn(() => JSON.stringify({email: "employee@test.com"}))}});

            // Initialisation du DOM pour la page NewBill
            document.body.innerHTML = NewBillUI();

            // Mock de `onNavigate`
            const onNavigate = jest.fn();

            //Setup de NewBill pour chaque test
            newBill = new NewBill({
                document,
                onNavigate,
                store: mockStore,
                localStorage: window.localStorage
            });
        });
        test("Then the NewBill form should be rendered", () => {
            const form = screen.getByTestId("form-new-bill"); // Formulaire
            expect(form).toBeTruthy(); // Vérifie que le formulaire est présent
        });
        test("Then it should initialize with default values", () => {
            expect(newBill.fileUrl).toBeNull();
            expect(newBill.fileName).toBeNull();
            expect(newBill.billId).toBeNull();
        });

        describe("When I upload a file", () => {
            test("Then uploading a valid file should work", async () => {
                // Sélection du champ pour l'ajout de fichier
                const fileInput = screen.getByTestId("file");
                const file = new File(['test'], 'test.jpeg', {type: 'image/jpeg'});

                // Ajoute un fichier valide
                fireEvent.change(fileInput, {target: {files: [file]}});

                // Vérifie si le fichier a été accepté sans se vider
                expect(fileInput.files[0].name).toBe('test.jpeg');
            });
            test("Then uploading an invalid file should be rejected", async () => {
                // Sélection du champ pour l'ajout de fichier
                const fileInput = screen.getByTestId("file");
                const file = new File(['test'], 'test.pdf', {type: 'application/pdf'});

                // Ajoute un fichier non valide
                fireEvent.change(fileInput, {target: {files: [file]}});

                // Vérifie que le champ a été réinitialisé
                expect(fileInput.value).toBe("");
            });
            test("Then it should do nothing if no file is selected", () => {
                const fileInput = screen.getByTestId("file");

                // Simule un événement avec aucun fichier
                fireEvent.change(fileInput, {target: {files: []}});

                // Vérifie que la valeur du champ reste vide
                expect(fileInput.value).toBe("");
            });
        });

        describe("When I submit a valid form", () => {
            test("Then the handleSubmit method should be called", () => {
                // Mock de handleSubmit
                const handleSubmit = jest.spyOn(newBill, "handleSubmit");
                const form = screen.getByTestId("form-new-bill");

                // Ajoute un EventListener à la soumission
                form.addEventListener("submit", newBill.handleSubmit );

                // Déclenche un événement de soumission
                fireEvent.submit(form);

                // Vérifie si handleSubmit a été appelé
                expect(handleSubmit).toHaveBeenCalled();
            });
            test("Then the form data should be sent to the API", async () => {
                // Mock sur la fonction de navigation
                const onNavigateMock = jest.fn(); // Simule la fonction de navigation
                newBill = new NewBill({
                    document: document,
                    onNavigate: onNavigateMock,
                    store: mockStore,
                    localStorage: window.localStorage
                });

                // Espionne handleSubmit pour vérifier son appel
                const handleSubmit = jest.spyOn(newBill, "handleSubmit");

                // Remplissage des champs de formulaire
                fireEvent.change(screen.getByTestId("expense-type"), { target: { value: "Transports" } });
                fireEvent.change(screen.getByTestId("expense-name"), { target: { value: "Train ticket" } });
                fireEvent.change(screen.getByTestId("amount"), { target: { value: "100" } });
                fireEvent.change(screen.getByTestId("datepicker"), { target: { value: "2023-10-15" } });
                fireEvent.change(screen.getByTestId("vat"), { target: { value: "20" } });
                fireEvent.change(screen.getByTestId("pct"), { target: { value: "20" } });
                fireEvent.change(screen.getByTestId("commentary"), { target: { value: "Business trip to Paris" } });

                // Ajout d'un fichier valide
                const fileInput = screen.getByTestId("file");
                const file = new File(["test"], "receipt.jpg", { type: "image/jpeg" });
                fireEvent.change(fileInput, { target: { files: [file] } });

                // Ajout du listener pour handleSubmit
                const form = screen.getByTestId("form-new-bill");
                form.addEventListener("submit", newBill.handleSubmit);

                // Soumission du formulaire
                fireEvent.submit(form);

                // Vérifie que handleSubmit a bien été appelé
                expect(handleSubmit).toHaveBeenCalled();

                // Vérifie que createMock a bien été appelé
                await waitFor(() => {
                    expect(createMock).toHaveBeenCalled();
                });

                // Vérifie que createMock a été appelé avec les bonnes données
                expect(createMock).toHaveBeenCalledWith(
                    expect.objectContaining({
                        type: "Transports",
                        name: "Train ticket",
                        amount: 100,
                        vat: "20",
                        pct: 20,
                        commentary: "Business trip to Paris",
                        fileUrl: expect.any(String),
                        fileName: "receipt.jpg",
                        email: "employee@test.com", // Supposant que l'email vient de localStorage
                        date: "2023-10-15"
                    })
                );

                // Vérifie que la navigation vers la page "/bills" a bien eu lieu
                await waitFor(() => {
                    expect(onNavigateMock).toHaveBeenCalledWith("/bills");
                });
            });
        });
    });
});
