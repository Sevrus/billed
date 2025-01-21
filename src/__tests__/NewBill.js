/**
 * @jest-environment jsdom
 */

import {fireEvent, screen, waitFor} from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import mockStore, {mockBillFormInputs} from "../__mocks__/store";
import {ROUTES, ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import router from "../app/Router.js";

jest.mock("../app/store", () => {
    return {
        bills: jest.fn(() => ({
            create: jest.fn(() => Promise.resolve({ fileUrl: "mockFileUrl", key: "mockKey" })),
            update: jest.fn(() => Promise.resolve({})),
        }))
    };
});


describe("Given I am connected as an employee", () => {
    describe("When I navigate to NewBill page", () => {
        test("Then mail icon in vertical layout should be highlighted", async () => {
            // Simule un utilisateur connecté
            Object.defineProperty(window, 'localStorage', {value: localStorageMock});
            window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }));

            // Initialise le DOM et configure le routeur
            const root = document.createElement("div");
            root.setAttribute("id", "root");
            document.body.append(root);

            router(); // Charge les routes
            window.onNavigate(ROUTES_PATH.NewBill); // Simule la navigation vers NewBill

            // Attendez que l'icône soit disponible
            await waitFor(() => screen.getByTestId('icon-mail'));

            const mailIcon = screen.getByTestId('icon-mail');

            // Vérifie que l'icône de mail est active
            expect(mailIcon.classList).toContain('active-icon');
        });

    })
    describe("When I am on NewBill Page", () => {
        let newBill;

        beforeEach(() => {
            // Simulation de l'utilisateur connecté
            Object.defineProperty(window, 'localStorage', {value: {getItem: jest.fn(() => JSON.stringify({email: "employee@test.com"}))}});

            // Initialisation du DOM pour la page NewBill
            document.body.innerHTML = NewBillUI();

            // Mock de `onNavigate`
            const onNavigate = (pathname) => {
                document.body.innerHTML = ROUTES({pathname});
            }

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
            //Vérifie que l'objet newBill est correctement initialisé
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
                // Remplissage des champs avec customInputs provenant de store.js
                mockBillFormInputs
                    .forEach((input) =>
                    fireEvent.change(screen.getByTestId(input.testId), {
                        target: { value: input.value },
                    })
                );

                // Simulation de l'ajout d'un fichier
                const fileInput = screen.getByTestId("file");
                const file = new File(["dummy content"], "receipt.jpg", { type: "image/jpeg" });
                fireEvent.change(fileInput, { target: { files: [file] } });

                // Espions sur les méthodes importantes
                const spyUpdateBill = jest.spyOn(newBill, "updateBill");

                // Mock de la fonction handleSubmit
                const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
                const form = screen.getByTestId("form-new-bill");
                form.addEventListener("submit", handleSubmit);

                // Soumission du formulaire
                fireEvent.submit(form);

                // Vérifie que handleSubmit a été appelé
                expect(handleSubmit).toHaveBeenCalled();

                // Vérifie qu'updateBill a été appelé avec les bonnes données
                expect(spyUpdateBill).toHaveBeenCalledWith(
                    expect.objectContaining({
                        type: "Transports",
                        name: "Vol Paris-Bordeaux",
                        date: "2023-04-01",
                        amount: 42,
                        vat: "18",
                        pct: 20,
                        commentary: "test bill",
                        status: "pending",
                    })
                );

                // Vérifie que la page de liste des notes de frais s'affiche correctement
                await waitFor(() => {
                    expect(screen.getByText("Mes notes de frais")).toBeTruthy();
                });
            });
        });
    });
});
