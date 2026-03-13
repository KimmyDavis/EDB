export default function manifest() {
  return {
    name: 'Eglise De Boumerdes',
    short_name: 'EDB',
    description: 'Web application for the church of Boumerdes',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: "#ffe08f",
    icons: [
      {
        src: '/images/192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/images/512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}