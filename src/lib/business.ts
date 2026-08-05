// Datos del negocio en un solo lugar. Ajuste aqui la direccion exacta,
// el horario real y el enlace de Google Maps del local.
export const business = {
  name: "Auto Decoración G&V",
  shortName: "G&V System",
  city: "Liberia, Guanacaste",
  address: "Liberia, Guanacaste, Costa Rica",
  // Numero al que llegan TODAS las consultas del sitio (WhatsApp).
  // Formato internacional sin signos; 506 es Costa Rica.
  whatsappNumber: "50686282222",
  phoneDisplay: "8628 2222",
  hours: [
    { days: "Lunes a viernes", time: "8:00 a.m. – 5:00 p.m." },
    { days: "Sábado", time: "8:00 a.m. – 4:00 p.m." }
  ],
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=Auto+Decoracion+G%26V+Liberia+Guanacaste",
  instagramUrl: "https://www.instagram.com/autodecor_gvsystem/",
  mapsEmbedUrl:
    "https://www.google.com/maps?q=Auto+Decoracion+G%26V,+Liberia,+Guanacaste&output=embed"
};
