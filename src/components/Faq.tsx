const faqs = [
  {
    question: "¿Tienen local físico?",
    answer:
      "Sí. Estamos en Liberia, Guanacaste, con producto en existencia para ver y llevar el mismo día. También coordinamos instalaciones en el taller."
  },
  {
    question: "¿Qué pasa si no encuentro el producto en el catálogo?",
    answer:
      "Trabajamos con distribuidores de confianza. Cuéntenos qué necesita por WhatsApp o con el formulario de contacto y se lo conseguimos bajo pedido."
  },
  {
    question: "¿Instalan lo que compro?",
    answer:
      "Sí, instalamos todo lo que vendemos: audio y video, iluminación, defensas, estribos, racks, suspensión y más. Se cotiza según el producto y el vehículo."
  },
  {
    question: "¿Hacen polarizado?",
    answer:
      "Sí, ofrecemos servicio de polarizado profesional. Escríbanos por WhatsApp con el tipo de vehículo para cotizarlo."
  },
  {
    question: "¿Cómo sé si una pieza es compatible con mi carro?",
    answer:
      "Cada producto indica si es universal o para un modelo específico. Al cotizar, envíe la marca, el modelo y el año de su vehículo y confirmamos la compatibilidad antes de comprar."
  },
  {
    question: "¿El precio incluye la instalación?",
    answer:
      "Depende del producto. Al cotizar le indicamos el precio del producto y el costo de instalación por aparte, para que decida con toda la información."
  },
  {
    question: "¿Cuánto tarda un producto bajo pedido?",
    answer:
      "Depende del distribuidor y del producto. Al cotizar le confirmamos disponibilidad y el tiempo estimado de entrega."
  },
  {
    question: "¿Qué formas de pago aceptan?",
    answer:
      "Consúltenos por WhatsApp las opciones de pago disponibles al momento de su compra o cotización."
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
