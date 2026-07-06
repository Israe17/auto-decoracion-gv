// Busqueda insensible a mayusculas y tildes ("camara" encuentra "Cámara").
export function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}
