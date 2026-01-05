import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const nivelColors = {
    Principiante: "bg-green-100 text-green-800",
    Intermedio: "bg-yellow-100 text-yellow-800",
    Avanzado: "bg-red-100 text-red-800",
};
export function CursoCard({ curso }) {
    const url = curso.url || `https://fixtergeek.com/cursos/${curso.slug}`;
    return (_jsxs("a", { href: url, target: "_blank", rel: "noopener noreferrer", className: "group block bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-blue-300 transition-all duration-200", children: [_jsxs("div", { className: "relative aspect-video bg-gray-100 overflow-hidden", children: [_jsx("img", { src: curso.imagen, alt: curso.titulo, className: "w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" }), curso.precio === null && (_jsx("span", { className: "absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full", children: "GRATIS" })), curso.destacado && curso.precio !== null && (_jsx("span", { className: "absolute top-2 right-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full", children: "DESTACADO" }))] }), _jsxs("div", { className: "p-4 space-y-3", children: [_jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [_jsx("span", { className: `text-xs font-medium px-2 py-0.5 rounded-full ${nivelColors[curso.nivel]}`, children: curso.nivel }), _jsx("span", { className: "text-xs text-gray-500", children: curso.duracion })] }), _jsx("h3", { className: "font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors", children: curso.titulo }), _jsx("p", { className: "text-sm text-gray-600 line-clamp-2", children: curso.descripcion }), _jsx("div", { className: "flex gap-1 flex-wrap", children: curso.tags.slice(0, 3).map((tag) => (_jsx("span", { className: "text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded", children: tag }, tag))) }), _jsx("div", { className: "pt-2 border-t border-gray-100", children: curso.precio === null ? (_jsx("span", { className: "text-lg font-bold text-green-600", children: "Gratis" })) : (_jsxs("span", { className: "text-lg font-bold text-gray-900", children: ["$", curso.precio, _jsx("span", { className: "text-sm font-normal text-gray-500", children: " MXN" })] })) })] })] }));
}
export function CursosGrid({ cursos }) {
    return (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: cursos.map((curso) => (_jsx(CursoCard, { curso: curso }, curso.id))) }));
}
