<template>
  <q-layout view="hHh lpR fFf">

    <!-- HEADER -->
    <q-header
      bordered
      class="bg-white"
      style="border-bottom: 1px solid #f1f5f9;"
    >
      <q-toolbar class="q-px-xl" style="min-height: 68px;">
        <!-- Brand -->
        <div class="row items-center q-gutter-sm">
          <div
            class="flex flex-center"
            style="
              background: #39A900;
              padding: 6px;
              border-radius: 8px;
            "
          >
            <q-icon name="verified_user" color="white" size="24px" />
          </div>
          <span
            style="
              color: #00324D;
              font-size: 18px;
              font-weight: 800;
              letter-spacing: -0.4px;
            "
          >SENA Manager</span>
        </div>

        <q-space />

        <q-btn
          unelevated
          label="Iniciar Sesión"
          style="
            background: #00324D;
            color: white;
            border-radius: 8px;
            font-weight: 700;
            font-size: 13px;
            height: 40px;
            padding: 0 24px;
            box-shadow: 0 4px 12px rgba(0,50,77,0.12);
          "
          @click="goLogin"
        />
      </q-toolbar>
    </q-header>

    <!-- MAIN -->
    <q-page-container>
      <q-page style="background: #ffffff;">
        <section
          style="
            max-width: 1200px;
            margin: 0 auto;
            padding: 80px 24px;
          "
        >

          <!-- Hero text -->
          <div class="text-center q-mb-xl">
            <!-- Badge -->
            <div class="flex flex-center q-mb-md">
              <span
                style="
                  display: inline-flex;
                  align-items: center;
                  padding: 4px 12px;
                  border-radius: 999px;
                  background: rgba(57,169,0,0.1);
                  color: #39A900;
                  font-size: 11px;
                  font-weight: 700;
                  letter-spacing: 0.1em;
                  text-transform: uppercase;
                "
              >Herramienta Oficial</span>
            </div>

            <!-- Title -->
            <div
              style="
                font-size: clamp(28px, 4vw, 44px);
                font-weight: 900;
                color: #00324D;
                line-height: 1.15;
                letter-spacing: -0.8px;
                max-width: 700px;
                margin: 0 auto 16px;
              "
            >
              Gestor de Certificados de
              <span style="color: #39A900;">Seguridad Social</span>
            </div>

            <!-- Subtitle -->
            <p
              style="
                font-size: 16px;
                color: #94a3b8;
                max-width: 480px;
                margin: 0 auto;
              "
            >
              Simplificando la gestión de aportes para la comunidad SENA.
            </p>
          </div>

          <!-- Cards grid -->
          <div class="row q-col-gutter-lg justify-center">

            <!-- Supervisor card -->
            <div class="col-12 col-md-6" style="max-width: 480px;">
              <q-card
                flat
                bordered
                class="cursor-pointer supervisor-card"
                style="
                  border-radius: 16px;
                  border: 1px solid #f1f5f9;
                  overflow: hidden;
                  transition: border-color 0.2s;
                "
              >
                <!-- Image area -->
                <div
                  style="
                    height: 192px;
                    position: relative;
                    overflow: hidden;
                    background: #f8fafc;
                  "
                >
                  <div
                    class="absolute-full flex flex-center"
                    style="background: rgba(0,50,77,0.05);"
                  >
                    <q-icon
                      name="supervisor_account"
                      style="font-size: 80px; color: #00324D; opacity: 0.15;"
                    />
                  </div>
                  <div
                    style="
                      width: 100%; height: 100%;
                      background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuAydJU5FETQpnXoNlXjgGY29YoN7Mk8mnXq_LxEVYSzHo0W3QIiHtMfQOvZact-I0oAb-ikGzqEGzLQTwYdXDS4jajTjp39F4ceB0HoCoZzVK_iMks6HP4j4uUfgdzglQWzi6OEU_gKzkPJBsHlUhECQT7ZQIV9FU9tAO5GjhjwqoUJlVveytwrQepIbzgQvSkzU2FuO3YthpXfGz6OEhH0ae08GpkJ9EX_D9v6Mefnob_96DytUI-o3dZQcevB8CQWx0MQs1dXBOs');
                      background-size: cover;
                      background-position: center;
                    "
                  />
                </div>

                <!-- Content -->
                <div
                  style="
                    padding: 28px 32px 32px;
                    border-top: 4px solid #00324D;
                  "
                >
                  <div class="row items-center q-gutter-sm q-mb-sm">
                    <q-icon name="admin_panel_settings" color="sena-blue" size="22px" />
                    <span
                      style="
                        font-size: 18px;
                        font-weight: 900;
                        color: #00324D;
                      "
                    >Supervisor</span>
                  </div>

                  <p
                    style="
                      font-size: 13px;
                      color: #475569;
                      line-height: 1.65;
                      margin-bottom: 28px;
                    "
                  >
                    Acceda al panel de supervisor y gestione contratistas de manera centralizada.
                  </p>

                  <q-btn
                    unelevated
                    class="full-width"
                    style="
                      height: 48px;
                      border-radius: 10px;
                      background: #00324D;
                      color: white;
                      font-size: 13px;
                      font-weight: 700;
                      box-shadow: 0 8px 20px rgba(0,50,77,0.2);
                    "
                    @click="goSupervisor"
                  >
                    <span>Iniciar Sesión</span>
                    <q-icon name="login" size="18px" class="q-ml-sm" />
                  </q-btn>
                </div>
              </q-card>
            </div>

            <!-- Contratista card -->
            <div class="col-12 col-md-6" style="max-width: 480px;">
              <q-card
                flat
                bordered
                class="cursor-pointer contratista-card"
                style="
                  border-radius: 16px;
                  border: 1px solid #f1f5f9;
                  overflow: hidden;
                  transition: border-color 0.2s;
                "
              >
                <!-- Image area -->
                <div
                  style="
                    height: 192px;
                    position: relative;
                    overflow: hidden;
                    background: #f8fafc;
                  "
                >
                  <div
                    class="absolute-full flex flex-center"
                    style="background: rgba(57,169,0,0.05);"
                  >
                    <q-icon
                      name="upload_file"
                      style="font-size: 80px; color: #39A900; opacity: 0.15;"
                    />
                  </div>
                  <div
                    style="
                      width: 100%; height: 100%;
                      background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuD72c3JRfqkudSCkxMDBkOqhL5850mP4kNwOy52PAPEMewc4VKgWtfQMdeRJg0_XJ5OqFvtRhX2zjwi6xeQObPBgK4NntrLwFawY6Lpc6iATG1D-obYcbfSYW8tKsio6_bvRXV_mpc_BbxfE1K0uRzc08wIHVEA_UgPWUe_n4G3RGuigbpux4VXffI9CQYw8Uc1rStC9o6FQc8GnG0d1NG8_hxmk8xn3hjx5NQyF5Cx46FNSwA3Eg6cZo9PohGUEf1kBTc7ba-IWUA');
                      background-size: cover;
                      background-position: center;
                    "
                  />
                </div>

                <!-- Content -->
                <div
                  style="
                    padding: 28px 32px 32px;
                    border-top: 4px solid #39A900;
                  "
                >
                  <div class="row items-center q-gutter-sm q-mb-sm">
                    <q-icon name="description" color="sena-green" size="22px" />
                    <span
                      style="
                        font-size: 18px;
                        font-weight: 900;
                        color: #00324D;
                      "
                    >Contratista</span>
                  </div>

                  <p
                    style="
                      font-size: 13px;
                      color: #475569;
                      line-height: 1.65;
                      margin-bottom: 28px;
                    "
                  >
                    Cargue sus datos demográficos para obtener su certificado de aportes de forma rápida.
                  </p>

                  <q-btn
                    unelevated
                    class="full-width"
                    style="
                      height: 48px;
                      border-radius: 10px;
                      background: #39A900;
                      color: white;
                      font-size: 13px;
                      font-weight: 700;
                      box-shadow: 0 8px 20px rgba(57,169,0,0.2);
                    "
                    @click="goContratista"
                  >
                    <span>Cargar Datos PILA</span>
                    <q-icon name="cloud_upload" size="18px" class="q-ml-sm" />
                  </q-btn>
                </div>
              </q-card>
            </div>

          </div>
        </section>
      </q-page>
    </q-page-container>

    <!-- FOOTER -->
    <q-footer style="background: #ffffff; border-top: 1px solid #f1f5f9;">
      <div
        style="
          max-width: 1200px;
          margin: 0 auto;
          padding: 36px 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        "
      >
        <!-- Brand -->
        <div class="row items-center q-gutter-sm">
          <div
            style="
              background: rgba(0,50,77,0.06);
              padding: 6px;
              border-radius: 8px;
            "
          >
            <q-icon name="verified_user" size="20px" style="color: #00324D;" />
          </div>
          <span
            style="
              color: #00324D;
              font-weight: 800;
              font-size: 14px;
              letter-spacing: -0.3px;
            "
          >Gestor de Certificados SENA</span>
        </div>

        <!-- Copyright -->
        <p style="font-size: 11px; color: #94a3b8; margin: 0; text-align: center;">
          © 2024 SENA - Servicio Nacional de Aprendizaje. Colombia.
        </p>

        <!-- Decorative dots -->
        <div class="row q-gutter-sm">
          <div
            style="
              width: 6px; height: 6px;
              border-radius: 50%;
              background: #39A900;
            "
          />
          <div
            style="
              width: 6px; height: 6px;
              border-radius: 50%;
              background: #00324D;
            "
          />
        </div>
      </div>
    </q-footer>

  </q-layout>
</template>

<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()

const goLogin = () => router.push('/supervisor/login')
const goSupervisor = () => router.push('/supervisor/login')
const goContratista = () => router.push('/contratista/plataforma')
</script>

<style scoped>
.supervisor-card:hover {
  border-color: rgba(0, 50, 77, 0.2) !important;
  box-shadow: 0 8px 32px rgba(0, 50, 77, 0.08);
}

.contratista-card:hover {
  border-color: rgba(57, 169, 0, 0.2) !important;
  box-shadow: 0 8px 32px rgba(57, 169, 0, 0.08);
}
</style>