import {ROUTES_PATH} from '../constants/routes.js'
import {formatDate, formatStatus} from "../app/format.js"
import Logout from "./Logout.js"

export default class {
    constructor({document, onNavigate, store, localStorage}) {
        this.document = document
        this.onNavigate = onNavigate
        this.store = store
        const buttonNewBill = document.querySelector(`button[data-testid="btn-new-bill"]`)
        if (buttonNewBill) buttonNewBill.addEventListener('click', this.handleClickNewBill)
        const iconEye = document.querySelectorAll(`div[data-testid="icon-eye"]`)
        if (iconEye) iconEye.forEach(icon => {
            icon.addEventListener('click', () => this.handleClickIconEye(icon))
        })
        new Logout({document, localStorage, onNavigate})
    }

    handleClickNewBill = () => {
        this.onNavigate(ROUTES_PATH['NewBill'])
    }

    handleClickIconEye = (icon) => {
        const billUrl = icon.getAttribute("data-bill-url")
        const modalFile = $('#modaleFile');
        const imgWidth = Math.floor(modalFile.width() * 0.5)
        modalFile.find(".modal-body").html(`<div style='text-align: center;' class="bill-proof-container"><img width=${imgWidth} src=${billUrl} alt="Bill" /></div>`)
        modalFile.modal('show')
    }

    getBills = () => {
        if (this.store) {
            return this.store
                .bills()
                .list()
                .then(snapshot => {
                    const sortedSnapshot = snapshot.sort((a,b) => new Date(b.date) - new Date(a.date));
                    return sortedSnapshot
                        .map(doc => {
                            try {
                                return {
                                    ...doc,
                                    rawDate: doc.date,
                                    date: formatDate(doc.date),
                                    status: formatStatus(doc.status)
                                }
                            } catch (e) {
                                // if for some reason, corrupted data was introduced, we manage here failing formatDate function
                                // log the error and return unformatted date in that case
                                return {
                                    ...doc,
                                    rawDate: doc.date,
                                    date: doc.date,
                                    status: formatStatus(doc.status)
                                }
                            }
                        })
                })
        }
    }
}
