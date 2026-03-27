<template>
  <q-layout view="hHh lpR fFf">
    <!-- HEADER -->
    <q-header
      bordered
      class="bg-white text-sena-blue"
      style="border-bottom: 1px solid #e2e8f0;"
    >
      <q-toolbar class="q-px-xl" style="min-height: 68px;">
        <!-- Logo / Brand -->
        <div class="row items-center q-gutter-sm">
          <div
            class="flex flex-center rounded-borders"
            style="
              width: 40px; height: 40px;
              background: #39A900;
              border-radius: 8px;
            "
          >
            <q-icon name="security" color="white" size="22px" />
          </div>

          <div
            class="column"
            style="
              border-left: 1px solid #e2e8f0;
              padding-left: 12px;
              line-height: 1.2;
            "
          >
            <span
              style="
                font-weight: 700;
                font-size: 14px;
                color: #00324D;
                letter-spacing: 0.05em;
                text-transform: uppercase;
              "
            >Seguridad Social</span>
            <span
              style="
                font-size: 10px;
                font-weight: 700;
                color: #39A900;
                letter-spacing: 0.12em;
                text-transform: uppercase;
              "
            >Gestor de Certificados SENA</span>
          </div>
        </div>

        <q-space />

        <!-- Soporte button -->
        <q-btn
          unelevated
          label="Soporte"
          color="sena-blue"
          text-color="white"
          style="
            border-radius: 8px;
            font-weight: 700;
            font-size: 14px;
            padding: 0 20px;
            height: 40px;
          "
        />
      </q-toolbar>
    </q-header>

    <!-- MAIN PAGE CONTAINER -->
    <q-page-container>
      <q-page
        class="flex flex-center"
        style="background: #f8fafc; padding: 48px 24px;"
      >
        <div style="width: 100%; max-width: 440px;">

          <!-- Title block -->
          <div class="text-center q-mb-lg">
            <div
              class="text-weight-bold q-mb-xs"
              style="
                font-size: 28px;
                color: #00324D;
                letter-spacing: -0.5px;
              "
            >Ingreso de Supervisor</div>
            <div style="font-size: 14px; color: #94a3b8;">
              Automatice la obtención de certificados de aportes PILA
            </div>
          </div>

          <!-- Card -->
          <q-card
            flat
            bordered
            style="
              border-radius: 12px;
              border: 1px solid #f1f5f9;
              box-shadow: 0 20px 60px rgba(0,0,0,0.08);
              padding: 32px;
            "
          >
            <q-card-section class="q-pa-none q-gutter-y-md">

              <!-- Email field -->
              <div>
                <div
                  class="q-mb-xs text-weight-semibold"
                  style="font-size: 13px; color: #334155;"
                >Correo Electrónico</div>
                <q-input
                  v-model="form.email"
                  outlined
                  dense
                  type="email"
                  placeholder="supervisor@sena.edu.co"
                  bg-color="grey-1"
                  style="border-radius: 8px;"
                  :input-style="{ fontSize: '14px' }"
                >
                  <template #prepend>
                    <q-icon name="mail" color="grey-5" size="20px" />
                  </template>
                </q-input>
              </div>

              <!-- Password field -->
              <div>
                <div class="row items-center justify-between q-mb-xs">
                  <span
                    class="text-weight-semibold"
                    style="font-size: 13px; color: #334155;"
                  >Contraseña</span>
                  <a
                    href="#"
                    style="
                      font-size: 12px;
                      font-weight: 500;
                      color: #007BFF;
                      text-decoration: none;
                    "
                    @click.prevent
                  >¿Olvidó su contraseña?</a>
                </div>
                <q-input
                  v-model="form.password"
                  outlined
                  dense
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="••••••••"
                  bg-color="grey-1"
                  style="border-radius: 8px;"
                  :input-style="{ fontSize: '14px' }"
                >
                  <template #prepend>
                    <q-icon name="lock" color="grey-5" size="20px" />
                  </template>
                  <template #append>
                    <q-icon
                      :name="showPassword ? 'visibility_off' : 'visibility'"
                      color="grey-5"
                      size="20px"
                      class="cursor-pointer"
                      @click="showPassword = !showPassword"
                    />
                  </template>
                </q-input>
              </div>

              <!-- Remember device -->
              <q-checkbox
                v-model="form.remember"
                label="Recordar este dispositivo"
                color="sena-green"
                dense
                style="font-size: 13px; color: #64748b;"
              />

              <!-- Submit button -->
              <q-btn
                unelevated
                class="full-width"
                :loading="loading"
                style="
                  height: 48px;
                  border-radius: 8px;
                  background: #39A900;
                  color: white;
                  font-size: 15px;
                  font-weight: 700;
                  letter-spacing: 0.01em;
                  box-shadow: 0 8px 24px rgba(57,169,0,0.25);
                "
                @click="handleLogin"
              >
                <span>Iniciar Sesión</span>
                <q-icon name="arrow_forward" size="20px" class="q-ml-sm" />
              </q-btn>

            </q-card-section>
          </q-card>

          <!-- Footer link -->
          <div
            class="text-center q-mt-md"
            style="font-size: 13px; color: #94a3b8;"
          >
            ¿Necesita solicitar acceso?
            <a
              href="#"
              style="
                font-weight: 700;
                color: #007BFF;
                text-decoration: none;
              "
              @click.prevent
            >Contactar al Administrador</a>
          </div>

        </div>
      </q-page>
    </q-page-container>

    <!-- FOOTER -->
    <q-footer style="background: transparent; padding: 24px 0;">
      <div
        class="text-center"
        style="font-size: 11px; color: #94a3b8;"
      >
        © 2024 Gestor de Certificados de Seguridad Social - SENA.
        Todos los derechos reservados.
      </div>
    </q-footer>

  </q-layout>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import api from '../services/api'

const $q = useQuasar()
const router = useRouter()

const showPassword = ref(false)
const loading = ref(false)

const form = reactive({
  email: '',
  password: '',
  remember: false
})

async function handleLogin () {
  if (!form.email || !form.password) {
    $q.notify({
      type: 'warning',
      message: 'Por favor complete todos los campos.',
      position: 'top',
      timeout: 2500
    })
    return
  }

  loading.value = true

  try {
    const res = await api.post('/auth/login-supervisor', {
        email: form.email,
        password: form.password
    })

    localStorage.setItem('token', res.data.token)

    $q.notify({
      type: 'positive',
      message: '¡Sesión iniciada correctamente!',
      position: 'top',
      timeout: 2000
    })

    router.push('/supervisor/dashboard')
  } catch (error) {
    console.error(error)
    $q.notify({
      type: 'negative',
      message: error.response?.data?.msg || 'Credenciales incorrectas. Intente nuevamente.',
      position: 'top',
      timeout: 3000
    })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* Override Quasar outlined input border-radius */
:deep(.q-field--outlined .q-field__control) {
  border-radius: 8px;
}

:deep(.q-field--outlined .q-field__control:before) {
  border-color: #e2e8f0;
}

:deep(.q-field--outlined.q-field--focused .q-field__control:after) {
  border-color: #007BFF;
}
</style>