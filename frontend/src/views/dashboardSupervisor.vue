<template>
  <q-layout view="lHh Lpr lFf" style="background: #f8fafc;">
    
    <!-- HEADER -->
    <q-header elevated class="bg-white text-dark" style="height: 64px;">
      <q-toolbar class="full-height">
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="drawerOpen = !drawerOpen" />
        <q-toolbar-title class="text-weight-bold text-sena-blue">
          Panel de Control
        </q-toolbar-title>
        
        <q-space />
        
        <div class="q-gutter-sm row items-center no-wrap">
          <q-btn flat round dense icon="notifications">
            <q-badge color="red" floating>2</q-badge>
          </q-btn>
          <q-btn flat round dense icon="account_circle">
            <q-menu>
              <q-list style="min-width: 150px">
                <q-item clickable v-close-popup @click="handleLogout">
                  <q-item-section avatar><q-icon name="logout" /></q-item-section>
                  <q-item-section>Cerrar Sesión</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>

    <!-- SIDEBAR -->
    <q-drawer
      v-model="drawerOpen"
      show-if-above
      bordered
      :width="260"
      class="bg-white"
    >
      <div class="q-pa-md text-center q-mt-md">
        <q-avatar size="80px" class="q-mb-sm shadow-2">
          <img src="https://ui-avatars.com/api/?name=SENA&background=39A900&color=fff">
        </q-avatar>
        <div class="text-weight-bold text-sena-blue">{{ supervisor.nombre }}</div>
        <div class="text-caption text-grey-7">{{ supervisor.sede }}</div>
      </div>

      <q-scroll-area class="fit q-mt-md">
        <q-list padding>
          <q-item
            clickable
            v-ripple
            :active="activeNav === 'dashboard'"
            @click="activeNav = 'dashboard'"
            active-class="text-sena-green bg-green-1"
          >
            <q-item-section avatar><q-icon name="dashboard" /></q-item-section>
            <q-item-section>Dashboard</q-item-section>
          </q-item>

          <q-item
            clickable
            v-ripple
            :active="activeNav === 'instructores'"
            @click="activeNav = 'instructores'"
            active-class="text-sena-green bg-green-1"
          >
            <q-item-section avatar><q-icon name="people" /></q-item-section>
            <q-item-section>Instructores</q-item-section>
          </q-item>

          <q-separator q-my-md />

          <q-item clickable v-ripple @click="linkGoogleDrive">
            <q-item-section avatar><q-icon name="cloud_sync" color="blue" /></q-item-section>
            <q-item-section>Vincular Google Drive</q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <!-- CONTENT -->
    <q-page-container>
      <q-page class="q-pa-lg">
        <div class="row q-col-gutter-lg">
          
          <!-- Summary Cards -->
          <div class="col-12 col-md-3">
            <q-card flat bordered class="stat-card">
              <q-card-section>
                <div class="text-caption text-grey-7">Total Instructores</div>
                <div class="text-h4 text-weight-bolder text-sena-blue">{{ instructors.length }}</div>
              </q-card-section>
              <q-inner-loading :showing="loading"><q-spinner-oval color="primary" /></q-inner-loading>
            </q-card>
          </div>

          <div class="col-12 col-md-3">
            <q-card flat bordered class="stat-card border-green">
              <q-card-section>
                <div class="text-caption text-grey-7">Descargados</div>
                <div class="text-h4 text-weight-bolder text-positive">{{ instructors.filter(i => i.estado === 'DESCARGADO').length }}</div>
              </q-card-section>
              <q-inner-loading :showing="loading"><q-spinner-oval color="primary" /></q-inner-loading>
            </q-card>
          </div>

          <!-- Filters -->
          <div class="col-12">
            <div class="row q-gutter-md items-center justify-between">
              <div class="row q-gutter-md">
                <q-select
                  v-model="selectedMonth"
                  :options="months"
                  outlined
                  dense
                  bg-color="white"
                  style="min-width: 150px;"
                  label="Mes"
                />
                <q-select
                  v-model="selectedYear"
                  :options="years"
                  outlined
                  dense
                  bg-color="white"
                  style="min-width: 120px;"
                  label="Año"
                />
              </div>
              <q-btn color="sena-green" icon="refresh" label="Actualizar" @click="fetchData" />
            </div>
          </div>

          <!-- Main Table -->
          <div class="col-12">
            <q-card flat bordered>
              <q-table
                :rows="instructors"
                :columns="columns"
                row-key="id"
                flat
                :loading="loading"
              >
                <template v-slot:body-cell-estado="props">
                  <q-td :props="props">
                    <q-chip
                      :color="getStatusColor(props.row.estado)"
                      text-color="white"
                      dense
                      class="text-weight-bold"
                    >
                      {{ props.row.estado }}
                    </q-chip>
                  </q-td>
                </template>

                <template v-slot:body-cell-acciones="props">
                  <q-td :props="props" class="q-gutter-sm">
                    <q-btn v-if="props.row.url" flat round color="primary" icon="visibility" title="Ver en Drive" @click="openUrl(props.row.url)" />
                    <q-btn flat round color="info" icon="history" title="Historial" />
                  </q-td>
                </template>
              </q-table>
            </q-card>
          </div>

        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import api from '../services/api'

const $q = useQuasar()
const router = useRouter()
const loading = ref(true)
const drawerOpen = ref(true)
const activeNav = ref('dashboard')
const supervisor = ref({ nombre: '', sede: '', email: '' })
const instructors = ref([])

const selectedYear = ref('2025')
const selectedMonth = ref('Marzo')

const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
const years = ['2024', '2025', '2026']

const columns = [
  { name: 'nombre', align: 'left', label: 'Instructor', field: 'nombre', sortable: true },
  { name: 'cedula', align: 'left', label: 'Cédula', field: 'cedula' },
  { name: 'sede', align: 'left', label: 'Sede', field: 'sede' },
  { name: 'estado', align: 'center', label: 'Estado', field: 'estado', sortable: true },
  { name: 'acciones', align: 'center', label: 'Acciones', field: 'acciones' }
]

onMounted(() => {
    fetchData()
})

watch([selectedYear, selectedMonth], () => {
    fetchData()
})

async function fetchData() {
    loading.value = true
    try {
        const supRes = await api.get('/auth/dashboard')
        supervisor.value = supRes.data

        const reportRes = await api.get(`/contratistas/reports/${selectedYear.value}/${selectedMonth.value}`)
        instructors.value = reportRes.data
    } catch (error) {
        console.error(error)
        if (error.response?.status === 401) {
            router.push('/supervisor/login')
        }
    } finally {
        loading.value = false
    }
}

async function linkGoogleDrive() {
    try {
        const res = await api.get('/google/auth')
        window.location.href = res.data.url
    } catch (error) {
        $q.notify({ type: 'negative', message: 'Error al vincular Google Drive' })
    }
}

function handleLogout() {
    localStorage.removeItem('token')
    router.push('/')
}

function getStatusColor(status) {
    if (status === 'DESCARGADO') return 'positive'
    if (status === 'ERROR') return 'negative'
    return 'warning'
}

function openUrl(url) {
    window.open(url, '_blank')
}
</script>

<style scoped>
.text-sena-blue { color: #00324D; }
.text-sena-green { color: #39A900; }
.bg-sena-green { background: #39A900; }

.stat-card {
  border-radius: 12px;
  background: white;
  transition: transform 0.2s;
}
.stat-card:hover { transform: translateY(-5px); }

.border-green { border-left: 5px solid #39A900; }
</style>