import type { Curso } from "../data/cursos";

type CursoCardProps = {
  curso: Curso;
};

const nivelColors = {
  Principiante: "bg-green-100 text-green-800",
  Intermedio: "bg-yellow-100 text-yellow-800",
  Avanzado: "bg-red-100 text-red-800",
};

export function CursoCard({ curso }: CursoCardProps) {
  const url = curso.url || `https://fixtergeek.com/cursos/${curso.slug}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-blue-300 transition-all duration-200"
    >
      {/* Imagen */}
      <div className="relative aspect-video bg-gray-100 overflow-hidden">
        <img
          src={curso.imagen}
          alt={curso.titulo}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {curso.precio === null && (
          <span className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            GRATIS
          </span>
        )}
        {curso.destacado && curso.precio !== null && (
          <span className="absolute top-2 right-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            DESTACADO
          </span>
        )}
      </div>

      {/* Contenido */}
      <div className="p-4 space-y-3">
        {/* Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${nivelColors[curso.nivel]}`}
          >
            {curso.nivel}
          </span>
          <span className="text-xs text-gray-500">{curso.duracion}</span>
        </div>

        {/* Título */}
        <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {curso.titulo}
        </h3>

        {/* Descripción */}
        <p className="text-sm text-gray-600 line-clamp-2">{curso.descripcion}</p>

        {/* Tags */}
        <div className="flex gap-1 flex-wrap">
          {curso.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Precio */}
        <div className="pt-2 border-t border-gray-100">
          {curso.precio === null ? (
            <span className="text-lg font-bold text-green-600">Gratis</span>
          ) : (
            <span className="text-lg font-bold text-gray-900">
              ${curso.precio}
              <span className="text-sm font-normal text-gray-500"> MXN</span>
            </span>
          )}
        </div>
      </div>
    </a>
  );
}

export function CursosGrid({ cursos }: { cursos: Curso[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cursos.map((curso) => (
        <CursoCard key={curso.id} curso={curso} />
      ))}
    </div>
  );
}
