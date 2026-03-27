<template>
  <q-layout view="hHh lpR fFf">

    <!-- HEADER -->
    <q-header bordered class="bg-white" style="border-bottom: 1px solid #e2e8f0;">
      <q-toolbar class="q-px-lg q-px-md-xl" style="min-height: 68px;">
        <!-- Brand -->
        <div class="row items-center q-gutter-sm">
          <div
            class="flex flex-center"
            style="width:40px;height:40px;border-radius:8px;background:#39A900;"
          >
            <q-icon name="shield_person" color="white" size="22px" />
          </div>
          <div class="column" style="line-height:1.2;">
            <span style="font-size:16px;font-weight:700;color:#00324D;letter-spacing:-0.3px;">SSCM</span>
            <span style="font-size:10px;font-weight:700;color:#39A900;letter-spacing:0.12em;text-transform:uppercase;">SENA Colombia</span>
          </div>
        </div>

        <q-space />

        <div class="gt-xs">
          <span style="font-size:11px;font-weight:700;color:#94a3b8;letter-spacing:0.08em;text-transform:uppercase;">
            Gestor de Certificados
          </span>
        </div>
      </q-toolbar>
    </q-header>

    <!-- MAIN -->
    <q-page-container>
      <q-page style="background:#f8fafc;padding:48px 16px;">
        <div style="width:100%;max-width:672px;margin:0 auto;">

          <!-- Form card -->
          <q-card
            flat bordered
            style="border-radius:16px;border:1px solid #e2e8f0;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.06);"
          >
            <!-- Card header -->
            <div style="padding:32px 40px;border-bottom:1px solid #f1f5f9;background:#f8fafc;">
              <div
                style="font-size:26px;font-weight:700;color:#00324D;letter-spacing:-0.4px;margin-bottom:10px;"
              >Formulario de Datos del Contratista</div>
              <p style="font-size:14px;color:#94a3b8;margin:0;line-height:1.6;">
                Ingrese su información para generar el certificado de aportes a seguridad social.
              </p>
            </div>

            <!-- Form body -->
            <q-card-section style="padding:32px 40px;">
              <div class="column q-gutter-y-lg">

                <!-- Full Name -->
                <div>
                  <div class="q-mb-xs">
                    <span style="font-size:13px;font-weight:700;color:#00324D;">Nombre Completo</span>
                  </div>
                  <q-input
                    v-model="form.nombre"
                    outlined
                    dense
                    bg-color="white"
                    placeholder="Ej: Juan Pérez"
                    style="border-radius:8px;"
                  />
                </div>

                <!-- Supervisor Selection -->
                <div>
                  <div class="q-mb-xs">
                    <span style="font-size:13px;font-weight:700;color:#00324D;">Seleccione su Supervisor</span>
                  </div>
                  <q-select
                    v-model="form.supervisorId"
                    outlined
                    dense
                    bg-color="white"
                    :options="supervisors"
                    emit-value
                    map-options
                    placeholder="Busque a su supervisor"
                    style="border-radius:8px;"
                  />
                </div>

                <!-- Doc type + Doc number -->
                <div class="row q-col-gutter-lg">
                  <div class="col-12 col-md-6">
                    <div class="q-mb-xs">
                      <span style="font-size:13px;font-weight:700;color:#00324D;">Tipo de Documento</span>
                    </div>
                    <q-select
                      v-model="form.docType"
                      outlined
                      dense
                      bg-color="white"
                      :options="docTypeOptions"
                      option-value="value"
                      option-label="label"
                      emit-value
                      map-options
                      placeholder="Seleccione"
                      style="border-radius:8px;"
                    />
                  </div>

                  <div class="col-12 col-md-6">
                    <div class="q-mb-xs">
                      <span style="font-size:13px;font-weight:700;color:#00324D;">Número de Documento</span>
                    </div>
                    <q-input
                      v-model="form.docNumber"
                      outlined
                      dense
                      bg-color="white"
                      placeholder="Ej: 1029384756"
                      style="border-radius:8px;"
                    />
                  </div>
                </div>

                <!-- EPS (if required) -->
                <div class="row q-col-gutter-lg" v-if="isEpsRequired">
                  <div class="col-12 col-md-12">
                    <div class="q-mb-xs">
                      <span style="font-size:13px;font-weight:700;color:#00324D;">EPS</span>
                    </div>
                    <q-select
                      v-model="form.eps"
                      outlined
                      dense
                      bg-color="white"
                      :options="epsOptions"
                      placeholder="Seleccione su EPS"
                      style="border-radius:8px;"
                    />
                  </div>
                </div>

                <!-- Expedition Date & Range (Aportes en Linea) -->
                <div class="column q-gutter-y-lg" v-if="isAportes">
                  <div>
                    <div class="q-mb-xs">
                      <span style="font-size:13px;font-weight:700;color:#00324D;">Fecha de expedición del documento</span>
                    </div>
                    <q-input
                      v-model="form.fechaExpedicion"
                      outlined
                      dense
                      type="date"
                      bg-color="white"
                      style="border-radius:8px;"
                    />
                  </div>

                  <!-- Generar certificado desde -->
                  <div class="row q-col-gutter-sm">
                    <div class="col-12">
                      <span style="font-size:13px;font-weight:700;color:#00324D;">Generar certificado desde</span>
                    </div>
                    <div class="col-6">
                      <q-input
                        v-model="form.desdeAnio"
                        outlined
                        dense
                        bg-color="white"
                        mask="####"
                        placeholder="Año (Ej: 2026)"
                        style="border-radius:8px;"
                      />
                    </div>
                    <div class="col-6">
                      <q-select
                        v-model="form.desdeMes"
                        outlined
                        dense
                        bg-color="white"
                        :options="mesOptions"
                        emit-value
                        map-options
                        placeholder="Mes"
                        style="border-radius:8px;"
                      />
                    </div>
                  </div>

                  <!-- Generar certificado hasta -->
                  <div class="row q-col-gutter-sm">
                    <div class="col-12">
                      <span style="font-size:13px;font-weight:700;color:#00324D;">Generar certificado hasta</span>
                    </div>
                    <div class="col-6">
                      <q-input
                        v-model="form.hastaAnio"
                        outlined
                        dense
                        bg-color="white"
                        mask="####"
                        placeholder="Año (Ej: 2026)"
                        style="border-radius:8px;"
                      />
                    </div>
                    <div class="col-6">
                      <q-select
                        v-model="form.hastaMes"
                        outlined
                        dense
                        bg-color="white"
                        :options="mesOptions"
                        emit-value
                        map-options
                        placeholder="Mes"
                        style="border-radius:8px;"
                      />
                    </div>
                  </div>
                </div>

                <!-- Mi Planilla Fields -->
                <div class="column q-gutter-y-md" v-if="isMiPlanilla">
                  <div class="row q-col-gutter-md">
                    <div class="col-12 col-md-4">
                      <div class="q-mb-xs">
                        <span style="font-size:13px;font-weight:700;color:#00324D;">Día de Pago</span>
                      </div>
                      <q-input
                        v-model="form.diaPago"
                        outlined
                        dense
                        bg-color="white"
                        mask="##"
                        placeholder="Ej: 15"
                        style="border-radius:8px;"
                      />
                    </div>
                    <div class="col-12 col-md-4">
                        <div class="q-mb-xs">
                        <span style="font-size:13px;font-weight:700;color:#00324D;">Mes de Pago</span>
                        </div>
                        <q-select
                        v-model="form.mesPago"
                        outlined
                        dense
                        bg-color="white"
                        :options="mesOptions"
                        emit-value
                        map-options
                        placeholder="Seleccione"
                        style="border-radius:8px;"
                        />
                    </div>
                    <div class="col-12 col-md-4">
                        <div class="q-mb-xs">
                        <span style="font-size:13px;font-weight:700;color:#00324D;">Año de Pago</span>
                        </div>
                        <q-input
                        v-model="form.anioPago"
                        outlined
                        dense
                        bg-color="white"
                        mask="####"
                        placeholder="2026"
                        style="border-radius:8px;"
                        />
                    </div>
                  </div>
                  <div class="row q-col-gutter-md">
                    <div class="col-12 col-md-6">
                      <div class="q-mb-xs">
                        <span style="font-size:13px;font-weight:700;color:#00324D;">Valor total pagado</span>
                      </div>
                      <q-input
                        v-model="form.valorPagado"
                        outlined
                        dense
                        bg-color="white"
                        mask="##########"
                        placeholder="Sin puntos ni comas"
                        style="border-radius:8px;"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <div class="q-mb-xs">
                        <span style="font-size:13px;font-weight:700;color:#00324D;">Número de Planilla</span>
                      </div>
                      <q-input
                        v-model="form.numeroPlanilla"
                        outlined
                        dense
                        bg-color="white"
                        placeholder="Opcional"
                        style="border-radius:8px;"
                      />
                    </div>
                  </div>
                </div>

                <!-- Period Selection (For SOI, Mi Planilla y Asopagos) -->
                <div class="row q-col-gutter-lg" v-if="!isAportes">
                  <div class="col-12 col-md-6">
                    <div class="q-mb-xs">
                      <span style="font-size:13px;font-weight:700;color:#00324D;">Mes Periodo Salud</span>
                    </div>
                    <q-select
                      v-model="form.mes"
                      outlined
                      dense
                      bg-color="white"
                      :options="mesOptions"
                      emit-value
                      map-options
                      placeholder="Seleccione mes"
                      style="border-radius:8px;"
                    />
                  </div>
                  <div class="col-12 col-md-6">
                    <div class="q-mb-xs">
                      <span style="font-size:13px;font-weight:700;color:#00324D;">Año Periodo Salud</span>
                    </div>
                    <q-input
                      v-model="form.anio"
                      outlined
                      dense
                      bg-color="white"
                      mask="####"
                      placeholder="2025"
                      style="border-radius:8px;"
                    />
                  </div>
                </div>

                <!-- Submit -->
                <div
                  style="
                    padding-top:24px;
                    border-top:1px solid #f1f5f9;
                    display:flex;flex-direction:column;align-items:center;gap:16px;
                  "
                >
                  <q-btn
                    unelevated
                    class="full-width"
                    :loading="loading"
                    style="
                      height:56px;
                      border-radius:10px;
                      background:#39A900;
                      color:white;
                      font-size:16px;
                      font-weight:700;
                      box-shadow:0 8px 24px rgba(57,169,0,0.22);
                    "
                    @click="handleSubmit"
                  >
                    <q-icon name="send" size="20px" class="q-mr-sm" />
                    Enviar Solicitud
                  </q-btn>

                  <div class="row items-center q-gutter-xs">
                    <q-icon name="verified_user" color="sena-green" size="18px" />
                    <span style="font-size:13px;color:#94a3b8;">
                      Procesamiento de datos cifrado y seguro.
                    </span>
                  </div>
                </div>

              </div>
            </q-card-section>
          </q-card>

          <!-- Status badges -->
          <div class="row q-col-gutter-md q-mt-lg">

            <div class="col-12 col-sm-4">
              <div class="status-badge">
                <div class="status-icon" style="background:rgba(57,169,0,0.1);">
                  <q-icon name="check_circle" color="sena-green" size="20px" />
                </div>
                <div>
                  <p class="status-label">Sistema</p>
                  <p class="status-value">En Línea</p>
                </div>
              </div>
            </div>

            <div class="col-12 col-sm-4">
              <div class="status-badge">
                <div class="status-icon" style="background:rgba(0,50,77,0.08);">
                  <q-icon name="speed" style="color:#00324D;" size="20px" />
                </div>
                <div>
                  <p class="status-label">Respuesta</p>
                  <p class="status-value">Inmediata</p>
                </div>
              </div>
            </div>

            <div class="col-12 col-sm-4">
              <div class="status-badge">
                <div class="status-icon" style="background:#f1f5f9;">
                  <q-icon name="lock" color="grey-6" size="20px" />
                </div>
                <div>
                  <p class="status-label">Privacidad</p>
                  <p class="status-value">Protegida</p>
                </div>
              </div>
            </div>

          </div>

        </div>
      </q-page>
    </q-page-container>

    <!-- FOOTER -->
    <q-footer style="background:transparent;border-top:1px solid #e2e8f0;">
      <div class="text-center" style="padding:28px;font-size:13px;color:#94a3b8;">
        © 2024 Gestor de Certificados de Seguridad Social SENA. Herramienta Oficial.
      </div>
    </q-footer>

  </q-layout>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { contractorStore } from '../store/contractor'
import api from '../services/api'

const $q = useQuasar()
const router = useRouter()
const loading = ref(false)
const supervisors = ref([])

const form = reactive({
  nombre: '',
  docType: 'cc',
  docNumber: '',
  birthDate: '',
  eps: '',
  password: '',
  confirmPassword: '',
  mes: '',
  anio: new Date().getFullYear().toString(),
  supervisorId: '',
  diaPago: '',
  mesPago: '',
  anioPago: new Date().getFullYear().toString(),
  mesPago: '',
  anioPago: new Date().getFullYear().toString(),
  valorPagado: '',
  numeroPlanilla: '',
  fechaExpedicion: '',
  desdeMes: '',
  desdeAnio: new Date().getFullYear().toString(),
  hastaMes: '',
  hastaAnio: new Date().getFullYear().toString()
})

const docTypeOptions = [
  { value: 'cc',  label: 'Cédula de Ciudadanía' },
  { value: 'ce',  label: 'Cédula de Extranjería' },
  { value: 'nit', label: 'NIT' },
  { value: 'pp',  label: 'Pasaporte' }
]

const mesOptions = [
  { label: 'Enero', value: 'Enero' },
  { label: 'Febrero', value: 'Febrero' },
  { label: 'Marzo', value: 'Marzo' },
  { label: 'Abril', value: 'Abril' },
  { label: 'Mayo', value: 'Mayo' },
  { label: 'Junio', value: 'Junio' },
  { label: 'Julio', value: 'Julio' },
  { label: 'Agosto', value: 'Agosto' },
  { label: 'Septiembre', value: 'Septiembre' },
  { label: 'Octubre', value: 'Octubre' },
  { label: 'Noviembre', value: 'Noviembre' },
  { label: 'Diciembre', value: 'Diciembre' }
]

const epsOptions = [
  'SURA', 'Sanitas', 'Compensar', 'Salud Total', 'Coosalud', 'Nueva EPS', 'Famisanar', 'Otra'
]

const platform = computed(() => contractorStore.platform || 'soi')

const isSoi = computed(() => platform.value === 'soi')
const isAportes = computed(() => platform.value === 'aportes-en-linea')
const isMiPlanilla = computed(() => platform.value === 'mi-planilla')
const isAsopagos = computed(() => platform.value === 'asopagos')

const isEpsRequired = computed(() => isSoi.value || isAportes.value)

onMounted(async () => {
    try {
        const res = await api.get('/auth/supervisors')
        supervisors.value = res.data.map(s => ({
            label: `${s.nombre} - ${s.sede}`,
            value: s._id
        }))
    } catch (error) {
        console.error('Error fetching supervisors:', error)
    }
})

// Autocompletado cuando se escribe la cédula
watch(() => form.docNumber, async (newVal) => {
    if (newVal && newVal.length >= 6) {
        try {
            const res = await api.get(`/auth/check-cedula/${newVal}`)
            if (res.data) {
                const c = res.data
                form.nombre = c.nombre
                form.eps = c.eps
                form.supervisorId = c.supervisorId
                if (c.datosPlataforma?.loginData) {
                    form.docType = c.datosPlataforma.loginData.docType || 'cc'
                }
                $q.notify({
                    message: 'Datos recuperados automáticamente.',
                    color: 'indigo',
                    icon: 'auto_fix_high',
                    position: 'bottom',
                    timeout: 2000
                })
            }
        } catch (e) {
            // Ignorar errores (si no existe el contratista simplemente no autocompleta)
        }
    }
})

async function handleSubmit () {
  if (!form.nombre || !form.docNumber || !form.supervisorId) {
    showWarn('Por favor complete Nombre, Documento y Supervisor.')
    return
  }

  if (!isAportes.value && (!form.mes || !form.anio)) {
    showWarn('Por favor seleccione el periodo (Mes y Año).')
    return
  }

  if (isAportes.value && (!form.desdeMes || !form.desdeAnio || !form.hastaMes || !form.hastaAnio)) {
    showWarn('Para Aportes en Línea, establezca el periodo Desde y Hasta.')
    return
  }

  if (isEpsRequired.value && !form.eps) {
    showWarn('La EPS es obligatoria para esta plataforma.')
    return
  }

  if (isAportes.value && !form.fechaExpedicion) {
    showWarn('La fecha de expedición del documento es obligatoria.')
    return
  }

  if (isMiPlanilla.value) {
    if (!form.diaPago || !form.mesPago || !form.anioPago || !form.valorPagado) {
        showWarn('La fecha de pago de planilla y Valor Pagado son obligatorios para Mi Planilla.')
        return
    }
  }

  loading.value = true
  try {
    const selectedSup = supervisors.value.find(s => s.value === form.supervisorId)
    // Usar mes general, o en caso de Aportes el mes de "Desde"
    const finalMes = isAportes.value ? form.desdeMes : form.mes
    const finalAnio = isAportes.value ? form.desdeAnio : form.anio

    const payload = {
        nombre: form.nombre,
        cedula: form.docNumber,
        eps: form.eps || 'N/A',
        sede: selectedSup ? selectedSup.label.split(' - ')[1] : '',
        plataformaSeguro: platform.value.toUpperCase().replace(/-/g, '_'),
        supervisorId: form.supervisorId,
        datosPlataforma: {
            periodoPago: `${finalMes} ${finalAnio}`,
            fechaPlanilla: new Date(),
            loginData: {
                docType: form.docType,
                diaPago: form.diaPago,
                mesPago: form.mesPago,
                anioPago: form.anioPago,
                valorPagado: form.valorPagado,
                numeroPlanilla: form.numeroPlanilla,
                fechaExpedicion: form.fechaExpedicion,
                desdeMes: form.desdeMes,
                desdeAnio: form.desdeAnio,
                hastaMes: form.hastaMes,
                hastaAnio: form.hastaAnio
            }
        }
    }

    await api.post('/auth/register-contratista', payload)
    contractorStore.formData = { ...form }
    
    $q.notify({
      type: 'positive',
      message: '¡Datos guardados y vinculados correctamente!',
      position: 'top',
      timeout: 2500
    })

    router.push('/contratista/confirmacion')
  } catch (error) {
    console.error(error)
    $q.notify({
      type: 'negative',
      message: error.response?.data?.msg || 'Ocurrió un error al enviar la solicitud.',
      position: 'top',
      timeout: 3000
    })
  } finally {
    loading.value = false
  }
}

function showWarn(msg) {
  $q.notify({ type: 'warning', message: msg, position: 'top', timeout: 2500 })
}
</script>

<style scoped>
/* Input borders */
:deep(.q-field--outlined .q-field__control) {
  border-radius: 8px;
}
:deep(.q-field--outlined .q-field__control:before) {
  border-color: rgba(0, 50, 77, 0.15);
}
:deep(.q-field--outlined.q-field--focused .q-field__control:after) {
  border-color: #00324D;
}

/* Status badges */
.status-badge {
  background: rgba(255,255,255,0.6);
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 14px;
}
.status-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.status-label {
  font-size: 10px;
  font-weight: 700;
  color: #94a3b8;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin: 0 0 2px;
}
.status-value {
  font-size: 13px;
  font-weight: 600;
  color: #00324D;
  margin: 0;
}
</style>