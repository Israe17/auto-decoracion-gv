const faqs = [
  {
    question: "¿Tienen local físico?",
    answer:
      "Sí. Estamos en Liberia, Guanacaste. Puede visitarnos para ver el producto, llevarlo el mismo día o coordinar la instalación en nuestro taller."
  },
  {
    question: "¿Qué pasa si no encuentro el producto en el catálogo?",
    answer:
      "El catálogo en línea es una selección de nuestro inventario. Cuéntenos qué necesita por WhatsApp o con el formulario de contacto, y lo conseguimos con nuestros distribuidores de confianza."
  },
  {
    question: "¿Instalan lo que compro?",
    answer:
      "Sí. Instalamos todo lo que vendemos — audio y video, iluminación, defensas, estribos, racks y suspensión — con un acabado profesional y la garantía de un solo responsable."
  },
  {
    question: "¿Hacen polarizado?",
    answer:
      "Sí, ofrecemos polarizado profesional: reduce el calor, aumenta la privacidad y mejora la apariencia del vehículo. Indíquenos el tipo de vehículo por WhatsApp y le enviamos la cotización."
  },
  {
    question: "¿Cómo sé si una pieza es compatible con mi carro?",
    answer:
      "Envíenos la marca, el modelo y el año de su vehículo al cotizar, y nuestro equipo confirma la compatibilidad antes de que realice la compra."
  },
  {
    question: "¿El precio incluye la instalación?",
    answer:
      "Le cotizamos ambas opciones: el producto solo y el producto instalado, para que decida con la información completa."
  },
  {
    question: "¿Cuánto tarda un producto bajo pedido?",
    answer:
      "El plazo depende del producto y del distribuidor. Al cotizar le confirmamos la disponibilidad y el tiempo estimado de entrega antes de que se comprometa."
  },
  {
    question: "¿Qué formas de pago aceptan?",
    answer:
      "Escríbanos por WhatsApp y le confirmamos las opciones de pago disponibles para su compra o servicio."
  }
];

export function Faq() {
  return (
    <div className="faq">
      {faqs.map((item) => (
        <details key={item.question}>
          <summary>{item.question}</summary>
          <p>{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
