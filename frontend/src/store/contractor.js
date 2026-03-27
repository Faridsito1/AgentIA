import { reactive } from 'vue'

export const contractorStore = reactive({
    platform: '',
    formData: {
        nombre: '',
        docType: 'cc',
        docNumber: '',
        birthDate: '',
        eps: '',
        password: '',
        periodoMes: '',
        periodoAnio: '',
        supervisorId: ''
    },
    reset() {
        this.platform = ''
        this.formData = {
            nombre: '',
            docType: 'cc',
            docNumber: '',
            birthDate: '',
            eps: '',
            password: '',
            periodoMes: '',
            periodoAnio: '',
            supervisorId: ''
        }
    }
})
