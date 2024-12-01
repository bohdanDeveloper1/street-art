// todo: адаптувати activityDetails та addActivity
// зробити можливість додавання активностей до улюблених

import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'
export default defineNuxtConfig({
 build: {
  transpile: ['@vuepic/vue-datepicker', 'vuetify']
},
typescript: {
    typeCheck: true
},

 // default settings for SEO
app: {
  head: {
    charset: 'utf-8',
    viewport: 'width=device-width, initial-scale=1',
    // підключення bootstrap через CDN
    link: [
        // google fonts connection
      {
        rel: 'preconnect',
        href: 'https://fonts.googleapis.com'
      },
      {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com'
      },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700;900&display=swap'
      },
        // bootstrap connection
      {
        rel: 'stylesheet',
        href: "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
      },
    ],
    script: [
      {
        src: "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js",
        tagPosition: 'bodyClose'
      },
    ]
  }
},

 css: ['@/assets/css/base.css', "@/assets/css/main.css"],
 devtools: { enabled: true },

 modules: [
 //vuetify
 (_options, nuxt) => {
   nuxt.hooks.hook('vite:extendConfig', (config) => {
     // @ts-expect-error
     config.plugins.push(vuetify({ autoImport: true }))
   })
 },
 'nuxt3-leaflet',
 '@pinia/nuxt',
 '@vee-validate/nuxt',
 'nuxt-nodemailer'
 ],

 nodemailer: {
    from: '"Street Art" <bogdanbobosko0@gmail.com>',
    host: 'smtp-relay.brevo.com',
    port: 587,
    auth: {
        user: '8003b8001@smtp-brevo.com',
        pass: 'xsmtpsib-118b481f445c13387b0c2ef93e153638dbc9ab32ed53f09d0fc07cf753ddf089-RmyHkWpADQBxMNE9',
    },
 },

 pinia: {
  storesDirs: ['./stores/**'],
},

 vite: {
  vue: {
    template: {
      transformAssetUrls,
    },
  },
},

 ssr: false,
 compatibilityDate: '2024-08-09',
})