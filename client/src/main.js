import 'primeicons/primeicons.css'
import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import PrimeVue from 'primevue/config'
import { definePreset } from '@primevue/themes'
import Aura from '@primevue/themes/aura'
import Ripple from 'primevue/ripple';



import ConfirmationService from 'primevue/confirmationservice'

import ToastPlugin from 'vue-toast-notification'
//import 'vue-toast-notification/dist/theme-default.css';
import 'vue-toast-notification/dist/theme-sugar.css'
//import 'vue-toast-notification/dist/theme-bootstrap.css'

const MyPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '{indigo.50}',
      100: '{indigo.100}',
      200: '{indigo.200}',
      300: '{indigo.300}',
      400: '{indigo.400}',
      500: '{indigo.500}',
      600: '{indigo.600}',
      700: '{indigo.700}',
      800: '{indigo.800}',
      900: '{indigo.900}',
      950: '{indigo.950}'
    }
  }
})

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.use(PrimeVue, {
  theme: {
    preset: MyPreset,
    options: {
      prefix: 'p',
      darkModeSelector: '.my-app-dark'
    }
  },
  ripple: true,
  options: {
    cssLayer: {
      name: 'primevue',
      order: 'tailwind-base, primevue, tailwind-utilities'
    }
  }
})

app.directive('ripple', Ripple);

app.use(ConfirmationService)

app.use(ToastPlugin)

app.mount('#app')
