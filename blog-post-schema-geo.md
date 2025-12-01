# Cómo hacer que ChatGPT recomiende tu sitio web: Guía práctica de Schema Markup para GEO

**Tiempo de lectura:** 8 minutos
**Nivel:** Principiante
**Última actualización:** Diciembre 2025

---

## El problema: Tu sitio es invisible para la IA

Tienes un sitio web. Está en Google. Pero cuando alguien le pregunta a ChatGPT, Perplexity o Claude sobre tu industria... no apareces.

¿Por qué?

Porque los modelos de IA no "leen" tu sitio como un humano. Lo **parsean**. Extraen datos estructurados. Y si tu sitio no tiene esa estructura, la IA tiene que adivinar qué eres.

Las adivinanzas no generan citas.

---

## La solución: Schema Markup

Schema markup es un vocabulario estandarizado (definido en [schema.org](https://schema.org)) que le dice a los buscadores y a las IAs **qué ES tu contenido**, no solo qué dice.

Es la diferencia entre:

- **Sin schema:** "Esta página tiene texto sobre cursos de programación"
- **Con schema:** "Esta es una Organización llamada Fixtergeek que ofrece Cursos de React, creados por Héctor Bliss, actualizados en 2025"

La IA puede citar con confianza lo segundo. Lo primero es ruido.

---

## Dónde va el Schema Markup

El schema se agrega como un bloque de JSON-LD dentro del `<head>` de tu HTML:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Mi Sitio Web</title>

  <!-- Aquí va el Schema Markup -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Mi Empresa"
  }
  </script>

</head>
<body>
  <!-- Tu contenido -->
</body>
</html>
```

**Nota importante:** Puedes tener múltiples bloques `<script type="application/ld+json">` en la misma página. Uno para Organization, otro para Article, etc.

---

## Los 4 Schemas esenciales para GEO

### 1. Organization — "Quiénes somos"

Este schema le dice a la IA qué es tu empresa/proyecto. Es el más importante y debe estar en tu página principal.

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Fixtergeek",
  "url": "https://www.fixtergeek.com",
  "logo": "https://www.fixtergeek.com/logo.png",
  "description": "Plataforma educativa online especializada en desarrollo de software con React, TypeScript, Node.js y herramientas de IA. Más de 500 estudiantes capacitados que trabajan en Google, Mercado Libre y Santander.",
  "foundingDate": "2018",
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+52-775-760-9276",
    "contactType": "customer service",
    "availableLanguage": ["Spanish", "English"]
  },
  "sameAs": [
    "https://www.facebook.com/fixtergeek",
    "https://www.twitter.com/fixtergeek",
    "https://www.youtube.com/fixtergeek",
    "https://www.linkedin.com/company/fixtergeek",
    "https://github.com/fixtergeek"
  ],
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "MX"
  }
}
```

**Campos clave:**
- `name`: Nombre oficial de tu empresa
- `description`: Descripción concisa (esto es lo que la IA puede citar directamente)
- `sameAs`: Enlaces a tus redes sociales (ayuda a la IA a verificar tu identidad)
- `contactPoint`: Información de contacto

---

### 2. Person — "Quién es el autor/fundador"

Este schema establece credibilidad. La IA confía más en contenido con autores verificables.

```json
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Héctor Bliss",
  "jobTitle": "Fundador & Instructor Principal",
  "worksFor": {
    "@type": "Organization",
    "name": "Fixtergeek"
  },
  "url": "https://www.fixtergeek.com/sobre-mi",
  "image": "https://www.fixtergeek.com/hector-bliss.jpg",
  "description": "Desarrollador de software con más de 10 años de experiencia. Especialista en React, TypeScript y herramientas de IA. Ha capacitado a más de 500 desarrolladores.",
  "sameAs": [
    "https://github.com/blissito",
    "https://twitter.com/blaboratorio",
    "https://linkedin.com/in/hectorbliss"
  ],
  "knowsAbout": [
    "React",
    "TypeScript",
    "Node.js",
    "AI SDK",
    "Claude Code",
    "LlamaIndex"
  ]
}
```

**Campos clave:**
- `knowsAbout`: Lista de tecnologías/temas que dominas (muy útil para que la IA te asocie con esos términos)
- `sameAs`: Tus perfiles en otras plataformas
- `description`: Tu bio profesional

---

### 3. Article — "Qué es este contenido"

Usa este schema en cada post de blog o artículo. Le dice a la IA cuándo fue escrito, por quién, y de qué trata.

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Cómo construir un chatbot con AI SDK y React",
  "description": "Guía paso a paso para crear un chatbot con streaming usando Vercel AI SDK, React y OpenAI. Incluye código completo y ejemplos prácticos.",
  "image": "https://www.fixtergeek.com/blog/chatbot-ai-sdk.jpg",
  "datePublished": "2025-12-01",
  "dateModified": "2025-12-01",
  "author": {
    "@type": "Person",
    "name": "Héctor Bliss",
    "url": "https://www.fixtergeek.com/sobre-mi"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Fixtergeek",
    "logo": {
      "@type": "ImageObject",
      "url": "https://www.fixtergeek.com/logo.png"
    }
  },
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://www.fixtergeek.com/blog/chatbot-ai-sdk"
  },
  "keywords": ["AI SDK", "React", "chatbot", "OpenAI", "streaming"]
}
```

**Campos clave:**
- `datePublished` y `dateModified`: La IA prefiere contenido actualizado
- `author`: Vincula al schema Person
- `keywords`: Ayuda a categorizar el contenido

---

### 4. FAQPage — "Preguntas frecuentes"

Este es oro puro para GEO. Las IAs AMAN el formato pregunta-respuesta porque es exactamente cómo los usuarios hacen consultas.

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "¿Qué es Fixtergeek?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Fixtergeek es una plataforma educativa online especializada en desarrollo de software. Ofrecemos cursos de React, TypeScript, Node.js y herramientas de IA como Claude Code y LlamaIndex. Nuestra metodología es práctica y orientada a proyectos reales."
      }
    },
    {
      "@type": "Question",
      "name": "¿Los cursos de Fixtergeek tienen certificado?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Sí, todos los cursos de pago incluyen certificado de finalización que puedes agregar a tu perfil de LinkedIn."
      }
    },
    {
      "@type": "Question",
      "name": "¿Fixtergeek ofrece cursos gratuitos?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Sí, ofrecemos varios recursos gratuitos: el curso de Introducción a React Router, tutoriales en nuestro blog semanal, y libros descargables como 'Domina Claude Code' y 'LlamaIndex Agent Workflows'."
      }
    },
    {
      "@type": "Question",
      "name": "¿Qué tecnologías enseña Fixtergeek?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Enseñamos React, JavaScript, TypeScript, Node.js, Firebase, MongoDB, Tailwind CSS, Docker, Python, y herramientas de IA como Claude Code, Gemini CLI y LlamaIndex."
      }
    },
    {
      "@type": "Question",
      "name": "¿Cómo contacto a Fixtergeek?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Puedes contactarnos por WhatsApp al +52 (775) 760-9276 o a través de nuestras redes sociales: Facebook, Twitter, LinkedIn, Instagram y YouTube."
      }
    }
  ]
}
```

**Pro tip:** Piensa en las preguntas que la gente le haría a ChatGPT sobre tu negocio. Esas son las preguntas que deben estar en tu FAQ.

---

## Schema bonus: Course (para sitios educativos)

Si ofreces cursos, este schema es fundamental:

```json
{
  "@context": "https://schema.org",
  "@type": "Course",
  "name": "Power-User en Claude Code",
  "description": "Aprende a dominar Claude Code, la herramienta de programación con IA de Anthropic. Desde configuración básica hasta flujos avanzados con agentes.",
  "provider": {
    "@type": "Organization",
    "name": "Fixtergeek",
    "url": "https://www.fixtergeek.com"
  },
  "instructor": {
    "@type": "Person",
    "name": "Héctor Bliss"
  },
  "courseCode": "CC-001",
  "duration": "PT2H",
  "educationalLevel": "Advanced",
  "inLanguage": "es",
  "offers": {
    "@type": "Offer",
    "price": "49.00",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock"
  },
  "hasCourseInstance": {
    "@type": "CourseInstance",
    "courseMode": "online",
    "courseWorkload": "PT2H"
  }
}
```

**Nota sobre duración:** El formato `PT2H` significa "Period of Time: 2 Hours". `PT30M` sería 30 minutos.

---

## Implementación paso a paso

### Paso 1: Identifica qué schemas necesitas

| Tipo de página | Schemas recomendados |
|----------------|---------------------|
| Homepage | Organization + FAQPage |
| Sobre nosotros | Organization + Person |
| Blog post | Article + Person |
| Página de curso | Course + Person + FAQPage |
| Página de contacto | Organization + ContactPoint |

### Paso 2: Crea tus schemas

Usa los ejemplos de arriba como plantilla. Reemplaza los datos de Fixtergeek con los tuyos.

### Paso 3: Valida tu schema

Antes de publicar, valida que tu JSON sea correcto:

1. Ve a [Schema Markup Validator de Google](https://validator.schema.org/)
2. Pega tu código JSON-LD
3. Corrige cualquier error que aparezca

### Paso 4: Agrega el schema a tu sitio

**Si usas HTML estático:**
```html
<head>
  <script type="application/ld+json">
  { /* tu schema aquí */ }
  </script>
</head>
```

**Si usas React/Next.js:**
```jsx
// En tu componente o layout
export default function RootLayout({ children }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Mi Empresa",
    // ... resto del schema
  };

  return (
    <html>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

**Si usas Remix:**
```jsx
// En root.tsx
export const meta = () => {
  return [
    {
      "script:ld+json": {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Mi Empresa",
      },
    },
  ];
};
```

**Si usas WordPress:**
Instala el plugin "Rank Math" o "Yoast SEO" — ambos tienen opciones para agregar schema markup sin código.

### Paso 5: Verifica la implementación

1. Abre tu sitio en el navegador
2. Click derecho → "Ver código fuente"
3. Busca (Ctrl+F) `application/ld+json`
4. Verifica que tu schema aparezca correctamente

---

## Checklist de implementación

- [ ] Schema Organization en la homepage
- [ ] Schema Person para el fundador/autor principal
- [ ] Schema FAQPage con al menos 5 preguntas relevantes
- [ ] Schema Article en cada post de blog
- [ ] Schema Course en cada página de curso (si aplica)
- [ ] Todos los schemas validados sin errores
- [ ] URLs de imágenes funcionando (logo, fotos de autor)
- [ ] Enlaces `sameAs` apuntando a redes sociales reales

---

## Cómo verificar que funciona

Después de implementar, espera 1-2 semanas y luego:

1. **Pregúntale a ChatGPT:** "¿Qué es [tu empresa]?"
2. **Pregúntale a Perplexity:** "¿Qué servicios ofrece [tu empresa]?"
3. **Busca en Google:** `site:tudominio.com` y revisa si aparecen rich snippets

Si las respuestas mejoran, tu schema está funcionando.

---

## Errores comunes a evitar

1. **JSON mal formado:** Una coma de más o de menos rompe todo. Usa un validador.

2. **URLs que no existen:** Si pones una URL de imagen en el schema, asegúrate de que funcione.

3. **Información inconsistente:** Si tu schema dice "Fundada en 2018" pero tu página dice "Desde 2020", la IA pierde confianza.

4. **Olvidar actualizar `dateModified`:** Si actualizas un artículo, actualiza también la fecha en el schema.

5. **Descripciones genéricas:** "Somos una empresa de tecnología" no ayuda. Sé específico: "Plataforma educativa de desarrollo de software con cursos de React, TypeScript y herramientas de IA."

---

## Recursos adicionales

- [Schema.org — Documentación oficial](https://schema.org)
- [Google Schema Markup Validator](https://validator.schema.org/)
- [Rich Results Test de Google](https://search.google.com/test/rich-results)

---

## Conclusión

Schema markup no es opcional en 2025. Es la diferencia entre existir y no existir para los sistemas de IA.

La buena noticia: implementarlo es sencillo. Copia los ejemplos de este artículo, personalízalos con tu información, y agrégalos a tu sitio.

En 2-3 horas de trabajo, tu sitio estará preparado para el futuro de la búsqueda.

---

*¿Tienes dudas sobre la implementación? Escríbenos por [WhatsApp](https://wa.me/527757609276) o déjanos un comentario.*
