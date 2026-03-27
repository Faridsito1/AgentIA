<template>
  <q-layout view="hHh lpR fFf">

    <!-- HEADER -->
    <q-header bordered class="bg-white" style="border-bottom: 1px solid #e2e8f0;">
      <q-toolbar class="q-px-lg q-px-md-xl" style="min-height: 68px;">
        <div class="row items-center q-gutter-sm cursor-pointer" @click="$router.push('/')">
          <div class="flex flex-center" style="width:40px;height:40px;border-radius:8px;background:#39A900;">
            <q-icon name="shield_person" color="white" size="22px" />
          </div>
          <div class="column" style="line-height:1.2;">
            <span style="font-size:16px;font-weight:700;color:#00324D;letter-spacing:-0.3px;">SSCM</span>
            <span style="font-size:10px;font-weight:700;color:#39A900;letter-spacing:0.12em;text-transform:uppercase;">SENA Colombia</span>
          </div>
        </div>

        <q-space />

        <q-btn flat dense icon="arrow_back" color="sena-blue" label="Volver al inicio" @click="$router.push('/')" />
      </q-toolbar>
    </q-header>

    <!-- MAIN -->
    <q-page-container>
      <q-page class="flex flex-center" style="background:#f8fafc;padding:48px 16px;">
        <div style="width:100%;max-width:480px;">

          <!-- Form card -->
          <q-card flat bordered style="border-radius:16px;border:1px solid #e2e8f0;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.06);">
            <!-- Card header -->
            <div style="padding:32px 40px;border-bottom:1px solid #f1f5f9;background:#f8fafc;">
              <div style="font-size:26px;font-weight:700;color:#00324D;letter-spacing:-0.4px;margin-bottom:10px;">
                Generar Certificado
              </div>
              <p style="font-size:14px;color:#94a3b8;margin:0;line-height:1.6;">
                Si ya está registrado, ingrese su cédula y seleccione el mes para procesar su certificado automáticamente.
              </p>
            </div>

            <!-- Form body -->
            <q-card-section style="padding:32px 40px;">
              <div class="column q-gutter-y-lg">

                <!-- Doc number -->
                <div>
                  <div class="q-mb-xs">
                    <span style="font-size:13px;font-weight:700;color:#00324D;">Número de Cédula</span>
                  </div>
                  <q-input
                    v-model="form.cedula"
                    outlined
                    dense
                    bg-color="white"
                    placeholder="Ej: 1029384756"
                    style="border-radius:8px;"
                  />
                </div>

                <!-- Period Selection -->
                <div class="row q-col-gutter-lg">
                  <div class="col-12 col-md-6">
                    <div class="q-mb-xs">
                      <span style="font-size:13px;font-weight:700;color:#00324D;">Mes de Cotización</span>
                    </div>
                    <q-select
                      v-model="form.mes"
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
                  <div class="col-12 col-md-6">
                    <div class="q-mb-xs">
                      <span style="font-size:13px;font-weight:700;color:#00324D;">Año</span>
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
                <div style="padding-top:24px;border-top:1px solid #f1f5f9;display:flex;flex-direction:column;align-items:center;gap:16px;">
                  <q-btn
                    unelevated
                    class="full-width"
                    :loading="loading"
                    style="height:56px;border-radius:10px;background:#39A900;color:white;font-size:16px;font-weight:700;box-shadow:0 8px 24px rgba(57,169,0,0.22);"
                    @click="handleSubmit"
                  >
                    <q-icon name="sync" size="20px" class="q-mr-sm" />
                    Procesar Certificado
                  </q-btn>

                  <div class="text-center" style="font-size:13px;color:#94a3b8;cursor:pointer;" @click="$router.push('/contratista/plataforma')">
                    ¿Primera vez? <span style="color:#00324D;font-weight:700;text-decoration:underline;">Regístrese aquí</span>
                  </div>
                </div>

              </div>
            </q-card-section>
          </q-card>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import api from '../services/api'

const $q = useQuasar()
const router = useRouter()
const loading = ref(false)

const form = reactive({
  cedula: '',
  mes: '',
  anio: new Date().getFullYear().toString()
})

const mesOptions = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

async function handleSubmit () {
  if (!form.cedula || !form.mes || !form.anio) {
    $q.notify({ type: 'warning', message: 'Complete cédula, mes y año.', position: 'top' })
    return
  }

  loading.value = true
  try {
    const payload = {
        cedula: form.cedula,
        mes: form.mes,
        anio: form.anio
    }

    const res = await api.post('/auth/login-contratista', payload)
    
    $q.notify({
      type: 'positive',
      message: res.data.msg,
      position: 'top',
      timeout: 2500
    })

    router.push('/contratista/confirmacion')
  } catch (error) {
    console.error(error)
    $q.notify({
      type: 'negative',
      message: error.response?.data?.msg || 'Ocurrió un error (tal vez no está registrado).',
      position: 'top',
      timeout: 3000
    })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
:deep(.q-field--outlined .q-field__control) { border-radius: 8px; }
:deep(.q-field--outlined .q-field__control:before) { border-color: rgba(0, 50, 77, 0.15); }
:deep(.q-field--outlined.q-field--focused .q-field__control:after) { border-color: #00324D; }
</style>
