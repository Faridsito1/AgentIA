<template>
  <q-layout view="hHh lpR fFf">

    <!-- HEADER -->
    <q-header
      bordered
      class="bg-white"
      style="border-bottom: 1px solid #e2e8f0;"
    >
      <q-toolbar class="q-px-xl" style="min-height: 68px;">
        <!-- Brand -->
        <div class="row items-center q-gutter-md">
          <div
            class="flex flex-center"
            style="
              width: 40px; height: 40px;
              border: 2px solid #39A900;
              border-radius: 50%;
              background: white;
            "
          >
            <svg width="28" height="28" viewBox="0 0 100 100" fill="#39A900">
              <circle cx="50" cy="50" r="10"/>
              <path
                d="M50 20 L50 35 M50 65 L50 80 M20 50 L35 50 M65 50 L80 50"
                stroke="#39A900" stroke-width="6" fill="none"
              />
              <circle cx="50" cy="50" fill="none" r="35" stroke="#39A900" stroke-width="4"/>
            </svg>
          </div>

          <div class="column" style="line-height: 1.2;">
            <span
              style="
                font-size: 15px;
                font-weight: 800;
                color: #00324D;
                letter-spacing: -0.3px;
              "
            >SENA</span>
            <span
              style="
                font-size: 10px;
                font-weight: 700;
                color: #94a3b8;
                letter-spacing: 0.1em;
                text-transform: uppercase;
              "
            >Gestor de Certificados</span>
          </div>
        </div>

        <q-space />

        <!-- Nav links -->
        <nav class="row items-center q-gutter-lg q-mr-lg gt-sm">
          <a
            href="#"
            class="nav-link"
            style="font-size: 13px; font-weight: 600; color: #475569; text-decoration: none;"
          >Inicio</a>
          <a
            href="#"
            class="nav-link"
            style="font-size: 13px; font-weight: 600; color: #475569; text-decoration: none;"
          >Historial</a>
        </nav>

        <!-- Avatar -->
        <q-avatar size="36px" style="border: 1px solid #e2e8f0;">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDFx9S_DeThUKehczhGlnCtpFikqcEYPs7YNHDF9Z3rgTJBWsKcZLwWt1eQxiaTG58rJul-NrdfPiPEnUUxmN68oG4J54_rK0QUksatrZcv5lskMIjgwvfq05Ty4wm8MozWKRJ-3S2xXr2VrfiGSOlELgx9cbXFN1yKoIstcgP9wsOmnogPIb4LsvaK933eLaFGTE5YTJXSy-yQCOljyYk2EA2zDWxEDpdjDm7GZ6hovWfeQ4YHf5iy-C20Wra3KbjHDibLEfuylA0"
            alt="Avatar"
          />
        </q-avatar>
      </q-toolbar>
    </q-header>

    <!-- MAIN -->
    <q-page-container>
      <q-page
        class="flex flex-center"
        style="background: #f8fafc; padding: 48px 24px;"
      >
        <div style="width: 100%; max-width: 960px;" class="column q-gutter-y-xl">

          <!-- Page title -->
          <div
            style="
              border-left: 4px solid #39A900;
              padding-left: 20px;
            "
          >
            <div
              style="
                font-size: clamp(26px, 4vw, 36px);
                font-weight: 900;
                color: #00324D;
                letter-spacing: -0.6px;
                line-height: 1.15;
                margin-bottom: 8px;
              "
            >Cargue sus datos PILA</div>
            <p style="font-size: 17px; font-weight: 500; color: #475569; margin: 0;">
              ¿Qué plataforma utiliza para sus aportes de seguridad social?
            </p>
          </div>

          <!-- Platform cards grid -->
          <div class="row q-col-gutter-md">
            <div
              v-for="platform in platforms"
              :key="platform.id"
              class="col-12 col-sm-6 col-lg-3"
            >
              <div
                class="platform-card cursor-pointer"
                :class="{ 'platform-card--selected': selectedPlatform === platform.id }"
                style="
                  background: white;
                  border-radius: 12px;
                  border: 2px solid #f1f5f9;
                  padding: 24px;
                  height: 100%;
                  display: flex;
                  flex-direction: column;
                  gap: 16px;
                  transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
                "
                @click="selectedPlatform = platform.id"
              >
                <!-- Icon area -->
                <div
                  style="
                    width: 100%;
                    aspect-ratio: 1;
                    background: #f8fafc;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                  "
                >
                  <div
                    class="icon-circle"
                    :class="{ 'icon-circle--selected': selectedPlatform === platform.id }"
                    style="
                      width: 64px; height: 64px;
                      background: white;
                      border-radius: 50%;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
                      transition: color 0.2s;
                    "
                  >
                    <q-icon
                      :name="platform.icon"
                      size="36px"
                      :color="selectedPlatform === platform.id ? 'sena-green' : 'sena-blue'"
                    />
                  </div>
                </div>

                <!-- Label -->
                <div class="text-center column items-center">
                  <span
                    style="
                      font-size: 18px;
                      font-weight: 800;
                      color: #0f172a;
                      line-height: 1.2;
                    "
                  >{{ platform.name }}</span>
                  <span
                    style="
                      font-size: 10px;
                      font-weight: 600;
                      color: #94a3b8;
                      letter-spacing: 0.08em;
                      text-transform: uppercase;
                      margin-top: 4px;
                    "
                  >{{ platform.subtitle }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="column items-center q-gutter-sm">
            <q-btn
              unelevated
              label="Continuar"
              style="
                min-width: 240px;
                height: 56px;
                border-radius: 8px;
                background: #39A900;
                color: white;
                font-size: 16px;
                font-weight: 700;
              "
              :disable="!selectedPlatform"
              @click="handleContinue"
            />
            <q-btn
              flat
              label="Regresar al paso anterior"
              style="
                font-size: 13px;
                font-weight: 500;
                color: #94a3b8;
              "
              @click="handleGoBack"
            />
          </div>

        </div>
      </q-page>
    </q-page-container>

    <!-- FOOTER -->
    <q-footer style="background: transparent; border-top: 1px solid #f1f5f9;">
      <div class="text-center" style="padding: 28px; font-size: 11px; color: #94a3b8;">
        © 2024 Servicio Nacional de Aprendizaje (SENA)
      </div>
    </q-footer>

  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { contractorStore } from '../store/contractor'

const $q = useQuasar()
const router = useRouter()

const selectedPlatform = ref('soi')

const platforms = [
  {
    id: 'soi',
    name: 'SOI',
    subtitle: 'Portal de pagos',
    icon: 'payments'
  },
  {
    id: 'aportes-en-linea',
    name: 'Aportes en Línea',
    subtitle: 'Operador',
    icon: 'sync_alt'
  },
  {
    id: 'mi-planilla',
    name: 'Mi Planilla',
    subtitle: 'Plataforma PILA',
    icon: 'description'
  },
  {
    id: 'asopagos',
    name: 'Asopagos',
    subtitle: 'Gestión de aportes',
    icon: 'manage_accounts'
  }
]

function handleContinue () {
  if (!selectedPlatform.value) return

  const platform = platforms.find(p => p.id === selectedPlatform.value)
  contractorStore.platform = platform.id

  $q.notify({
    type: 'positive',
    message: `Plataforma seleccionada: ${platform.name}`,
    position: 'top',
    timeout: 2000
  })

  router.push('/contratista/formulario')
}

function handleGoBack() {
    router.push('/')
}
</script>

<style scoped>
.platform-card:hover {
  border-color: #39A900 !important;
  box-shadow: 0 4px 20px rgba(57, 169, 0, 0.1);
}

.platform-card--selected {
  border-color: #39A900 !important;
  background: rgba(57, 169, 0, 0.04) !important;
  box-shadow: 0 4px 20px rgba(57, 169, 0, 0.12);
}

.nav-link:hover {
  color: #39A900 !important;
}
</style>