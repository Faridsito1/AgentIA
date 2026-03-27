<template>
  <q-layout view="hHh lpR fFf">

    <!-- HEADER -->
    <q-header bordered class="bg-white" style="border-bottom: 1px solid #e2e8f0;">
      <q-toolbar class="q-px-lg q-px-md-xl" style="min-height: 68px;">
        <!-- Brand -->
        <div class="row items-center q-gutter-sm">
          <div
            class="flex flex-center"
            style="width:40px;height:40px;border-radius:8px;background:rgba(57,169,0,0.1);"
          >
            <q-icon name="verified_user" size="26px" style="color:#39A900;" />
          </div>
          <div class="column" style="line-height:1.2;">
            <span style="font-size:16px;font-weight:700;color:#0f172a;letter-spacing:-0.3px;">
              Gestor de Certificados
            </span>
            <span style="font-size:10px;font-weight:700;color:#39A900;letter-spacing:0.12em;text-transform:uppercase;">
              SENA Colombia
            </span>
          </div>
        </div>

        <q-space />

        <!-- Notifications + Avatar -->
        <div class="row items-center q-gutter-sm">
          <q-btn
            flat round
            style="background:#f1f5f9;color:#475569;"
            @click="() => {}"
          >
            <q-icon name="notifications" size="20px" />
          </q-btn>

          <q-avatar size="40px" style="border:1px solid #e2e8f0;">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuD49E_8LIKmAwJ9T-MIXKx5fIE90wCuukV2_qQJOc3K19nZzXQH786afcGRdkAVwznjOH67ISl7oKJF7fUGeY6lVKSNGgWpBfoyTSd7P705de7Q7SPGO7jH6LV_J-fvJMYslBahPf0oO643fA0yAjNv3AlvDCxaLH0wM4JYP6XUQ0_MD1CK6TMjS4kE55CVi6VohXhRE9FQx3pYlNOCPnl78vD2fjgJWbWLVer6Z4v80jaHfQFxGJYNQOEH4u5mYF2FdAQoaFZT5wE"
              alt="Avatar"
            />
          </q-avatar>
        </div>
      </q-toolbar>
    </q-header>

    <!-- MAIN -->
    <q-page-container>
      <q-page
        class="flex flex-center"
        style="background:#f8fafc;padding:48px 16px;"
      >
        <q-card
          flat bordered
          style="
            width:100%;max-width:560px;
            border-radius:12px;
            border:1px solid #e2e8f0;
            padding:48px 40px;
            box-shadow:0 20px 60px rgba(0,0,0,0.07);
          "
        >
          <div class="column items-center q-gutter-y-lg">

            <!-- Success icon with glow -->
            <div style="position:relative;display:flex;align-items:center;justify-content:center;">
              <!-- Glow -->
              <div
                style="
                  position:absolute;
                  width:120px;height:120px;
                  border-radius:50%;
                  background:rgba(57,169,0,0.18);
                  filter:blur(20px);
                "
              />
              <!-- Circle -->
              <div
                style="
                  position:relative;
                  width:96px;height:96px;
                  border-radius:50%;
                  background:#39A900;
                  display:flex;align-items:center;justify-content:center;
                  box-shadow:0 12px 32px rgba(57,169,0,0.3);
                "
              >
                <q-icon
                  name="check_circle"
                  size="56px"
                  color="white"
                  style="font-variation-settings:'FILL' 1;"
                />
              </div>
            </div>

            <!-- Text -->
            <div class="column items-center text-center q-gutter-y-sm">
              <div
                style="
                  font-size:clamp(22px,4vw,28px);
                  font-weight:800;
                  color:#0f172a;
                  letter-spacing:-0.4px;
                  line-height:1.2;
                "
              >Confirmación de Envío</div>
              <p
                style="
                  font-size:15px;
                  color:#64748b;
                  line-height:1.7;
                  max-width:400px;
                  margin:0;
                "
              >
                Su información se envió con éxito. El sistema recuperará automáticamente
                su certificado y lo enviará a su supervisor.
              </p>
            </div>

            <!-- Divider -->
            <div style="width:100%;height:1px;background:#f1f5f9;" />

            <!-- CTA Button -->
            <q-btn
              unelevated
              class="full-width"
              style="
                height:56px;
                border-radius:8px;
                background:#39A900;
                color:white;
                font-size:15px;
                font-weight:700;
                letter-spacing:0.02em;
                box-shadow:0 6px 20px rgba(57,169,0,0.22);
              "
              @click="handleNuevaSolicitud"
            >
              Enviar otra solicitud
            </q-btn>

            <!-- Help link -->
            <div class="row items-center q-gutter-xs">
              <q-icon name="help_outline" size="18px" style="color:#0056b3;" />
              <a
                href="#"
                style="color:#0056b3;font-size:13px;font-weight:600;text-decoration:none;"
                @click.prevent="$emit('ayuda')"
              >¿Necesita ayuda con su certificado?</a>
            </div>

          </div>
        </q-card>
      </q-page>
    </q-page-container>

  </q-layout>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { contractorStore } from '../store/contractor'

const router = useRouter()

function handleNuevaSolicitud() {
    contractorStore.reset()
    router.push('/')
}
</script>

<style scoped>
:deep(.q-field--outlined .q-field__control) {
  border-radius: 8px;
}
</style>