export default function manifest() {
  return {
    name: "Eglise De Boumerdes",
    short_name: "EDB",
    description: "Web application for the church of Boumerdes",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ffe08f",
    icons: [
      {
        src: "/images/192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/images/512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    screenshots: [
      {
        src: "/images/screenshots/mobile_dashboard.e",
        sizes: "720x1560",
        type: "image/jpeg",
        form_factor: "narrow",
      },
      {
        src: "/images/screenshots/mobile_events.jpg",
        sizes: "720x1560",
        type: "image/jpeg",
        form_factor: "narrow",
      },
      {
        src: "/images/screenshots/mobile_mass_share.jpg",
        sizes: "720x1560",
        type: "image/jpeg",
        form_factor: "narrow",
      },
      {
        src: "/images/screenshots/mobile_mass.jpg",
        sizes: "720x1560",
        type: "image/jpeg",
        form_factor: "narrow",
      },
      {
        src: "/images/screenshots/mobile_masses.jpg",
        sizes: "720x1560",
        type: "image/jpeg",
        form_factor: "narrow",
      },
      {
        src: "/images/screenshots/mobile_sidebar.jpg",
        sizes: "720x1560",
        type: "image/jpeg",
        form_factor: "narrow",
      },
      {
        src: "/images/screenshots/mobile_song_preview.jpg",
        sizes: "720x1560",
        type: "image/jpeg",
        form_factor: "narrow",
      },
      {
        src: "/images/screenshots/mobile_songs.jpg",
        sizes: "720x1560",
        type: "image/jpeg",
        form_factor: "narrow",
      },
      {
        src: "/images/screenshots/desktop_dashboard.png",
        sizes: "1920x1045",
        type: "image/png",
        form_factor: "wide",
      },
      {
        src: "/images/screenshots/desktop_events.png",
        sizes: "1920x1045",
        type: "image/png",
        form_factor: "wide",
      },
      {
        src: "/images/screenshots/desktop_mass.png",
        sizes: "1920x1045",
        type: "image/png",
        form_factor: "wide",
      },
      {
        src: "/images/screenshots/desktop_masses.png",
        sizes: "1920x1045",
        type: "image/png",
        form_factor: "wide",
      },
      {
        src: "/images/screenshots/desktop_song_preview.png",
        sizes: "1920x1045",
        type: "image/png",
        form_factor: "wide",
      },
      {
        src: "/images/screenshots/desktop_songs.png",
        sizes: "1920x1045",
        type: "image/png",
        form_factor: "wide",
      },
    ],
  };
}
