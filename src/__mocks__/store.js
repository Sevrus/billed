// Mocks persistants pour create et update
export const createMock = jest.fn((bill) =>
    Promise.resolve({
        fileUrl: `https://localhost:3456/images/${bill.fileName || 'test.jpg'}`, // File URL simulé dynamiquement
        key: bill && bill.name ? `${bill.name}-${Date.now()}` : '1234'        // Clé unique simulée
    })
);
export const updateMock = jest.fn((bill) =>
    Promise.resolve({
        id: bill?.id || "47qAXb6fIm2zOKkLzMro",
        vat: bill?.vat || "80",
        fileUrl: bill?.fileUrl || "https://firebasestorage.googleapis.com/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
        status: bill?.status || "pending",
        type: bill?.type || "Hôtel et logement",
        commentary: bill?.commentary || "séminaire billed",
        name: bill?.name || "encore",
        fileName: bill?.fileName || "preview-facture-free-201801-pdf-1.jpg",
        date: bill?.date || "2004-04-04",
        amount: bill?.amount || 400,
        commentAdmin: bill?.commentAdmin || "ok",
        email: bill?.email || "a@a",
        pct: bill?.pct || 20
    })
);

export const mockBillFormInputs = [
    { testId: "expense-type", value: "Transports" },
    { testId: "expense-name", value: "Vol Paris-Bordeaux" },
    { testId: "datepicker", value: "2023-04-01" },
    { testId: "amount", value: 42 },
    { testId: "vat", value: "18" },
    { testId: "pct", value: 20 },
    { testId: "commentary", value: "test bill" }
];


const mockedBills = {
    list() {
        return Promise.resolve([
            {
                "id": "47qAXb6fIm2zOKkLzMro",
                "vat": "80",
                "fileUrl": "https://test.storage.tld/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
                "status": "pending",
                "type": "Hôtel et logement",
                "commentary": "séminaire billed",
                "name": "encore",
                "fileName": "preview-facture-free-201801-pdf-1.jpg",
                "date": "2004-04-04",
                "amount": 400,
                "commentAdmin": "ok",
                "email": "a@a",
                "pct": 20
            },
            {
                "id": "BeKy5Mo4jkmdfPGYpTxZ",
                "vat": "",
                "amount": 100,
                "name": "test1",
                "fileName": "1592770761.jpeg",
                "commentary": "plop",
                "pct": 20,
                "type": "Transports",
                "email": "a@a",
                "fileUrl": "https://test.storage.tld/v0/b/billable-677b6.a…61.jpeg?alt=media&token=7685cd61-c112-42bc-9929-8a799bb82d8b",
                "date": "2001-01-01",
                "status": "refused",
                "commentAdmin": "en fait non"
            },
            {
                "id": "UIUZtnPQvnbFnB0ozvJh",
                "name": "test3",
                "email": "a@a",
                "type": "Services en ligne",
                "vat": "60",
                "pct": 20,
                "commentAdmin": "bon bah d'accord",
                "amount": 300,
                "status": "accepted",
                "date": "2003-03-03",
                "commentary": "",
                "fileName": "facture-client-php-exportee-dans-document-pdf-enregistre-sur-disque-dur.png",
                "fileUrl": "https://test.storage.tld/v0/b/billable-677b6.a…dur.png?alt=media&token=571d34cb-9c8f-430a-af52-66221cae1da3"
            },
            {
                "id": "qcCK3SzECmaZAGRrHjaC",
                "status": "refused",
                "pct": 20,
                "amount": 200,
                "email": "a@a",
                "name": "test2",
                "vat": "40",
                "fileName": "preview-facture-free-201801-pdf-1.jpg",
                "date": "2002-02-02",
                "commentAdmin": "pas la bonne facture",
                "commentary": "test2",
                "type": "Restaurants et bars",
                "fileUrl": "https://test.storage.tld/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=4df6ed2c-12c8-42a2-b013-346c1346f732"
            }])

    },
    listEmpty() {
        return Promise.resolve([]);
    },
    listFail() {
        return Promise.reject(new Error('Erreur serveur'))
    },
    create: createMock, // Utilise createMock pour pouvoir tracer et personnaliser
    update: updateMock // Idem pour updateMock
}

export default {
    bills() {
        return mockedBills
    }
}

